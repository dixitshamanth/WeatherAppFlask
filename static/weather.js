const ipinfo_token = "9a3cc1c614ebc4"

//function to handle weather search
$(function () {

    $("#autoLocation").click(function () {
        if ($(this).is(":checked")) {
            $("#address").attr("disabled", "disabled");
            $("#city").attr("disabled", "disabled");
            $("#state").attr("disabled", "disabled");
            $("#address").val('');
            $("#city").val('');
            $("#state").val('');
        } else {
            $("#address").removeAttr("disabled");
            $("#city").removeAttr("disabled");
            $("#state").removeAttr("disabled");
        }
    });

    $("#reset-button").click(function () {
        $("#address").removeAttr("disabled");
        $("#city").removeAttr("disabled");
        $("#state").removeAttr("disabled");
    }
    );



    $('#search-form').on('submit', function (event) {
        event.preventDefault()
        if ($('#autoLocation').is(':checked')) {
            console.log("Auto-location")
            $.ajax({  //ipinfo call
                url: 'https://ipinfo.io/',
                data: { 'token': ipinfo_token },
                type: 'GET',
                success: function (response) {
                    responseAddress = response.city + ", " + response.region + ", " + response.country
                    console.log("IPinfo response:", response)
                    $.ajax({  // auto-location
                        url: '/weatherSearch',
                        data: { autoloc: response.loc, autoLocation: "on" },
                        type: 'GET',
                        success: function (response) {
                            console.log("Flask autolocation response:", response)
                            if (response[2] == 200) {
                                todayCard(response, responseAddress)
                            }
                            else {
                                errorCard()
                            }
                        },
                        error: function (error) {
                            console.log("Flask backend call error:", error);
                        }
                    });
                },
                error: function (error) {
                    console.log("IPinfo call error:", error);
                }
            });
        }
        else {
            console.log("Search through form")

            $.ajax({ // flask ajax call with form address
                url: '/weatherSearch',
                data: $('form').serialize(),
                type: 'GET',
                success: function (response) {
                    console.log("Flask response for form:", response)
                    if (response[2] == 200) {
                        todayCard(response, "")
                    }
                    else {
                        errorCard()
                    }
                },
                error: function (error) {
                    console.log(error);
                }
            });


        }

    });

})

function errorCard() {
    clearAll();
    document.getElementById("edwatCard").style.display = null
}

function clearAll() {

    document.getElementById("table15").style.display = "none";
    document.getElementById("todaycard").style.display = "none";
    document.getElementById("dailycard").style.display = "none";
    chartContainer = document.getElementById("container");
    chartContainer.style.display = "none";
    chartContainer2 = document.getElementById("container2");
    chartContainer2.style.display = "none";
    arrowDiv = document.getElementById("arrow")
    arrowDiv.innerHTML = "<a href=\"#arrow\"><img style=\"width: 4%\" src=\"/static/Images/point-down.png\" onclick=\"showCharts()\"></img>"
    document.getElementById("edwatCard").style.display = "none"
}

dayDict = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday"
}

