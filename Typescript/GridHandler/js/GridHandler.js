var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var myclient;
(function (myclient) {
    var myproject;
    (function (myproject) {
        var common;
        (function (common) {
            class gridHandler {
                constructor(context, entityname, getFetchXml, grid) {
                    //function used when the record count is retrieved either from grid or webapi
                    this.onRecordCountRetrieved = (totalRecordCount) => {
                        this.context.ui.setFormNotification(`Grid '${this.grid.getName()}' a total of ${totalRecordCount} record(s).`, "INFO", this.grid.getName());
                        console.log(`Grid '${this.grid.getName()}' has a total of ${totalRecordCount} record(s).`);
                    };
                    //function used on the grid event, onLoad
                    this.onLoad = () => __awaiter(this, void 0, void 0, function* () {
                        let grid = this.grid.getGrid();
                        //let self = this;
                        let recordCount = grid.getTotalRecordCount();
                        if (recordCount === -1) { //Use webapi to get the real count
                            try {
                                let fetchXml = this.getFetchXml();
                                if (!fetchXml) {
                                    console.log(`No fetchXml...`);
                                    return;
                                }
                                console.log(`Retrieving count using fetchXml...`);
                                fetchXml = "?fetchXml=" + encodeURIComponent(fetchXml);
                                var result = yield Xrm.WebApi.online.retrieveMultipleRecords(this.entityName, fetchXml);
                                //self.onRecordCountRetrieved(result.entities[0].count);
                                this.onRecordCountRetrieved(result.entities[0].count);
                            }
                            catch (error) {
                                console.error(error && error.message ? error.message : `Unknown error occured`);
                            }
                        }
                        else {
                            this.onRecordCountRetrieved(recordCount);
                        }
                    });
                    this.context = context;
                    this.grid = grid;
                    this.entityName = entityname;
                    this.getFetchXml = getFetchXml;
                    this.grid.addOnLoad(this.onLoad);
                }
            }
            common.gridHandler = gridHandler;
        })(common = myproject.common || (myproject.common = {}));
    })(myproject = myclient.myproject || (myclient.myproject = {}));
})(myclient || (myclient = {}));
(function (myclient) {
    var myproject;
    (function (myproject) {
        var events;
        (function (events) {
            class accountform {
                static onLoad(eventcontext) {
                    let context = eventcontext.getFormContext();
                    console.log(`Loading account form...`);
                    let entity = context.data.entity;
                    let grid = context.getControl("Contacts");
                    accountform.contactGrid = new myproject.common.gridHandler(context, entity.getEntityName(), () => {
                        let entityId = entity.getId();
                        if (entity !== null) {
                            return;
                        }
                        let fetchXml = `<fetch distinct='false' mapping='logical' aggregate='true'>
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
            events.accountform = accountform;
        })(events = myproject.events || (myproject.events = {}));
    })(myproject = myclient.myproject || (myclient.myproject = {}));
})(myclient || (myclient = {}));
//# sourceMappingURL=GridHandler.js.map
