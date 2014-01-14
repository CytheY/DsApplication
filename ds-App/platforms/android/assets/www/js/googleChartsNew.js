google.load("visualization", "1", {
    packages: ["corechart"]
});
loaded = false;
data = null;
google.setOnLoadCallback(function () {
    loaded = true;
});


function drawChart() {
    if (!loaded) {
        console.info("Not yet loaded");
        window.setTimeout(drawChart, 1000);
        return
    }

    data = google.visualization.arrayToDataTable(data);
    var options = {
        title: 'Arduino-Weatherstation',
        interpolateNulls: true,
        series: { // Two scales
    0: {
                targetAxisIndex: 0
            },
            1: {
                targetAxisIndex: 0
            },
            2: {
                targetAxisIndex: 1
            }
        },
        vAxes: {
            0: {
                textStyle: {
                    color: 'black'
                }
            },
            1: {
                textStyle: {
                    color: 'black'
                }
            }
        }
    };

    data.sort([{
        column: 0
    }]);
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}