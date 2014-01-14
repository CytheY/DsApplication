
function successRegisterFunction(result) {
	raspberry.register(result);
}
function successOpenFunction(result) {
	raspberry.open(result);
}
function successFunction(result){ 
	alert(result);
}
function failFunction(error) {
	
}
window.onload = function() {
	$('#plotArea1').hide();
	updateDeviceListContent();
};

$(document).on("pageinit", "#deviceList", function() {
	$(document).on("swipeleft swiperight", "#deviceList", function(e) {
		// We check if there is no open panel on the page because otherwise
		// a swipe to close the left panel would also open the right panel (and
		// v.v.).
		// We do this by checking the data that the framework stores on the page
		// element (panel: open).
		if ($.mobile.activePage.jqmData("panel") !== "open") {
			if (e.type === "swipeleft") {
				$("#right-panel").panel("open");
			} else if (e.type === "swiperight") {
				$("#left-panel").panel("open");
			}
		}
	});
});

$(function() {
	$('#sliderApply').on('click', function clickHandler(event) {
		weatherstation.reset();
		config.axedaHistoryDays = $('#slider-fill').val();
		weatherstation.getPlot(config.axedaSerial);
	});
});

/**
 * weatherstation historyDays controll bar 
 */
var oldValue = 'X';

$(function() {
	$('#plotDays > button').bind('click',function(){
		weatherstation.reset();
		var newValue = $(this).html();
		config.axedaHistoryDays = newValue;
		weatherstation.getPlot(config.axedaSerial);
		$('#plotArea1').removeClass('hide');
		var newText = $('#xdays').html().replace(oldValue,newValue);
		$('#xdays').html(newText);
		oldValue = newValue;
	});
	
	$('#register').bind('click',function(){
		$('#register_status').addClass('hide');
		cordova.exec(successRegisterFunction, failFunction, 'BluetoothUtil', 'getBtAdress', []);
	});
	$('#open').bind('click',function(){
		$('#open_status').addClass('hide');
		cordova.exec(successOpenFunction, failFunction, 'BluetoothUtil', 'getBtAdress', []);
	});
	$('#position').bind('click',function(){navigator.geolocation.getCurrentPosition(onSuccess, onError);});
	$('#echo').bind('click',function(){
		
		cordova.exec(successFunction, failFunction, 'BluetoothUtil', 'getBtAdress', []);
	});
	
//	raspberry.checkAgent();
//	weatherstation.checkWsOnline();

	
	google.maps.event.addDomListener(window, 'load', initialize);
//	var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });
});


/**
 * redraws charts on screen resize
 */
$( window ).resize(function() {
	redrawCharts();
});
var cityCircle;
var map;

function initialize() {
  var raspberryLatlng = new google.maps.LatLng(47.662329, 9.498535);
  var mapOptions = {
    zoom: 100,
    center: raspberryLatlng
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
  
  var markerRaspberry = new google.maps.Marker({
      position: raspberryLatlng,
      map: map,
      title: 'Raspberry'
  });
  
  var raspPositionOptions = {
		  fillColor: '#FF0000',
	      fillOpacity: 0.35,
	      map: map,
	      center: raspberryLatlng,
	      radius:5
  };
  
  cityCircle = new google.maps.Circle(raspPositionOptions);
  
}