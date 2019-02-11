"use strict";
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
                constructor(context, entityname, fetchXml, grid) {
                    this.onRecordCountRetrieved = (totalRecordCount) => {
                        this.context.ui.setFormNotification(`Grid '${this.grid.getName()}' a total of ${totalRecordCount} record(s).`, "INFO", this.grid.getName());
                        console.log(`Grid '${this.grid.getName()}' has a total of ${totalRecordCount} record(s).`);
                    };
                    this.onLoad = () => __awaiter(this, void 0, void 0, function* () {
                        let grid = this.grid.getGrid();
                        let recordCount = grid.getTotalRecordCount();
                        if (recordCount === -1) {
                            try {
                                var result = yield Xrm.WebApi.online.retrieveMultipleRecords(this.entityName, this.fetchXml);
                                this.onRecordCountRetrieved(result.entities[0].count);
                            }
                            catch (error) {
                                console.error(error);
                            }
                        }
                        else {
                            this.onRecordCountRetrieved(recordCount);
                        }
                    });
                    this.context = context;
                    this.grid = grid;
                    this.entityName = entityname;
                    this.fetchXml = "?fetchXml=" + encodeURIComponent(fetchXml);
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
                static Initialize(context, entity) {
                    console.log(`Initializing contact grid...`);
                    let grid = context.getControl("Contacts");
                    let fetchXml = `<fetch distinct='false' mapping='logical' aggregate='true'>
<entity name='contact'>
<attribute name='contactid' aggregate='count' alias='count'/>
<filter type='and'>
<condition attribute='parentcustomerid' operator='eq' value='${entity.getId().replace('{', '').replace('}', '')}'/>
<condition attribute='statecode' operator='eq' value='0'/>
</filter>
</entity>
</fetch>`;
                    accountform.contactGrid = new myproject.common.gridHandler(context, entity.getEntityName(), fetchXml, grid);
                }
                static onLoad(eventcontext) {
                    console.log(`Loading account form...`);
                    if (!accountform.contactGrid) {
                        let context = eventcontext.getFormContext();
                        let entity = context.data.entity;
                        let entityId = entity.getId();
                        if (entityId !== null) {
                            accountform.Initialize(context, entity);
                        }
                    }
                }
            }
            events.accountform = accountform;
        })(events = myproject.events || (myproject.events = {}));
    })(myproject = myclient.myproject || (myclient.myproject = {}));
})(myclient || (myclient = {}));
