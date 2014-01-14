//google.load('visualization', '1', {packages: ['annotatedtimeline']});
google.load('visualization', '1', {
	packages : [ 'corechart' ]
});
/*
 * function drawVisualization() { var data = new
 * google.visualization.DataTable(); data.addColumn('date', 'Date');
 * data.addColumn('number', 'Temperatur');
 * 
 * for(var i=0; i<xaxisData.length; i++){
 * data.addRows([[xaxisData[i],parseFloat(yaxisData[i])]]); }
 * 
 * var annotatedtimeline = new google.visualization.AnnotatedTimeLine(
 * document.getElementById('visualization')); annotatedtimeline.draw(data,
 * {'displayAnnotations': true}); }
 */


function drawVisualization(date, temp, hum, pres) {

	var data1 = new google.visualization.DataTable();

	data1.addColumn('date', 'Datum');
	data1.addColumn('number', 'Temperatur °C');
	data1.addColumn('number', 'Humidity %');
	data1.addColumn('number', 'Pressure hPa');

	for (var i = 1; i < date.length; i++) {
		data1.addRow([ date[i], parseFloat(temp[i]), parseFloat(hum[i]),
				parseFloat(pres[i]) ]);
	}

	var options = {
		chartArea : {
			left : 10,
			top : 10,
			width : "100%",
			height : "75%"
		},
		backgroundColor : 'transparent',

		legend : {
			position : 'in'
		},
		vAxes : [ {
			title : 'Temperatur'
		}, // Left axis
		{
			title : 'Humidity'
		}, // Right axis
		{
			title : 'Pressure'
		} // Right axis
		],
		series : [ {
			targetAxisIndex : 2
		}, {
			targetAxisIndex : 1
		}, {
			targetAxisIndex : 0
		} ],

	};

	var chart = new google.visualization.LineChart(document
			.getElementById('temp'));

	chart.draw(data1, options);
}
google.setOnLoadCallback(drawVisualization);


var dataTemp = null;
var chartTemp = null;
var optionsTemp = null;

/**
 * draws a Temperature chart
 */
function drawTemp(date, temp) {

	dataTemp = new google.visualization.DataTable();

	dataTemp.addColumn('date', 'Datum');
	dataTemp.addColumn('number', 'Temperatur \u00B0C');

	for (var i = 1; i < date.length; i++) {
		dataTemp.addRow([ date[i], parseFloat(temp[i]) ]);
	}

	optionsTemp = {
	
		colors:['red'],
		legend : {
			position : 'in'
		},
		vAxes : [ {
			title : 'Temperature',
			textStyle: {
                color: 'black'
            }
		}, // Left axis

		],

	};

	chartTemp = new google.visualization.LineChart(document
			.getElementById('temp'));

	chartTemp.draw(dataTemp, optionsTemp);
}
google.setOnLoadCallback(drawTemp);

var dataHum = null;
var chartHum = null;
var optionsHum = null;

/**
 * draws humidity chart
 * @param date
 * @param hum
 */
function drawHum(date, hum) {

	dataHum = new google.visualization.DataTable();

	dataHum.addColumn('date', 'Datum');
	dataHum.addColumn('number', 'Humidity %');

	for (var i = 1; i < date.length; i++) {
		dataHum.addRow([ date[i], parseFloat(hum[i]) ]);
	}

	optionsHum = {
		
		colors:['blue'],

		legend : {
			position : 'in'
		},
		vAxes : [ {
			title : 'Humidity',
			textStyle: {
                color: 'black'
            }
		}, // Right axis
		],

	};

	chartHum = new google.visualization.LineChart(document
			.getElementById('hum'));

	chartHum.draw(dataHum, optionsHum);
}
google.setOnLoadCallback(drawHum);

var dataPres = null;
var chartPres = null;
var optionsPres = null;
/**
 * draw pressure chart
 * @param date
 * @param pres
 */
function drawPres(date, pres) {

	dataPres = new google.visualization.DataTable();

	dataPres.addColumn('date', 'Datum');
	dataPres.addColumn('number', 'Pressure hPa');

	for (var i = 1; i < date.length; i++) {
		dataPres.addRow([ date[i], parseFloat(pres[i]) ]);
	}

	optionsPres = {
		
		
		colors:['orange'],

		legend : {
			position : 'in'
		},
		vAxes : [ {
			title : 'Pressure',
			textStyle: {
                color: 'black'
            }
		} // Right axis
		],

	};

	chartPres = new google.visualization.LineChart(document
			.getElementById('pres'));

	chartPres.draw(dataPres, optionsPres);
}
google.setOnLoadCallback(drawPres);

function redrawCharts(){
	chartTemp.draw(dataTemp, optionsTemp);
	chartHum.draw(dataHum, optionsHum);
	chartPres.draw(dataPres, optionsPres);
}
