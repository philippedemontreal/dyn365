namespace myclient.myproject.common {
    type getFetchXmlFn = () => string;
    
    export class gridHandler {
        //The grid control to add functionality
        private grid: Xrm.Controls.GridControl;
        //Function to retrieve the fetchml to use when the grid is loaded to retrieve record count
        private getFetchXml: getFetchXmlFn;
        //entityName used in webapi
        private entityName: string;
        //Xrm form context
        private context: Xrm.FormContext;

        constructor(context: Xrm.FormContext, entityname: string, getFetchXml: getFetchXmlFn, grid: Xrm.Controls.GridControl) {
            this.context = context;
            this.grid = grid;
            this.entityName = entityname;
            this.getFetchXml = getFetchXml;
            this.grid.addOnLoad(this.onLoad);
        }

        //function used when the record count is retrieved either from grid or webapi
        private onRecordCountRetrieved = (totalRecordCount: number) => {
            this.context.ui.setFormNotification(`Grid '${this.grid.getName()}' a total of ${totalRecordCount} record(s).`, "INFO", this.grid.getName());
            console.log(`Grid '${this.grid.getName()}' has a total of ${totalRecordCount} record(s).`);
        };

        //function used on the grid event, onLoad
        private onLoad = async () => {
            let grid = this.grid.getGrid();
            //let self = this;
            let recordCount: number = grid.getTotalRecordCount();
            if (recordCount === -1) { //Use webapi to get the real count
                try {
                    let fetchXml = this.getFetchXml();
                    if (!fetchXml) {
                        console.log(`No fetchXml...`);
                        return;
                    }
                    console.log(`Retrieving count using fetchXml...`);
                    fetchXml = "?fetchXml=" + encodeURIComponent(fetchXml);
                    var result = await Xrm.WebApi.online.retrieveMultipleRecords(this.entityName, fetchXml);
                    //self.onRecordCountRetrieved(result.entities[0].count);
                    this.onRecordCountRetrieved(result.entities[0].count);
                } catch (error) {
                    console.error(error && error.message ? error.message : `Unknown error occured`);
                }
            } else {
                this.onRecordCountRetrieved(recordCount);
            }
        }
    }
}

namespace myclient.myproject.events {
    export class accountform {

        private static contactGrid: common.gridHandler;

        public static onLoad(eventcontext: Xrm.Events.EventContext) {

            let context = eventcontext.getFormContext();
            console.log(`Loading account form...`);

            let entity = context.data.entity;
            let grid = context.getControl<Xrm.Controls.GridControl>("Contacts");

            accountform.contactGrid = new common.gridHandler(
                context,
                entity.getEntityName(),
                () => {
                    let entityId = entity.getId();
                    if (entity !== null) {
                        return;
                    }

                    let fetchXml =
                        `<fetch distinct='false' mapping='logical' aggregate='true'>
<entity name='contact'>
<attribute name='contactid' aggregate='count' alias='count'/>
<filter type='and'>
<condition attribute='parentcustomerid' operator='eq' value='${entityId.replace('{', '').replace('}', '')}'/>
<condition attribute='statecode' operator='eq' value='0'/>
</filter>
</entity>
</fetch>`;
                    return fetchXml;
                }, grid);
        }
    }
}
