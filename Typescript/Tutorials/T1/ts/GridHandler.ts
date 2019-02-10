namespace  myClient.myProject.common {
    export class gridHandler
    {
        private grid: Xrm.Controls.GridControl;
        private fetchXml: string;
        private context: Xrm.FormContext;
    
        constructor(context: Xrm.FormContext, grid: Xrm.Controls.GridControl)
        {
            this.grid = grid;
            let entityId = context.data.entity.getId();
            let fetchXml =           
`<fetch distinct='false' mapping='logical' aggregate='true'>
<entity name='contact'>
<attribute name='contactid' aggregate='count' alias='count'/>
<filter type='and'>
<condition attribute='parentcustomerid' operator='eq' value='${entityId.replace('{', '').replace('}', '')}'/>
</filter>
</entity>
</fetch>`;
            

            this.context = context;
            this.fetchXml = "?fetchXml=" +  encodeURIComponent(fetchXml);                              
            this.grid.addOnLoad(this.onLoad);
        }
        
        
        private onRecordCountRetrieved = (totalRecordCount:number) => {
            this.context.ui.setFormNotification(`Grid '${this.grid.getName()}' has a total of ${totalRecordCount} record(s)`, "INFO", this.grid.getName());
            console.error(`Grid '${this.grid.getName()}' has ${totalRecordCount} total records`);
        };

         private onLoad = async () => {  
            let grid = this.grid.getGrid();
            let self = this;
            if (grid.getTotalRecordCount() === -1) {
                try {
                    var result = await Xrm.WebApi.online.retrieveMultipleRecords("contact", this.fetchXml);
                    self.onRecordCountRetrieved(result.entities[0].count);
                        
                } catch (error) {
                    console.error(error);                    
                }

            } else {
                this.onRecordCountRetrieved(grid.getTotalRecordCount());
            }
        }
    }   
}

namespace  myClient.myProject
{
    export  class MyCustomEntityForm
    {
        private static contactGrid : common.gridHandler;

        public static onEntityLoad = function(formcontext: Xrm.Events.EventContext) 
        {
            let context = formcontext.getFormContext();
            MyCustomEntityForm.contactGrid = new common.gridHandler(context, context.getControl<Xrm.Controls.GridControl>("Contacts"));
        }
    }
}

