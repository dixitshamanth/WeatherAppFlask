# Flask code for backend
from logging import Logger
from flask import Flask, json, jsonify, request
import requests
from flask_cors import CORS, cross_origin

# hagVFkifSvENf3pxjrGKE9XY6qjKcFb2
# J3UE83FfZ4JyTmnWXHfaCS7V3l7KmCAd
tomorrow_api_key = "hagVFkifSvENf3pxjrGKE9XY6qjKcFb2"
geolocation_api_key = "AIzaSyCU_5v_FyBbMA43fyyC-Exc4PujUg__D6w"

CORS_URL = "*"
application = Flask(__name__, static_url_path='/static')
cors = CORS(application)
application.config['CORS_HEADERS'] = 'Content-Type'


@application.route('/')
@cross_origin(CORS_URL)
def send_index():
    return application.send_static_file('index.html')


@application.route('/weatherSearch', methods=['GET'])
@cross_origin(CORS_URL)
def get_weather_details():
    autoLocation = request.args.get('autoLocation')
    if autoLocation == "on":
        myLocation = str(request.args.get('autoloc'))
        formatted_address = ""
    else:
        address = request.args.get('address')
        city = request.args.get('city')
        state = request.args.get('state')

        fullAddress = address.replace(
            " ", "+")+"+"+city.replace(" ", "+")+"+"+state
        geoLocation = requests.get(
            "https://maps.googleapis.com/maps/api/geocode/json?address="+fullAddress+"&key="+geolocation_api_key).json()
        lat = str(geoLocation['results'][0]['geometry']['location']['lat'])
        long = str(geoLocation['results'][0]['geometry']['location']['lng'])
        myLocation = lat+","+long
        formatted_address = str(geoLocation['results'][0]['formatted_address'])
    application.logger.info(myLocation)

    res = requests.get("https://api.tomorrow.io/v4/timelines?location=" +
                       myLocation + "&fields=temperature,temperatureApparent,temperatureMin,temperatureMax,windSpeed,windDirection,humidity,pressureSeaLevel,uvIndex,weatherCode,precipitationProbability,precipitationType,sunriseTime,sunsetTime,visibility,moonPhase,cloudCover&timesteps=1d,1h&units=imperial&timezone=America/Los_Angeles&apikey="
                       + tomorrow_api_key)
    statusCode = res.status_code
    response = res.json()

    weather_values = []
    firstArray = []
    secondArray = []
    if(statusCode == 200):
        for i in response["data"]["timelines"][0]["intervals"]:
            i["values"]["Date"] = i["startTime"]
            i["values"]["myAddress"] = formatted_address
            weather_values.append(i["values"])
        firstArray = sorted(weather_values, key=lambda x: x["Date"])
        secondArray = response["data"]["timelines"][1]["intervals"]
    apiResponse = [firstArray, secondArray, statusCode]
    return jsonify(apiResponse)


if __name__ == "__main__":
    application.run()
