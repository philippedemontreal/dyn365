"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var myClient;
(function (myClient) {
    var myProject;
    (function (myProject) {
        var common;
        (function (common) {
            class gridHandler {
                constructor(context, grid) {
                    this.onRecordCountRetrieved = (totalRecordCount) => {
                        this.context.ui.setFormNotification(`Grid '${this.grid.getName()}' has ${totalRecordCount} total records`, "INFO", this.grid.getName());
                        console.error(`Grid '${this.grid.getName()}' has ${totalRecordCount} total records`);
                    };
                    this.onLoad = () => __awaiter(this, void 0, void 0, function* () {
                        let grid = this.grid.getGrid();
                        let self = this;
                        if (grid.getTotalRecordCount() === -1) {
                            try {
                                var result = yield Xrm.WebApi.online.retrieveMultipleRecords("contact", this.fetchXml);
                                self.onRecordCountRetrieved(result.entities[0].count);
                            }
                            catch (error) {
                                console.error(error);
                            }
                        }
                        else {
                            this.onRecordCountRetrieved(grid.getTotalRecordCount());
                        }
                    });
                    this.grid = grid;
                    let entityId = context.data.entity.getId();
                    let fetchXml = `<fetch distinct='false' mapping='logical' aggregate='true'>
<entity name='contact'>
<attribute name='contactid' aggregate='count' alias='count'/>
<filter type='and'>
<condition attribute='parentcustomerid' operator='eq' value='${entityId.replace('{', '').replace('}', '')}'/>
</filter>
</entity>
</fetch>`;
                    this.context = context;
                    this.fetchXml = "?fetchXml=" + encodeURIComponent(fetchXml);
                    this.grid.addOnLoad(this.onLoad);
                }
            }
            common.gridHandler = gridHandler;
        })(common = myProject.common || (myProject.common = {}));
    })(myProject = myClient.myProject || (myClient.myProject = {}));
})(myClient || (myClient = {}));
(function (myClient) {
    var myProject;
    (function (myProject) {
        class MyCustomEntityForm {
        }
        MyCustomEntityForm.onEntityLoad = function (formcontext) {
            let context = formcontext.getFormContext();
            MyCustomEntityForm.contactGrid = new myProject.common.gridHandler(context, context.getControl("Contacts"));
        };
        myProject.MyCustomEntityForm = MyCustomEntityForm;
    })(myProject = myClient.myProject || (myClient.myProject = {}));
})(myClient || (myClient = {}));