monthDict = { 0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr', 4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug', 8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dec' }

function getFormattedDate(dateobj) {
    dateObject = new Date(dateobj)
    day = dayDict[dateObject.getDay()]
    date = dateObject.getDate()
    if (date < 10) date = "0" + date;
    month = monthDict[dateObject.getMonth()]
    year = dateObject.getFullYear()
    return day + ", " + date + " " + month + " " + year;
}

function todayCard(responseObject, addressline) {

    // var url = location.href;               //Save down the URL without hash.
    // location.href = "#dailycard";                 //Go to the target element.
    // history.replaceState(null, null, url);

    document.getElementById("edwatCard").style.display = "none"

    dailyCard = document.getElementById("dailycard")
    dailyCard.style.display = "none"

    card = document.getElementById("todaycard")
    card.style.display = null

    tableElement = document.getElementById("table15")
    tableElement.style.display = "table"


    tomorrowResponse = responseObject
    if (addressline == "") {
        addressline = responseObject[0][0].myAddress;
    }


    document.getElementById("addressDeeets").innerHTML = addressline
    document.getElementById("temperature").innerHTML = tomorrowResponse[0][0].temperature + String.fromCharCode(176);
    document.getElementById("humidity").innerHTML = tomorrowResponse[0][0].humidity + "%";
    document.getElementById("pressure").innerHTML = tomorrowResponse[0][0].pressureSeaLevel + " inHg";
    document.getElementById("windspeed").innerHTML = tomorrowResponse[0][0].windSpeed + "mph";
    document.getElementById("visibility").innerHTML = tomorrowResponse[0][0].visibility + "mi";
    document.getElementById("cloudcover").innerHTML = tomorrowResponse[0][0].cloudCover + "%";
    document.getElementById("uvlevel").innerHTML = tomorrowResponse[0][0].uvIndex;


    document.getElementById("weatherdesc").innerHTML = weatherMaps[tomorrowResponse[0][0].weatherCode][0];
    document.getElementById("mappedimg").src = weatherMaps[tomorrowResponse[0][0].weatherCode][1];

    tableCells = document.getElementsByTagName("td")

    i = 0
    j = 0

    if (tomorrowResponse[0].length < 15) {
        last1row = document.getElementById("last1Row")
        last1row.style.display = "none"
        last2row = document.getElementById("last2Row")
        last2row.style.display = "none"
    }
    else if (tomorrowResponse[0].length < 16) {
        last1row = document.getElementById("last1Row")
        last1row.style.display = "none"
        last2row = document.getElementById("last2Row")
        last2row.style.display = null
    }
    else {
        last1row = document.getElementById("last1Row")
        last1row.style.display = null
        last2row = document.getElementById("last2Row")
        last2row.style.display = null
    }
    console.log(tomorrowResponse[0].length)

    while (j < (tomorrowResponse[0].length * 5) && i < tomorrowResponse[0].length) {

        tableCells[j].innerHTML = getFormattedDate(tomorrowResponse[0][i].Date)
        j++
        tableCells[j].innerHTML = "<figure style=\"margin-inline-start:unset;margin-inline-end:unset;\"><img style=\"display:inline-block; vertical-align:middle;\" src=\"" + weatherMaps[tomorrowResponse[0][i].weatherCode][1] + "\" width=\"20%\">" + "<figcaption style=\"display:inline-block; vertical-align:middle; padding-left:4px;\">" + weatherMaps[tomorrowResponse[0][i].weatherCode][0] + "</figcaption>" + "</figure>"
        j++
        tableCells[j].innerHTML = tomorrowResponse[0][i].temperatureMax
        j++
        tableCells[j].innerHTML = tomorrowResponse[0][i].temperatureMin
        j++
        tableCells[j].innerHTML = tomorrowResponse[0][i].windSpeed
        j++
        i++
    }




}

function blueCard(index) {

    // console.log("here")

    // var url = location.href;               //Save down the URL without hash.
    // location.href = "#dailycard";                 //Go to the target element.
    // history.replaceState(null, null, url);

    precipitationDict = {
        "0": "N/A",
        "1": "Rain",
        "2": "Snow",
        "3": "Freezing Rain",
        "4": "Ice Pellets"
    }
    ptype = tomorrowResponse[0][index].precipitationType.toString();

    d1 = new Date(tomorrowResponse[0][index].sunriseTime)
    d2 = new Date(tomorrowResponse[0][index].sunsetTime)
    h1 = d1.getHours()
    h2 = d2.getHours() % 12
    m1 = d1.getMinutes()
    m2 = d2.getMinutes();


    if (m1 < 10) {
        m1 = "0" + m1.toString()
    }
    if (m2 < 10) {
        m2 = "0" + m2.toString()
    }


    document.getElementById("table15").style.display = "none";
    document.getElementById("todaycard").style.display = "none";
    document.getElementById("dailycard").style.display = null;
    document.getElementById("edwatCard").style.display = "none"

    document.getElementById("blueday").innerHTML = getFormattedDate(tomorrowResponse[0][index].Date)
    document.getElementById("blueweather").innerHTML = weatherMaps[tomorrowResponse[0][index].weatherCode][0];
    document.getElementById("bluetemp").innerHTML = tomorrowResponse[0][index].temperatureMax + String.fromCharCode(176) + "F/" + tomorrowResponse[0][index].temperatureMin + String.fromCharCode(176) + "F";

    document.getElementById("blueicon").src = weatherMaps[tomorrowResponse[0][index].weatherCode][1];

    document.getElementById("blueprecipitation").innerHTML = precipitationDict[ptype]
    document.getElementById("bluechanceofrain").innerHTML = tomorrowResponse[0][index].precipitationProbability.toString() + "%";
    document.getElementById("bluewindspeed").innerHTML = tomorrowResponse[0][index].windSpeed + "mph";
    document.getElementById("bluehumidity").innerHTML = tomorrowResponse[0][index].humidity + "%";
    document.getElementById("bluevisibility").innerHTML = tomorrowResponse[0][index].visibility + "mi";
    document.getElementById("bluesunrise").innerHTML = h1 + ":" + m1 + " AM/" + h2 + ":" + m2 + " PM"

    createChart1(tomorrowResponse)
    createChart2(tomorrowResponse)
}



function showCharts() {
    arrowDiv = document.getElementById("arrow")
    arrowDiv.innerHTML = "<a href=\"#dailycard\"><img style=\"width: 4%\" src=\"/static/Images/point-up.png\" onclick=\"hideCharts()\"></img></a>"
    chartContainer = document.getElementById("container");
    chartContainer.style.display = null;
    chartContainer2 = document.getElementById("container2");
    chartContainer2.style.display = null;

}

function hideCharts() {
    arrowDiv = document.getElementById("arrow")
    arrowDiv.innerHTML = "<a href=\"#arrow\"><img style=\"width: 4%\" src=\"/static/Images/point-down.png\" onclick=\"showCharts()\"></img>"
    chartContainer = document.getElementById("container");
    chartContainer.style.display = "none";
    chartContainer2 = document.getElementById("container2");
    chartContainer2.style.display = "none";
}


function createChart1(tomorrowResponse) {

    chartData = []
    for (i = 0; i < tomorrowResponse[0].length; i++) {
        if (tomorrowResponse[0][i]) {
            date = new Date(tomorrowResponse[0][i].Date)
            tempMin = tomorrowResponse[0][i].temperatureMin
            tempMax = tomorrowResponse[0][i].temperatureMax
            temparray = [date.getTime(), tempMin, tempMax]
            chartData.push(temparray)
        }
    }
    console.log(chartData)




    Highcharts.chart('container', {

        chart: {
            type: 'arearange',
            zoomType: 'x',
            scrollablePlotArea: {
                minWidth: 600,
                scrollPositionX: 1
            }
        },

        title: {
            text: 'Temperature Ranges (Min,Max)'
        },

        xAxis: {
            type: 'datetime',
        },

        yAxis: {
            title: {
                text: null
            }
        },
        plotOptions: {
            series: {
                fillColor: {
                    linearGradient: [0, 0, 0, 230],
                    stops: [
                        [0, '#f9a928'],
                        [1, '#dbe7f5']
                    ]
                }
            }
        },

        tooltip: {
            crosshairs: true,
            shared: true,
            valueSuffix: String.fromCharCode(176) + 'F',
            xDateFormat: '%A, %b %e'
        },

        legend: {
            enabled: false
        },

        series: [{
            name: 'Temperatures',
            data: chartData,
            lineColor: '#f9a928'
        }]

    });


}

function createChart2(tomorrowResponse) {

    function Meteogram(metData, container) {
        // Parallel arrays for the chart data, these are populated as the JSON file
        // is loaded
        this.humidity = [];
        this.winds = [];
        this.temperatures = [];
        this.pressures = [];

        // Initialize
        this.metData = metData;
        this.container = container;

        // Run
        this.parseYrData();
    }


    /**
     * Build and return the Highcharts options structure
     */
    Meteogram.prototype.getChartOptions = function () {
        return {
            chart: {
                renderTo: this.container,
                marginBottom: 70,
                marginRight: 40,
                marginTop: 50,
                plotBorderWidth: 1,
                height: 450,
                alignTicks: true,
                scrollablePlotArea: {
                    minWidth: 720
                }
            },

            title: {
                text: 'Hourly Weather (For Next 5 Days)',
                align: 'center',
                style: {
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis'
                }
            },

            tooltip: {
                shared: true,
                useHTML: true,
                headerFormat:
                    '<small>{point.x:%A, %b %e, %H:%M}'

            },

            credits: {
                text: 'Forecast',
                position: {
                    x: -40
                }
            },

            xAxis: [{ // Bottom X axis
                type: 'datetime',
                tickInterval: 4 * 36e5,
                minorTickInterval: 1 * 36e5,
                tickLength: 0,
                gridLineWidth: 1,
                gridLineColor: 'rgba(128, 128, 128, 0.1)',
                startOnTick: false,
                endOnTick: false,
                minPadding: 0,
                maxPadding: 0,
                offset: 30,
                showLastLabel: true,
                labels: {
                    format: '{value:%H}'
                },
                crosshair: true
            }, { // Top X axis
                linkedTo: 0,
                type: 'datetime',
                tickInterval: 24 * 3600 * 1000,
                labels: {
                    format: '{value:<span style="font-size: 12px; font-weight: bold">%a</span> %b %e}',
                    align: 'left',
                    x: 3,
                    y: -5
                },
                opposite: true,
                tickLength: 30,
                gridLineWidth: 0.5
            }],

            yAxis: [{ // temperature axis
                title: {
                    text: null
                },
                labels: {
                    format: '{value}\xB0',
                    style: {
                        fontSize: '10px'
                    },
                    x: -3
                },
                plotLines: [{ // zero plane
                    value: 0,
                    color: '#BBBBBB',
                    width: 1,
                    zIndex: 2
                }],
                maxPadding: 0.3,
                minRange: 8,
                tickInterval: 1,
                gridLineColor: 'rgba(128, 128, 128, 0.1)'

            }, { // humidity axis
                title: {
                    text: null
                },
                labels: {
                    enabled: false
                },
                gridLineWidth: 0,
                tickLength: 0,
                minRange: 10,
                min: 0

            }, { // Air pressure
                allowDecimals: false,
                title: { // Title on top of axis
                    text: 'inHG',
                    offset: 0,
                    align: 'high',
                    rotation: 0,
                    style: {
                        fontSize: '10px',
                        color: '#FEA611'
                    },
                    textAlign: 'left',
                    x: 3
                },
                labels: {
                    style: {
                        fontSize: '8px',
                        color: '#FEA611'
                    },
                    y: 2,
                    x: 3
                },
                gridLineWidth: 0,
                opposite: true,
                showLastLabel: false
            }],

            legend: {
                enabled: false
            },

            plotOptions: {
                series: {
                    pointPlacement: 'between'
                }
            },


            series: [{
                name: 'Temperature',
                data: this.temperatures,
                type: 'spline',
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                },
                tooltip: {
                    pointFormat: '<br/><span style="color:{point.color}">\u25CF</span> ' +
                        '{series.name}: <b>{point.y}\xB0F</b><br/>'
                },
                zIndex: 1,
                color: '#FF3333',
                negativeColor: '#48AFE8'
            }, {
                name: 'Humidity',
                data: this.humidity,
                type: 'column',
                color: '#68CFE8',
                yAxis: 1,
                groupPadding: 0,
                pointPadding: 0,
                grouping: false,
                dataLabels: {
                    enabled: true,
                    filter: {
                        operator: '>',
                        property: 'y',
                        value: 0
                    },
                    style: {
                        fontSize: '8px',
                        color: 'grey'
                    }
                },
                tooltip: {
                    valueSuffix: ' %'
                }
            }, {
                name: 'Air pressure',
                color: '#FEA611',
                data: this.pressures,
                marker: {
                    enabled: false
                },
                shadow: false,
                tooltip: {
                    valueSuffix: ' inHg'
                },
                dashStyle: 'shortdot',
                yAxis: 2
            }, {
                name: 'Wind',
                type: 'windbarb',
                id: 'windbarbs',
                color: Highcharts.getOptions().colors[1],
                lineWidth: 1.5,
                data: this.winds,
                vectorLength: 18,
                yOffset: -15,
                tooltip: {
                    valueSuffix: ' mph'
                }
            }]
        };
    };

    /**
 * Draw blocks around wind arrows, below the plot area
 */
    Meteogram.prototype.drawBlocksForWindArrows = function (chart) {
        const xAxis = chart.xAxis[0];

        for (
            let pos = xAxis.min, max = xAxis.max, i = 0;
            pos <= max + 36e5; pos += 36e5,
            i += 1
        ) {

            // Get the X position
            const isLast = pos === max + 36e5,
                x = Math.round(xAxis.toPixels(pos)) + (isLast ? 0.5 : -0.5);

            // Draw the vertical dividers and ticks
            const isLong = this.resolution > 36e5 ?
                pos % this.resolution === 0 :
                i % 2 === 0;

            chart.renderer
                .path([
                    'M', x, chart.plotTop + chart.plotHeight + (isLong ? 0 : 28),
                    'L', x, chart.plotTop + chart.plotHeight + 32,
                    'Z'
                ])
                .attr({
                    stroke: chart.options.chart.plotBorderColor,
                    'stroke-width': 1
                })
                .add();
        }

        // Center items in block
        chart.get('windbarbs').markerGroup.attr({
            translateX: chart.get('windbarbs').markerGroup.translateX + 8
        });

    };

    /**
     * Post-process the chart from the callback function, the second argument
     * Highcharts.Chart.
     */
    Meteogram.prototype.onChartLoad = function (chart) {

        this.drawBlocksForWindArrows(chart);

    };

    /**
     * Create the chart. This function is called async when the data file is loaded
     * and parsed.
     */
    Meteogram.prototype.createChart = function () {
        this.chart = new Highcharts.Chart(this.getChartOptions(), chart => {
            this.onChartLoad(chart);
        });
    };

    Meteogram.prototype.error = function () {
        document.getElementById('loading').innerHTML =
            '<i class="fa fa-frown-o"></i> Failed loading data, please try again later';
    };

    /**
     * Handle the data. This part of the code is not Highcharts specific, but deals
     * with yr.no's specific data format
     */
    Meteogram.prototype.parseYrData = function () {

        let pointStart;

        if (!this.metData) {
            return this.error();
        }

        // Loop over hourly (or 6-hourly) forecasts
        this.metData.forEach((node, i) => {

            const x = Date.parse(node.startTime);
            // nextHours = node.data.next_1_hours || node.data.next_6_hours,
            // to = node.data.next_1_hours ? x + 36e5 : x + 6 * 36e5;


            // Populate the parallel arrays
            // this.symbols.push(nextHours.summary.symbol_code);

            this.temperatures.push({
                x,
                y: node.values.temperature,
                // custom options used in the tooltip formatter
                // to,
                // symbolName: Meteogram.dictionary[
                //     symbolCode.replace(/_(day|night)$/, '')
                // ].text
            });

            this.humidity.push({
                x,
                y: Math.round(node.values.humidity)
            });

            if (i % 2 === 0) {
                this.winds.push({
                    x,
                    value: node.values.windSpeed,
                    direction: node.values.windDirection
                });
            }

            this.pressures.push({
                x,
                y: node.values.pressureSeaLevel
            });

            // if (i === 0) {
            //     pointStart = (x + to) / 2;
            // }
        });


        // Create the chart when the data is loaded
        this.createChart();
    };
    // End of the Meteogram protype


    // On DOM ready...

    new Meteogram(tomorrowResponse[1], 'container2');

}


