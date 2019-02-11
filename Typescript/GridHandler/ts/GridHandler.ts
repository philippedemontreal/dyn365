namespace  myclient.myproject.common {
    export class gridHandler
    {
        private grid: Xrm.Controls.GridControl;
        private fetchXml: string;
        private entityName: string;
        private context: Xrm.FormContext;
    
        constructor(context: Xrm.FormContext, entityname: string, fetchXml: string, grid: Xrm.Controls.GridControl)
        {
            this.context = context;
            this.grid = grid;
            this.entityName = entityname;
            this.fetchXml = "?fetchXml=" +  encodeURIComponent(fetchXml);                              
            this.grid.addOnLoad(this.onLoad);
        }
        
        private onRecordCountRetrieved = (totalRecordCount:number) => {
            this.context.ui.setFormNotification(`Grid '${this.grid.getName()}' a total of ${totalRecordCount} record(s).`, "INFO", this.grid.getName());
            console.log(`Grid '${this.grid.getName()}' has a total of ${totalRecordCount} record(s).`);
        };

         private onLoad = async () => {  
            let grid = this.grid.getGrid();
            //let self = this;
            let recordCount: number = grid.getTotalRecordCount();
            if (recordCount === -1) {
                try {
                    var result = await Xrm.WebApi.online.retrieveMultipleRecords(this.entityName, this.fetchXml);
                    //self.onRecordCountRetrieved(result.entities[0].count);
                    this.onRecordCountRetrieved(result.entities[0].count);
                        
                } catch (error) {
                    console.error(error);                    
                }

            } else {
                this.onRecordCountRetrieved(recordCount);
            }
        }
    }   
}

namespace  myclient.myproject.events {
    export class accountform {
        
        private static contactGrid : common.gridHandler;

        private static Initialize(context: Xrm.FormContext, entity: Xrm.Entity){
            console.log(`Initializing contact grid...`);

            let grid = context.getControl<Xrm.Controls.GridControl>("Contacts");           
            let fetchXml =           
`<fetch distinct='false' mapping='logical' aggregate='true'>
<entity name='contact'>
<attribute name='contactid' aggregate='count' alias='count'/>
<filter type='and'>
<condition attribute='parentcustomerid' operator='eq' value='${entity.getId().replace('{', '').replace('}', '')}'/>
<condition attribute='statecode' operator='eq' value='0'/>
</filter>
</entity>
</fetch>`;      
                
            accountform.contactGrid = new common.gridHandler(context, entity.getEntityName(), fetchXml, grid);      
        }

        
        public static onLoad(eventcontext: Xrm.Events.EventContext) {       
         
            console.log(`Loading account form...`);
            if (!accountform.contactGrid){
                let context = eventcontext.getFormContext();
                let entity = context.data.entity;
                let entityId = entity.getId();
                if (entityId !== null) {
                    accountform.Initialize(context, entity);
                }                   
            }
        }        
    }
}

