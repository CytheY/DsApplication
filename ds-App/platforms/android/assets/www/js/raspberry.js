

function raspRegisterCallback(data) {
    $('#register_status').removeClass();
    switch(data[0].Status){
    case "now Registered":
    	$('#register_status').addClass('alert').addClass('alert-success');
    	$('#register_status').html(data[0].Status);
    	break;
    case "already Registered":
    	$('#register_status').addClass('alert').addClass('alert-info');
    	$('#register_status').html(data[0].Status);
    	break;
    default:
    	$('#register_status').addClass('alert').addClass('alert-danger');
        $('#register_status').html(data[0].Status);
        break;
    }
    
    
}

function raspOpenCallback(data){
	$('#open_status').removeClass();
	switch(data[0].msg){
	case "Command for LED toggle sent":
		$('#open_status').addClass('alert').addClass('alert-success');
    	$('#open_status').html(data[0].msg);
		break;
	case "Not Registered":
		$('#open_status').addClass('alert').addClass('alert-danger');
		$('#open_status').html(data[0].msg);
		break;
	default:
		$('#open_status').addClass('alert').addClass('alert-danger');
	    $('#open_status').html(data[0].msg);
	    break;
	}
}

function raspCheckCallback(data){
	var online = data.devices[0].online;
	if(online){
		$('#rasp_status').removeClass();
		$('#rasp_status').addClass('label').addClass('label-success').html("Online");
	}else{
		$('#rasp_status').removeClass();
		$('#rasp_status').addClass('label').addClass('label-danger').html("Offline");
	}
}



var pipeline;
var dataManager;

var raspberry = {
		initPipe : function(){
			pipeline = AeroGear.Pipeline();
		},
		addPipeRegister : function(){
			pipeline.add({
				name : "raspRegister",
				settings : {
					baseURL : this.getURL(),
					endpoint : this.getEndpointRegister() + this.addUserCredentials()
				}
			});

			console.log("REST URL: " + this.getURL() + this.getEndpointRegister());
		},
		addPipeOpen : function(){
			pipeline.add({
				name : "raspOpen",
				settings : {
					baseURL : this.getURL(),
					endpoint : this.getEndpointOpen() + this.addUserCredentials()
				}
			});
			console.log("REST URL: " + this.getURL() + this.getEndpointOpen());
		},
		getPipe : function(pipeName) {
			return pipeline.pipes[pipeName];
		},

		getURL : function() {
			return raspRegisterConfig.restAxedaURL;
		},

		getEndpointRegister : function() {
			return raspRegisterConfig.axedaFunctionRegister + "?macAddress=" + raspRegisterConfig.axedaMacAddress;
		},
		getEndpointOpen : function() {
			return raspRegisterConfig.axedaFunctionOpen + "?Mac_Address=" + raspRegisterConfig.axedaMacAddress;
		},
		getEndpointMorse : function(){
			return raspRegisterConfig.axedaFunctionMorse + "?morse=" + morse.toString();
		},
		addUserCredentials : function() {
			return "&username=jschneider&password=Breisgauer1";
		},

		initDataManager : function() {
			dataManager = AeroGear.DataManager();
			dataManager.add([ {
				name : "serial",
				settings : {
					recordId : "id",
					type : "sessionStorage"
				}
			} ]);
		},

		getDataManager : function(storeName) {
			return dataManager.stores[storeName];
		},
		open : function(btAdress){
			raspRegisterConfig.axedaMacAddress = btAdress;
			this.initPipe();
			this.addPipeOpen();
			var myPipe = this.getPipe("raspOpen");
			myPipe.read({
				jsonp : {
					customCallback : "raspOpenCallback" 
				},
				error : function(jqXHR, textStatus, errorThrown) {
					alert("Open failed! Error:");
				}
			});
		},
		register : function(btAdress){
			raspRegisterConfig.axedaMacAddress = btAdress;
			this.initPipe();
			this.addPipeRegister();
			var myPipe = this.getPipe("raspRegister");
			myPipe.read({
				jsonp : {
					customCallback : "raspRegisterCallback" 
				},
				error : function(jqXHR, textStatus, errorThrown) {
					alert("Register Failed!");
				}
			});
		}
};