var weatherMaps = {
    1000: [
        "Clear",
        "/static/Images/clear_day.svg",],
    1100: [
        "Mostly Clear",
        "/static/Images/mostly_clear_day.svg",
    ],
    1101: [
        "Partly Cloudy",
        "/static/Images/partly_cloudy_day.svg",
    ],
    1102: [
        "Mostly Cloudy",
        "/static/Images/mostly_cloudy.svg",
    ],
    1001: [
        "Cloudy",
        "/static/Images/cloudy.svg",
    ],
    2000: [
        "Fog",
        "/static/Images/fog.svg",
    ],
    2100: [
        "Light Fog",
        "/static/Images/fog_light.svg",
    ],
    8000: [
        "Thunderstorm",
        "/static/Images/tstorm.svg",
    ],
    5001: [
        "Flurries",
        "/static/Images/flurries.svg",
    ],
    5100: [
        "Light Snow",
        "/static/Images/snow_light.svg",
    ],
    5000: [
        "Snow",
        "/static/Images/snow.svg",
    ],
    5101: [
        "Heavy Snow",
        "/static/Images/snow_heavy.svg",
    ],
    7102: [
        "Light Ice Pellets",
        "/static/Images/ice_pellets_light.svg",
    ],
    7000: [
        "Ice Pellets",
        "/static/Images/ice_pellets.svg",
    ],
    7101: [
        "Heavy Ice Pellets",
        "/static/Images/ice_pellets_heavy.svg",
    ],
    4000: [
        "Drizzle",
        "/static/Images/drizzle.svg",
    ],
    6000: [
        "Freezing Drizzle",
        "/static/Images/freezing_drizzle.svg",
    ],
    6200: [
        "Light Freezing Rain",
        "/static/Images/freezing_rain_light.svg",
    ],
    6001: [
        "Freezing Rain",
        "/static/Images/freezing_rain.svg",
    ],
    6201: [
        "	Heavy Freezing Rain",
        "/static/Images/freezing_rain_heavy.svg",
    ],
    4200: [
        "	Light Rain",
        "/static/Images/rain_light.svg",
    ],
    4001: [
        "Rain",
        "/static/Images/rain.svg",
    ],
    4201: [
        "Heavy Rain",
        "/static/Images/rain_heavy.svg",
    ],
    3000: [
        "Light Wind",
        "/static/Images/light_wind.svg"
    ],
    3001: [
        "Wind",
        "/static/Images/wind.svg"
    ],
    3002: [
        "Strong wind",
        "/static/Images/strong_wind.svg"
    ]
}
