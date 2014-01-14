var Demo = {
    init: function () {
        Demo.Breadcrumb.init();
        Demo.Login.init();

        if (Demo.Login.isLoggedIn())
            Demo.Dashboard.init();

        $(window).on('hashchange', function () {
            var action = window.location.hash.replace(/^#/, '');
            Demo.Dashboard.handleHashChanged(action);
        });

        window.location.hash = "#";
    },
    autoUpdate: true,
    updateMillis: 60000,
    updateInterval: null,
    host: "https://doubleslash-sandbox.axeda.com",
    currentPage: "dashboard"
};

/**
 * * Login Area
 * **********************************************************************
 */
Demo.Login = {
    currentUser: null,
    sessionId: null,
    form: null,
    init: function () {

        $('#login-form').submit(Demo.Login.doLogin);
        $('#logout-form').submit(Demo.Login.doLogout);

    },
    doLogin: function (evt) {

        username = $('#login-form').find('input[name="username"]').val();
        password = $('#login-form').find('input[name="password"]').val();

        var loginUrl = Demo.host + '/services/v1/rest/Auth/login?principal.username=' + username + '&password=' + password;

        $.ajax({
            dataType: "json",
            url: loginUrl,
            success: function (response) {
                var result = response.wsSessionInfo;

                Demo.Login.sessionId = result.sessionId;
                Demo.Login.currentUser = username;

                Demo.Utils.setCookie('loggedin', 'true');
                Demo.Utils.setCookie('currentuser', Demo.Login.currentUser);
                Demo.Utils.setCookie('sessionId', Demo.Login.sessionId);

                Demo.Login.isLoggedIn();
                Demo.Dashboard.init();

                window.location.hash = "dashboard";
            },
            statusCode: {
                401: function () {
                    alert("Could not authorize.");
                }
            }
        });

        return false;
    },
    doLogout: function () {
        Demo.Utils.deleteCookie();
        Demo.Login.isLoggedIn();
    },
    isLoggedIn: function () {
        var loggedin = Demo.Utils.getCookie('loggedin');
        var logged = loggedin == 'true' ? true : false;

        if (logged) { //logged in
            $('#notLoggedIn').hide();
            $('#logoutButton').text("Logout " + Demo.Utils.getCookie('currentuser'));
            $('#login-form').hide();
            $('#logout-form').show();

            //$('#content').show();
            Demo.ChooseDevice.show();
            Demo.ModelOverview.show();
            Demo.Breadcrumb.show();
        } else { // not logged in
            $('#notLoggedIn').show();
            $('#logout-form').hide();
            $('#login-form').show();

            //$('#content').hide();
            Demo.DeviceOverview.hide();
            Demo.ChooseDevice.hide();
            Demo.ModelOverview.hide();
            Demo.Breadcrumb.hide();

            Demo.Utils.closeDialog();
        }


        return logged;
    },
    getCurrentUser: function () {
        if (!this.currentUser) {
            this.currentUser = Demo.Utils.getCookie('currentuser');
        }
        return this.currentUser;
    },
    getCurrentUserDetails: function () {
        if (!this.currentUserDetails) {
            this.currentUserDetails = Demo.Utils.getCookie('currentuserdetails');
        }
        return this.currentUserDetails;
    },
    isAdmin: function () {
        return this.getCurrentUserDetails().isAdmin;
    }
};

/**
 * * CUSTOMER AREA
 * **********************************************************************
 */

Demo.DataItems = {
    dom: $('#dataItems'),
    dataItems: null,
    init: function () {
        var heading = '<h3>DataItems</h3>';
        var refresh = '<button class="btn btn-default" id="dataItemRefresh" title="Refresh dataItems" type="button"><span class="glyphicon glyphicon-refresh"></span></button>';
        var table = '<table class="table" style="table-layout: fixed;word-wrap: break-word;" ><thead><tr><th>Name</th><th>Value</th><th>Actions</th></tr></thead><tbody></tbody></table>';
        var loading = '<img width="50px" src="images/loading.gif" name="loading"/>';
        Demo.DataItems.dom.html(heading + refresh + table + loading);

        Demo.DataItems.refresh();

        var refresh = Demo.DataItems.dom.find('#dataItemRefresh');
        refresh.click(function() {
            Demo.DataItems.refresh();
        });
    },
    refresh: function () {

        var refresh = Demo.DataItems.dom.find('#dataItemRefresh')[0];
        refresh.innerHTML = "<img src='images/refreshing.gif' alt='' />";
        refresh.disabled = true;

        Demo.Request.getData({
            which: 'getAllData',
            data: {
                modelName: Demo.DeviceOverview.modelName,
                serialNumber: Demo.DeviceOverview.serialNumber
            }
        }, Demo.DataItems.updateDataItems);
    },
    updateDataItems: function (response) {
        var refresh = Demo.DataItems.dom.find('#dataItemRefresh')[0];
        refresh.innerHTML = '<span class="glyphicon glyphicon-refresh"></span>';
        refresh.disabled = false;

        if (response.success) {
            Demo.DataItems.dataItems =  response.data_items
            var dataItems = Demo.DataItems.dataItems;
            var table = Demo.DataItems.dom.find('table tbody');

            // Table was empty
            if(table.html() == ""){

                var tableContent = "";

                for (i = 0; i < dataItems.length; i++) {
                    var dataItem = dataItems[i];

                    var actions = '<div class="btn-group">';
                    actions += '<button class="btn btn-default" name="refresh" title="Query device to refresh this dataItem" value="' + i + '" type="button"><span class="glyphicon glyphicon-repeat"></span></button>';

                    switch(dataItem.type){
                        case "FILE":
                            actions += '<button class="btn btn-default" name="download" title="Download file" value="' + i + '" type="button"><span class="glyphicon glyphicon-cloud-download"></span></button>';
                            if(dataItem.access != "READ_ONLY")
                                actions += '<button class="btn btn-default" name="upload" value="' + i + '" title="Upload a file" type="button"><span class="glyphicon glyphicon-cloud-upload"></span></button>';
                            break;
                        case "DIGITAL":
                            actions += '<button class="btn btn-default" name="drawChart" title="Draw diagram from historical values" value="' + i + '" type="button"><img src="images/chart.png" alt="chart"/></button>';
                            if(dataItem.access != "READ_ONLY")
                                actions += '<button class="btn btn-default" name="setValue" value="' + i + '" title="Set a new value for this item" type="button">Set value</button>';
                            break;
                        case "ANALOG":
                            actions += '<button class="btn btn-default" name="drawChart" title="Draw diagram from historical values" value="' + i + '" type="button"><img src="images/chart.png" alt="chart"/></button>';
                            if(dataItem.access != "READ_ONLY")
                                actions += '<button class="btn btn-default" name="setValue" value="' + i + '" title="Set a new value for this item" type="button">Set value</button>';
                            break;
                        case "INTEGER":
                            actions += '<button class="btn btn-default" name="drawChart" title="Draw diagram from historical values" value="' + i + '" type="button"><img src="images/chart.png" alt="chart"/></button>';
                            if(dataItem.access != "READ_ONLY")
                                actions += '<button class="btn btn-default" name="setValue" value="' + i + '" title="Set a new value for this item" type="button">Set value</button>';
                            break;
                    }

                    if(dataItem.configuration != null){
                        actions += '<button class="btn btn-default" name="editConfiguration" title="Edit the configuration" value="' + i + '" type="button"><span class="glyphicon glyphicon-edit"></span></button>';
                    }
                    actions += '</div>';

                    var timestamp = new Date(dataItem.date).toString();
                    var row = "<tr>";
                    row += "<td>" + dataItem.name + "</td>"; // Name
                    row += "<td><p title='" + timestamp + "' id='dataItem" + i + "'>" + dataItem.value + "</p></td>"; // Value
                    row += "<td>" + actions + "</td>"; // Actions
                    row += "</tr>";
                    tableContent += row;
                }

                table.html(tableContent);

                // Set listeners on refresh
                Demo.DataItems.dom.find('table tbody button[name="refresh"]').click(function(event) {
                    var dataItem = Demo.DataItems.dataItems[$(this).attr("value")];
                    Demo.DataItems.getDataItem(dataItem.name);
                });

                // Set listeners on editConfiguration
                Demo.DataItems.dom.find('table tbody button[name="editConfiguration"]').click(function(event) {
                    var dataItem = Demo.DataItems.dataItems[$(this).attr("value")];
                    Demo.DataItems.editConfiguration(dataItem);
                });

                // Set listeners on download
                Demo.DataItems.dom.find('table tbody button[name="download"]').click(function() {
                    var dataItem = Demo.DataItems.dataItems[$(this).attr("value")];
                    Demo.Utils.showInfoBox("Success","Initiated download of file '" + dataItem.name + "'.");
                    var link = Demo.host + '/services/v1/rest/Scripto/execute/nm_GetFile?modelName=' + Demo.DeviceOverview.modelName + '&serialNumber=' + Demo.DeviceOverview.serialNumber + '&fileName=' + dataItem.value;
                    window.open(link,null, "height=200,width=400,status=yes,toolbar=no,menubar=no,location=no");
                });

                // Set listeners on upload
                Demo.DataItems.dom.find('table tbody button[name="upload"]').click(function() {
                    var dataItem = Demo.DataItems.dataItems[$(this).attr("value")];
                    Demo.DataItems.externFileUpload(dataItem.name);
                });

                // Set listeners on drawChart
                Demo.DataItems.dom.find('table tbody button[name="drawChart"]').click(function() {
                    var dataItem = Demo.DataItems.dataItems[$(this).attr("value")];
                    Demo.Utils.showInfoBox("Success","Initiated drawing of graph for dataItem '" + dataItem.name + "'.");
                    Demo.Request.getData({
                        which: 'getHistoricalData',
                        data: {
                            modelName: Demo.DeviceOverview.modelName,
                            serialNumber: Demo.DeviceOverview.serialNumber,
                            dataItemNames : dataItem.name,
                            timeOffset: 7
                        }
                    }, Demo.Chart.parseChartResponse);
                });



                //Set listeners on setValue..
                Demo.DataItems.dom.find('table tbody button[name="setValue"]').click(function() {
                    var dataItem = Demo.DataItems.dataItems[$(this).attr("value")];

                    var title = "Set a new value";
                    var content = "Set a new value for dataItem '" + dataItem.name + "'.<br>";
                    content += "The current value is '" + dataItem.value + "'<br>";
                    content += "New value ('" + dataItem.type + "') <input id='dataItemValue' value='" + dataItem.value + "' />";

                    var save = "Set";
                    var close = "Cancel";

                    var saveCallback = function(){
                        var value = $('#dataItemValue').val();
                        if( value != ""){
                            Demo.DataItems.setDataItem(dataItem.name, value, dataItem.type);
                            Demo.Utils.closeDialog();
                        }else{
                            alert("Value cannot be empty");
                        }
                    }

                    Demo.Utils.openDialog(title, content, save, close, saveCallback);

                });

            }else{ // DataItems are already available, only refresh the values
                for (i = 0; i < dataItems.length; i++) {
                    var dataItem = dataItems[i];
                    var valueDom = $('#dataItem'+i);
                    if(valueDom.length > 0){
                        if( valueDom.html() != dataItem.value ){

                            valueDom.animate({
                                backgroundColor: "#00A5E1",
                            }, 500 );
                            valueDom.html( dataItem.value );
                            valueDom.attr("title", (new Date(dataItem.date).toString()));
                            valueDom.animate({
                                backgroundColor: "#ffffff",
                            }, 500 );

                        }
                    }else{
                        console.warn( "Could not find id " + dataItem.name );
                    }
                }
            }

        } else {
            var error = '<div class="alert alert-danger">';
            error += '<strong>Request was not successful! </strong>' + response.msg;
            error += '</div>';

            $('#dataItems').append(error);
        }

        $('#dataItems img[name="loading"]').hide();
    },
    editConfiguration : function(dataItem){
        var title = "Edit configuration";
        var content = "Edit configuration for dataItem '" + dataItem.name + "'.<br>";
        // Clone configurationItem
        var configuration = jQuery.extend(true, {}, dataItem.configuration);;
        var configurationItems = configuration.configurationItems;

        for(i=0;i<configurationItems.length;i++){
            var configurationItem = configurationItems[i];

            content += '<div class="input-group">';
            content +=   '<span class="input-group-addon">' + configurationItem.name + '</span>';
            content +=   '<input type="text" id="config-' + configurationItem.name + '" class="form-control" value="' + configurationItem.value + '">';
            content +=   '<span class="input-group-addon">' + configurationItem.type + '</span> ';
            content += '</div>';

        }

        var save = "Ok";
        var close = "Cancel";
        var saveCallback = function(){

            for(var i=0;i<configuration.configurationItems.length;i++){
                var configItem = configuration.configurationItems[i];
                var configurationItemName = configItem.name;

                configItem.value =  $('#config-' + configurationItemName).val();
            }

            Demo.Request.getData({
                which: 'updateConfiguration',
                data: {
                    modelName: Demo.DeviceOverview.modelName,
                    serialNumber: Demo.DeviceOverview.serialNumber,
                    dataItemName : dataItem.name,
                    configuration: JSON.stringify(configuration)
                }
            }, function(response){
                if (response.success) {
                    Demo.Utils.showInfoBox("Success","A new configuration for dataItem '" + dataItem.name + "' was sent.");
                    Demo.Utils.closeDialog();
                }else{
                    Demo.Utils.setDialogError("Request was not successful!", response.msg);
                }
            });
        };


        Demo.Utils.openDialog(title, content, save, close, saveCallback);

    },
	getDataItem: function(dataItemName){
		// Sends a request to the Device to refresh the dataItem and send update to axeda


		Demo.Request.getData({
            which: 'requestDataItem',
            data: {
                modelName: Demo.DeviceOverview.modelName,
                serialNumber: Demo.DeviceOverview.serialNumber,
				dataItemName : dataItemName
            }
        }, function(response){
            if (response.success) {
                Demo.Utils.showInfoBox("Success", dataItemName + " was requested.");
            }else{
                alert(response.msg);
            }
        });
	},
	downloadFile : function(fileName){
		// User wants to download a file from device

		Demo.Request.getData({
            which: 'getFile',
            data: {
                modelName: Demo.DeviceOverview.modelName,
                serialNumber: Demo.DeviceOverview.serialNumber,
				fileName : fileName
            }
        }, function(response){
            if (response.success) {
                Demo.Utils.showInfoBox("Success","Initiated download of file '" + fileName + "'.");
            }else{
                alert(response.msg);
            }
        });
	},
	setDataItem : function(dataItemName, value, type){
		// User wants to set a dataItem to a value on a device

		Demo.Request.getData({
            which: 'sendDataItem',
            data: {
                modelName: Demo.DeviceOverview.modelName,
                serialNumber: Demo.DeviceOverview.serialNumber,
				dataItemName : dataItemName,
				type: type,
				value: value
            }
        }, function(response){
            if (response.success) {
                Demo.Utils.showInfoBox("Success","Sent request for setting dataItem '" + dataItemName + "' to value '" + value + "'.");
            }else{
                alert(response.msg);
            }
        });
	},
	externFileUpload : function(dataItemName){
	    // User wants to upload a file to a device

        console.info("A file shall be uploaded to " + dataItemName);

        var title = "Upload a file to asset";
        var content = '<input type="file" id="fileinput" value="Upload" />';
        var save = "Upload";
        var close = "Cancel";
        var saveCallback = function(){

            if ($('#fileinput')[0].files && $('#fileinput')[0].files.length == 1 ) {
                var file = $('#fileinput')[0].files[0];
                var formData = new FormData();
                var filename = file.name;
                formData.append(filename, file);
                var url = 'https://doubleslash-sandbox.axeda.com/services/v1/rest/Scripto/execute/nm_ExternFileUpload?dataItemName=' + dataItemName + '&serialNumber=' + Demo.DeviceOverview.serialNumber + '&modelName=' + Demo.DeviceOverview.modelName + '&filelabel=' + filename + "&tag=myimg";
                $('#modalSave').html("Uploading..");
                $('#modalSave').attr("disabled",true);
                $('#modalClose').attr("disabled",true);
                jQuery.ajax(url, {
                    cache: false,
                    cache: false,
                    processData: false,
                    type: 'POST',
                    contentType: false,
                    data: formData,
                    success: function (response) {
                        //TODO Error handling
                        if (response.success) {
                            Demo.Utils.closeDialog();
                            Demo.Utils.showInfoBox("Success","File '" + filename + "'  was sent to device.");
                        }else{
                            alert(response.msg);
                        }
                    },
                    beforeSend: function (req) {
                        req.setRequestHeader('Content-Disposition', filename);
                        var sessionId = Demo.Utils.getCookie('sessionId');
                        req.setRequestHeader('x_axeda_wss_sessionid', sessionId);
                    },
                    statusCode: {
                        401: function () {
                            alert("Your session is expired.");
                            Demo.Login.isLoggedIn();
                        }
                    }
                });
            }else{ // No file selected
                alert("No files selected");
            }
        };

        Demo.Utils.openDialog(title, content, save, close, saveCallback);
	}
}

Demo.ExpressionRules = {
    dom: $('#expressionRules'),
    expressionRules : null,
    init: function () {
        Demo.ExpressionRules.clear();
    },
    clear: function () {

        var heading = '<h3>Rules</h3>';
        var refresh = '<div class="btn-group"><button class="btn btn-default" name="refresh" title="Refresh ExpressionRules" type="button"><span class="glyphicon glyphicon-refresh"></span></button>';
        var add = '<button class="btn btn-default" name="add" title="Add a ExpressionRule" type="button"><span class="glyphicon glyphicon-plus"></span></button></div>';
        var table = '<table class="table" ><thead><tr><th>Enabled</th><th>Name</th><th>Description</th><th>Actions</th></tr></thead><tbody></tbody></table>';
        var loading = '<img width="50px" src="images/loading.gif" name="loading"/>';
        Demo.ExpressionRules.dom.html(heading + refresh + add + table + loading);

        Demo.ExpressionRules.dom.find('button[name="refresh"]').click(function() {
            Demo.ExpressionRules.clear();
        });

        Demo.ExpressionRules.dom.find('button[name="add"]').click(function() {
            Demo.ExpressionRules.newExpressionRule();
        });


        Demo.Request.getData({
            which: 'getAllExpressionRules',
            data: {
                modelName: Demo.DeviceOverview.modelName,
                serialNumber: Demo.DeviceOverview.serialNumber
            }
        }, Demo.ExpressionRules.updateExpressionRules);

    },
    newExpressionRule : function(){
        var title = 'Create Rule';

        var content = "";

        content += '<div class="input-group">';
        content += '<span class="input-group-addon">Name</span>';
        content += '<input type="text" id="expressionRuleName" class="form-control">';
        content += '</div>';

        content += '<div class="input-group">';
        content += '<span class="input-group-addon">IF</span>';
        content += '<input type="text" id="ifStatement" class="form-control">';
        content += '</div>';

        content += '<div class="input-group">';
        content += '<span class="input-group-addon">THEN</span>';
        content += '<input type="text" id="thenStatement" class="form-control">';
        content += '</div>';

        content += '<div class="input-group">';
        content += '<span class="input-group-addon">ELSE</span>';
        content += '<input type="text" id="elseStatement" class="form-control">';
        content += '</div>';

        content += '<div class="input-group">';
        content += '<span class="input-group-addon">Description</span>';
        content += '<textarea style="width:100%;" id="description"></textarea>';
        content += '</div>';

        var save = "Save";
        var close = "Cancel";
        var saveCallback = function(){
            Demo.Request.getData({
                which: 'createExpressionRule',
                data: {
                    modelName: Demo.DeviceOverview.modelName,
                    serialNumber: Demo.DeviceOverview.serialNumber,
                    expressionRuleName: $('#expressionRuleName').val(),
                    ifStatement: $('#ifStatement').val(),
                    thenStatement: $('#thenStatement').val(),
                    elseStatement: $('#elseStatement').val(),
                    description: $('#description').val() ,
                    enabled: 1,
                    type: "DATA"
                }
            }, function(response){
                if(response.success){
                    $('#modal').modal('hide');
                    Demo.ExpressionRules.clear();
                }else{
                    Demo.Utils.setDialogError("Request was not successful!", response.msg);
                }

            });
        };

        Demo.Utils.openDialog(title, content, save, close, saveCallback);
    },
    updateExpressionRules: function (response) {

        if (response.success) {

            Demo.ExpressionRules.expressionRules = response.expressionRules;
            var expressionRules = Demo.ExpressionRules.expressionRules;
            var table = Demo.ExpressionRules.dom.find('table tbody');
            var tableContent = "";
            for (i = 0; i < expressionRules.length; i++) {
                var expressionRule = expressionRules[i];

                var actions = '<div class="btn-group">';
                actions += '<button class="btn btn-default" name="edit" title="Edit this rule" value="' + i + '" type="button"><span class="glyphicon glyphicon-edit"></span></button>';
                actions += '<button class="btn btn-default" name="delete" title="Delete this rule" value="' + i + '" type="button"><span class="glyphicon glyphicon-remove"></span></button>';
                actions += '</div>';

                var row = "<tr>";
                row += "<td>" + "<input name='enable' value= '" + i + "'type='checkbox' " + ((expressionRule.enabled) ? "checked" : "") + "/>" + "</td>"; // Enabled
                row += "<td>" + expressionRule.name + "</td>"; // Name
                row += "<td>" + expressionRule.description + "</td>"; // Description
                row += "<td>" + actions + "</td>";
                row += "</tr>";
                tableContent += row;
            }

            table.html(tableContent);

            // Add listener to enabled
            Demo.ExpressionRules.dom.find('table tbody input[name="enable"]').click(function() {
                var expressionRule = Demo.ExpressionRules.expressionRules[$(this).attr("value")];
                var expressionRuleName = expressionRule.name;
                var enable = this.checked;
                console.info("Rule '" + expressionRuleName + "' shall be " + ((enable)? "enabled" : "disabled") + ".");
                Demo.Request.getData({
                    which: 'updateExpressionRule',
                    data: {
                        modelName: Demo.DeviceOverview.modelName,
                        serialNumber: Demo.DeviceOverview.serialNumber,
                        expressionRuleName: expressionRuleName,
                        enabled: (enable) ? 1 : 0

                    }
                }, function(response){
                    if(response.success){
                        Demo.ExpressionRules.clear();
                    }else{
                        alert("Error while en/disabeling rule: " + response.msg);
                    }

                    });
               });

            // Add listener to edit
            Demo.ExpressionRules.dom.find('table tbody button[name="edit"]').click(function() {
                var expressionRule = Demo.ExpressionRules.expressionRules[$(this).attr("value")];
                var expressionRuleName = expressionRule.name;

                console.info("Rule '" + expressionRuleName + "' shall be edited.");

                var title = 'Edit Rule "' + expressionRuleName + '"';

                var content = '<div class="input-group">';
                content += '<span class="input-group-addon">Name</span>';
                content += '<input type="text" id="newExpressionRuleName" class="form-control" value="' + Demo.Utils.safe_tags(expressionRule.name) + '">';
                content += '</div>';

                content += '<div class="input-group">';
                content += '<span class="input-group-addon">IF</span>';
                content += '<input type="text" id="ifStatement" class="form-control" value="' + Demo.Utils.safe_tags(expressionRule.ifStatement) + '">';
                content += '</div>';

                content += '<div class="input-group">';
                content += '<span class="input-group-addon">THEN</span>';
                content += '<input type="text" id="thenStatement" class="form-control" value="' + Demo.Utils.safe_tags(expressionRule.thenStatement) + '">';
                content += '</div>';

                content += '<div class="input-group">';
                content += '<span class="input-group-addon">ELSE</span>';
                content += '<input type="text" id="elseStatement" class="form-control" value="' + Demo.Utils.safe_tags(expressionRule.elseStatement) + '">';
                content += '</div>';

                content += '<div class="input-group">';
                content += '<span class="input-group-addon">Description</span>';
                content += '<textarea style="width:100%;" id="description">' + Demo.Utils.safe_tags(expressionRule.description) + '</textarea>';
                content += '</div>';

                var save = "Save";
                var close = "Cancel";
                var saveCallback = function(){
                    Demo.Request.getData({
                        which: 'updateExpressionRule',
                        data: {
                            modelName: Demo.DeviceOverview.modelName,
                            serialNumber: Demo.DeviceOverview.serialNumber,
                            expressionRuleName: expressionRuleName,
                            newExpressionRuleName: $('#newExpressionRuleName').val(),
                            ifStatement: $('#ifStatement').val(),
                            thenStatement: $('#thenStatement').val(),
                            elseStatement: $('#elseStatement').val(),
                            description: $('#description').val()
                        }
                    }, function(response){
                        if(response.success){
                            $('#modal').modal('hide');
                            Demo.ExpressionRules.clear();
                        }else{
                            Demo.Utils.setDialogError("Request was not successful!", response.msg);
                        }

                    });
                };

                Demo.Utils.openDialog(title, content, save, close, saveCallback);
            });

            // Add listener to delete
            Demo.ExpressionRules.dom.find('table tbody button[name="delete"]').click(function() {
                var expressionRule = Demo.ExpressionRules.expressionRules[$(this).attr("value")];
                var expressionRuleName = expressionRule.name;
                console.info("Rule '" + expressionRuleName + "' shall be deleted.");

                $('#modalTitle').html('Remove Rule "' + expressionRuleName + '"');

                var content = 'You really want to remove rule with name "' + expressionRuleName + '" ?';
                $('#modalContent').html(content);
                $('#modalSave').html("Yes");
                $('#modalClose').html("No");
                $('#modalSave').unbind('click');
                $('#modalSave').click(function(){
                    Demo.Request.getData({
                        which: 'deleteExpressionRule',
                        data: {
                            modelName: Demo.DeviceOverview.modelName,
                            serialNumber: Demo.DeviceOverview.serialNumber,
                            expressionRuleName: expressionRuleName
                        }
                    }, function(response){
                            if(response.success){
                                $('#modal').modal('hide');
                                Demo.ExpressionRules.clear();
                            }else{
                               Demo.Utils.setDialogError("Request was not successful!", response.msg);
                            }

                        });
                });
                $('#modal').modal('show');
            });

            //TODO add an Add button

        }else{
            var error = '<div class="alert alert-danger">';
            error += '<strong>Request was not successful! </strong>' + response.msg;
            error += '</div>';

            $('#expressionRules').append(error);
        }

        $('#expressionRules img[name="loading"]').hide();
    },
    dummy : function(response){

    },
    hide : function(){
         Demo.ExpressionRules.dom.hide();
    }
}

Demo.Alarms = {
    dom: $('#events'),
    alarms: null,
    maxId: 0,
    init: function () {
        var heading = '<h3>Alarms</h3>';
        var refresh = '<button class="btn btn-default" name="refresh" title="Refresh Events" type="button"><span class="glyphicon glyphicon-refresh"></span></button>';
        var loading = '<img width="50px" src="images/loading.gif" name="loading"/>';
        Demo.Alarms.dom.html(heading + refresh + loading + "<div id='eventList'></div>");
        Demo.Alarms.dom.find('button[name="refresh"]').click(function() {
            Demo.Alarms.refresh();
        });
    },
    refresh: function () {
        Demo.Request.getData({
            which: 'getAlarms',
            data: {
                modelName: Demo.DeviceOverview.modelName,
                serialNumber: Demo.DeviceOverview.serialNumber,
                state: "STARTED"
            }
        }, Demo.Alarms.updateEvents);

    },
    updateEvents : function(response){
        if (response.success) {
            var alarms = response.alarms;
            Demo.Alarms.alarms = alarms;
            var content = "";
            var eventList = Demo.Alarms.dom.find('#eventList')
            for (i = 0; i < alarms.length; i++) {
                var alarm = alarms[i];
                var entry = '<div class="alert alert-danger">';
                entry += '<button value="' + i + '" name="alarmClose" class="close" type="button">×</button>';
                entry +='<strong>' + alarm.name + ' </strong>';
                entry += alarm.description;
                entry += '</div>';
                content += entry;
                if (alarm.id > Demo.Alarms.maxId){
                    Demo.Alarms.maxId = alarm.id;
                    Demo.Utils.showInfoBox("New Alarm", "A new alarm is present");
                }
            }
            eventList.html(content);

            Demo.Alarms.dom.find('button[name="alarmClose"]').click(function() {
                var alarm = Demo.Alarms.alarms[$(this).attr("value")];
                Demo.Request.getData({
                    which: 'closeAlarm',
                    data: {
                        modelName: Demo.DeviceOverview.modelName,
                        serialNumber: Demo.DeviceOverview.serialNumber,
                        id: alarm.id
                    }
                }, Demo.Alarms.refresh);
            });

        }else{
            var error = '<div class="alert alert-danger">';
            error += '<strong>Request was not successful! </strong>' + response.msg;
            error += '</div>';

            Demo.Alarms.dom.append(error);
        }

        Demo.Alarms.dom.find('img[name="loading"]').hide();
    },
    hide : function(){
        Demo.Alarms.dom.hide();
    }
}
Demo.ModelOverview = {
    dom: $('#modelOverview'),
    devices: null,
    init: function () {
        this.clear();
        Demo.Request.getData({
            which: 'getAllAssets',
            data: {
                modelName: Demo.DeviceOverview.modelName
            }
        }, this.updateDevices);
    },
    clear: function () {
        this.dom.html('<h4>RaspberryPi</h4><ul id="devices"><img width="50px" src="images/loading.gif"/></ul>');
    },
    updateDevices: function (response) {

        if (response.success) {
            var devicesDom = $('#devices');
            devicesDom.html("");
            Demo.ModelOverview.devices = response.devices;
            var devices = Demo.ModelOverview.devices;
            var html = "";
            for (i = 0; i < devices.length; i++) {
                var device = devices[i];
                var isOnline = device.online;
                var name = device.name;
                var status;
                if (isOnline) {
                    status = '<span class="label label-success">Online</span>';
                } else {
                    status = '<span class="label label-danger">Offline</span>';
                }
                html += '<li id="' + i + '"><a href="#device-' + i + '">' + status + ' ' + name + '</a></li>';
            }
            devicesDom.html(html);

        } else {
            alert(response.msg);
        }

    },
    hide : function(){
        Demo.ModelOverview.dom.hide();
    },
    show : function(){
        Demo.ModelOverview.dom.show();
    }
};

Demo.Breadcrumb = {
    dom: $('#breadcrumb'),
    init: function () {
        Demo.Breadcrumb.update();
    },
    update: function () {
        var path = window.location.hash.replace("#","").split("-")
        var breadcrumb =  '<li><a href="#dashboard">Dashboard</a></li>';
        for(i=0;i<path.length;i++){
            breadcrumb += "<li>" + Demo.Utils.capitaliseFirstLetter(path[i]) + "</li>";
        }
        Demo.Breadcrumb.dom.html(breadcrumb);
    },
    hide : function(){
        Demo.Breadcrumb.dom.hide();
    },
    show : function(){
        Demo.Breadcrumb.dom.show();
    }
};

Demo.Chart = {
    dom: null,
    data: null,
    init: function(){


    },
    drawChart : function(){
        if (!loaded) {
            window.setTimeout(Demo.Chart.drawChart, 1000);
            return;
        }

        var tableData = google.visualization.arrayToDataTable(Demo.Chart.data);
        var options = {
            interpolateNulls: true
        };

        tableData.sort([{
            column: 0
        }]);

        var w = window.open('', null, 'resizeable,scrollbars');
        w.document.write('<!DOCTYPE html><html><head><title>Historical Data</title></head><body><div id="chart_div" style="position:relative;height:300px;"><img width="50px" src="images/loading.gif"/></div></body></html>');
        w.document.close(); // needed for chrome and safari
        window.setTimeout(function(){
            var chart = new google.visualization.LineChart(w.document.getElementById("chart_div"));
            chart.draw(tableData, options);
        }, 2000);

    },
    parseChartResponse: function(response){
        if (response.success) {
            var items = response.items;
            var result = new Array();

            var legende = new Array()
            legende[0] = "Date";
            for (var itemName in items) {
                legende[legende.length] = itemName;
            }
            result.push(legende);

            var dataIndex = 0;
            for (var itemName in items) {

                var currentItems = items[itemName];

                for (i = 0; i < currentItems.length; i++) {
                    var currentItem = currentItems[i];
                    var date = Demo.Chart.toDate(currentItem.timestamp);
                    var index = Demo.Chart.getIndex(result, date);
                    // Get value
                    var value;
                    if (currentItem.type == "ANALOG")
                        value = parseFloat(currentItem.value);
                    else if (currentItem.type == "DIGITAL")
                        value = (currentItem.value == "true") ? 1 : 0;
                    else if( currentItem.type == "INTEGER")
                        value = parseInt(currentItem.value);
                    else
                        console.error ("Unsupported type '" + currentItem.type + "' received while plotting chart.");

                    if (index == -1) {
                        var entry = new Array(legende.length);
                        entry[0] = date;
                        entry[dataIndex + 1] = value;
                        result.push(entry);
                    } else {
                        result[index][dataIndex + 1] = value;
                    }
                }

                dataIndex++;
            }

            Demo.Chart.data = result;
            Demo.Chart.drawChart();
        } else {

        }
    },
    toDate : function (time) {
                var date = new Date(time);
                date.setMilliseconds(0);
                return date;
    },
    getIndex : function (array, key) {
                for (var i = 1; i < array.length; i++) {
                    if (array[i] != null)
                        if (array[i][0].getTime() == key.getTime()) {
                            return i;
                        }
                }
                return -1;
            }
}

Demo.DeviceOverview = {
    dom: $('#deviceOverview'),
    modelName: "RaspberryPi",
    serialNumber: null,
    timeout: null,
    init: function (id) {
        window.clearTimeout(Demo.DeviceOverview.timeout);
        Demo.DeviceOverview.serialNumber = Demo.ModelOverview.devices[id].serialNumber;
        Demo.ChooseDevice.hide();
        Demo.DeviceOverview.dom.show();
        Demo.currentPage = "device"
        Demo.DeviceOverview.clear();
    },
    clear: function () {
        Demo.DataItems.init();
        Demo.Alarms.init();
        Demo.ExpressionRules.init();
        Demo.DeviceOverview.timeout = window.setTimeout("Demo.DeviceOverview.refresh()", 5000);
    },
    hide : function(){
        window.clearTimeout(Demo.DeviceOverview.timeout);
        Demo.DeviceOverview.dom.hide();
    },
    refresh : function(){
        Demo.DataItems.refresh();
        Demo.Alarms.refresh();
        Demo.DeviceOverview.timeout = window.setTimeout("Demo.DeviceOverview.refresh()", 5000);
    }
};

Demo.ChooseDevice = {
    dom: $('#chooseDevice'),
    init: function () {
        Demo.ChooseDevice.dom.show();
    },
    hide: function () {
        Demo.ChooseDevice.dom.hide();
    },
    show : function() {
        Demo.DeviceOverview.hide();
        Demo.ChooseDevice.dom.show();
    }
};

Demo.Dashboard = {
    init: function () {
        Demo.ModelOverview.init();
        Demo.ChooseDevice.init();
        Demo.Breadcrumb.init();
    },
    handleHashChanged: function (hash) {
        hash = hash.split('-');
        action = hash[0];
        param = hash[1];
        switch (action) {
        case 'dashboard':
            Demo.ChooseDevice.show();
            break;
        case 'device':
            Demo.DeviceOverview.init(param);
            break;
        case 'logout':
            Demo.Login.doLogout();
            break;
        default:
            Demo.Utils.notImplemented();
        }
        Demo.Breadcrumb.update();
    }
};



/**
 * * REQUEST
 * **********************************************************************
 */
Demo.Request = {
    getData: function (reqData, callback) {
        var url;
        switch (reqData.which) {
        case 'getAllAssets':
            url = '/services/v1/rest/Scripto/execute/nm_GetAllAssets';
            break;
        case 'getAllData':
            url = '/services/v1/rest/Scripto/execute/nm_GetAllData';
            break;
        case 'getAllExpressionRules':
            url = '/services/v1/rest/Scripto/execute/nm_GetAllExpressionRules';
            break;
        case 'getEvents':
            url = '/services/v1/rest/Scripto/execute/nm_GetEvents';
            break;
        case 'getAlarms':
            url = '/services/v1/rest/Scripto/execute/nm_GetAlarms';
            break;
        case 'closeAlarm':
            url = '/services/v1/rest/Scripto/execute/nm_CloseAlarm';
            break;
        case 'sendDataItem':
            url = '/services/v1/rest/Scripto/execute/nm_SendDataItem';
            break;
		case "getFile": 
			url = '/services/v1/rest/Scripto/execute/nm_GetFile';
			break;
		case "uploadFile":
			url = '/services/v1/rest/Scripto/execute/nm_UploadFile';
			break;
		case "requestDataItem":
			url = '/services/v1/rest/Scripto/execute/nm_RequestDataItem';
			break;
		case "createExpressionRule":
		    url = '/services/v1/rest/Scripto/execute/nm_CreateExpressionRule';
		    break;
		case "updateExpressionRule":
            url = '/services/v1/rest/Scripto/execute/nm_UpdateExpressionRule';
            break;
        case "deleteExpressionRule":
             url = '/services/v1/rest/Scripto/execute/nm_DeleteExpressionRule';
             break;
        case "externFileUpload":
             url = '/services/v1/rest/Scripto/execute/nm_ExternFileUpload';
             break;
        case "getHistoricalData":
            url = '/services/v1/rest/Scripto/execute/nm_GetHistoricalData';
            break;
        case "updateConfiguration":
            url = '/services/v1/rest/Scripto/execute/nm_UpdateConfiguration';
            break;
        default:
		    console.error("Unknown request '" + reqData.which + "'.");
            return {
                success: false,
                msg: 'request not defined'
            };
        }

        $.ajax({
            dataType: "jsonp",
            url: Demo.host + url + '?' + $.param(reqData.data || {}),
            success: function (response) {
                callback(Demo.Request.unpackJSON(response));
            },
            beforeSend: function (req) {
				//Does not work with jsonp
                var sessionId = Demo.Utils.getCookie('sessionId');
                req.setRequestHeader('x_axeda_wss_sessionid', sessionId);
            },
            statusCode: {
                401: function () {
                    alert("Your session is expired.");
                    Demo.Login.isLoggedIn();
                }
            }
        });
    },
    unpackJSON: function (json) {
        if (json.wsScriptoExecuteResponse) {
            json = $.parseJSON(json.wsScriptoExecuteResponse.content.$);
        }
        return json;
    }
};

/**
 * * UTILS
 * **********************************************************************
 */
Demo.Utils = {
    safe_tags : function (str) {
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') ;
    },
    hash: function (str) {
        var hash = 0,
            i, char;
        if (str.length == 0)
            return hash;
        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    },
    capitaliseFirstLetter: function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    toFixed: function (value, precision) {
        var precision = precision || 0,
            neg = value < 0,
            power = Math.pow(10, precision),
            value = Math.round(value * power),
            integral = String((neg ? Math.ceil : Math.floor)(value / power)),
            fraction = String((neg ? -value : value) % power),
            padding = new Array(Math.max(precision - fraction.length, 0) + 1).join('0');

        return precision ? integral + '.' + padding + fraction : integral;
    },
    cName: 'dSFSCDemo',
    cExpiry: 30,
    getCookie: function (key) {
        if (typeof key !== 'undefined') {
            var val = false;
            var cObj;
            if (arrC = document.cookie.match(new RegExp(Demo.Utils.cName + '=([^;]*)', 'g'))) {
                val = RegExp.$1;
                cObj = $.parseJSON(val);
                val = cObj[key] || false;
            }
            return val;
        }
        return '';
    },
    setCookie: function (key, val) {
        var cObj = {};
        if (arrC = document.cookie.match(new RegExp(Demo.Utils.cName + '=([^;]*)', 'g'))) {
            cObj = $.parseJSON(RegExp.$1);
        }
        cObj[key] = val;
        var exdate = new Date();
        exdate.setTime(exdate.getTime() + (Demo.Utils.cExpiry * 60 * 1000));
        document.cookie = Demo.Utils.cName + '=' + JSON.stringify(cObj) + ';expires=' + exdate.toGMTString() + ';path=/';
    },
    deleteCookie: function () {
        document.cookie = Demo.Utils.cName + '=;expires=Thu, 01-Jan-70 00:00:01 GMT;path=/';
    },
    showLoader: function (boxId, size) { // small, medium, large
        $('#' + boxId + ' > div.box-content').children('div').hide();
        var loader = $('<div>').addClass('loading-' + (size || 'medium'));
        $('#' + boxId + ' > div.box-content').append(loader);
    },
    hideLoader: function (boxId) {
        $('#' + boxId).find('div[class*="loading"]').remove();
        $('#' + boxId + ' > div.box-content').children('div').show();
    },
    formatDate: function (timestamp, what, separator) { // what -> d=date,
        // t=time, dt= date &
        // time
        if (timestamp < 10000000000)
            timestamp *= 1000;
        var date = new Date(timestamp);
        var separator = separator || '.';
        switch (what) {
        case 'd':
            return this.pad(date.getDate(), 2) + separator + this.pad(1 + date.getMonth(), 2) + separator + date.getFullYear();
            break;
        case 't':
            return this.pad(date.getHours(), 2) + ':' + this.pad(date.getMinutes(), 2) + ':' + this.pad(date.getSeconds(), 2);
            break;
        default:
            this.pad(date.getDate(), 2) + separator + this.pad(1 + date.getMonth(), 2) + separator + date.getFullYear() + ' ' + this.pad(date.getHours(), 2) + ':' + this.pad(date.getMinutes(), 2) + ':' + this.pad(date.getSeconds(), 2);
        }
        return this.pad(date.getDate(), 2) + separator + this.pad(1 + date.getMonth(), 2) + separator + date.getFullYear() + ' ' + this.pad(date.getHours(), 2) + ':' + this.pad(date.getMinutes(), 2) + ':' + this.pad(date.getSeconds(), 2)
    },
    pad: function (num, size) {
        var s = num + "";
        while (s.length < size)
            s = "0" + s;
        return s;
    },
    notImplemented: function () {
        console.log('not implemented');
        // $('#dialog_notimplemented').dialog();
    },
    openDialog : function(title, content, save, close, saveCallback){

        $('#modalTitle').html(title);
        $('#modalContent').html(content);
        $('#modalSave').html(save);
        $('#modalClose').html(close);
        $('#modalError').html("");
        $('#modalSave').attr("disabled",false);
        $('#modalClose').attr("disabled",false);

        $('#modalSave').unbind('click');
        $('#modalSave').click(saveCallback);
        $('#modal').modal('show');
    },
    closeDialog : function(){
        $('#modal').modal('hide');
    },
    setDialogError : function(title, message){
        var error = '<div class="alert alert-danger">';
        error += '<strong>' + title + '</strong> ' + message;
        error += '</div>';

        $('#modalError').html(error);
    },
    showInfoBox : function(title, content){
        $('#infoBox').html("<strong>" + title + "</strong> " + content);
        $("#infoBox").css( {
            position:"fixed",
            left:"50%",
            top: "50%",
            "margin-top": ("-"+($("#infoBox").height()/2))+"px",
            "margin-left": ("-"+($("#infoBox").width()/2))+"px",
            "z-index": 999
        });
        $('#infoBox').fadeIn('slow');

        // calculate timeout based on content length
        var timeout = $('#infoBox').html().length * 75;
        window.setTimeout(function(){$('#infoBox').fadeOut('slow');},timeout);
    },
     safe_tags : function(str) {
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') ;
    }

};