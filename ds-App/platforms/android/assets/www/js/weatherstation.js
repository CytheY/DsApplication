// 'https://doubleslash-sandbox.axeda.com/services/v1/rest/Scripto/execute/wsAppGetItems?serialNumber=555612',




/**
 * Callback for ajax axeda request
 * @param data JSON String containing weather data
 */
function myCallback(data) {

	var tempVal = [];
	var humVal = [];
	var presVal = [];
	
	var tempTime = [];
	var humTime = [];
	var presTime = [];

    var values = [tempVal, humVal, presVal];
    var timestamps = [tempTime, humTime, presTime];

    for (var index in data) {
        for (var indexInData in data[index]) {
            var keyVal = values[index].length;
            var keyTime = timestamps[index].length;
            values[index][keyVal] = data[index][indexInData].value;
            var a = toDate(data[index][indexInData].timestamp);
            timestamps[index][keyTime] = a;
        }
    }
    
	$('#loading').removeClass("loading");
	document.getElementById("plotArea1").style.display="";
    drawTemp(tempTime,tempVal);
    drawHum(humTime,humVal);
    drawPres(presTime,presVal);
    $('#plotArea1').show();
	
}
/**
 * Converts UNIX timestamp into Human readable Date
 * @param time UNIX timestamp
 * @returns {Date}
 */
function toDate(time) {
    var date = new Date(time);

    //date.setSeconds(0, 0);
    return date;
}

function weatherCheckCallback(){
	
}

/**
 * AeroGear Pipeline connection to axeda platform via groovy-scripto 
 **/
var pipeline;
var dataManager;
var weatherstation = {
	initialize : function() {
		// this.initPipe();
		this.initDataManager();
	},

	initPipe : function() {
		pipeline = AeroGear.Pipeline();
		pipeline.add({
			name : "axedaWS",
			settings : {
				baseURL : this.getURL(),
				endpoint : this.getEndpoint() + this.addUserCredentials()
			}
		});

		console.log("REST URL: " + this.getURL() + this.getEndpoint());
	},
	addPipeWsCheck : function() {
		pipeline.add({
			name : "weatherCheck",
			settings : {
				baseURL : this.getURL(),
				endpoint : "js_checkAssetOnline?modelName=WeatherStation" + this.addUserCredentials();
			}
		});
		console.log("REST URL: " + "js_checkAssetOnline?modelName=WeatherStation" + this.addUserCredentials());
	},

	getPipe : function(pipeName) {
		return pipeline.pipes[pipeName];
	},

	getURL : function() {
		return config.restAxedaURL;
	},

	getEndpoint : function() {
		return config.axedaFunction + "?serialNumber=" + config.axedaSerial + "&historyDays="+ config.axedaHistoryDays;;
	},

	addUserCredentials : function() {
		return "&username=jschneider&password=Breisgauer";
	},
	getPlot : function(serial){
		document.getElementById("plotArea1").style.display="none";
		$('#loading').addClass("loading");
		$('#plotArea1').hide();
		this.reset();
		if (serial){
			config.axedaSerial = serial;
		}
		this.initPipe();
		var myPipe = this.getPipe("axedaWS");
		myPipe.read({
			jsonp : {
				customCallback : "myCallback"
			},
			error : function(jqXHR, textStatus, errorThrown) {
				alert("There is no device with the serial '" + config.axedaSerial + "'!");
			}
		});
	},
	checkWsOnline : function(){
		this.initPipe();
		this.addPipeWsCheck();
		var myPipe = this.getPipe("weatherCheck");
		myPipe.read({
			jsonp : {
				customCallback : "weatherCheckCallback" 
			},
			error : function(jqXHR, textStatus, errorThrown) {
				alert("Request failed");
			}
		});
	},
	reset : function() {
		// reset document
		document.getElementById("temp").innerHTML = "";
	}
};

