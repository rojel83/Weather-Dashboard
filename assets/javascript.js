$(document).ready(function() {
    loadCityBtns()
    getWeather()
});


var searchArr = JSON.parse(localStorage.getItem("searchList"));
var key = "a11a1e9269e13230951ba04ac2f8b89c";
var currentCity = "atlanta";


$(".searches").on("click", "button", function() {
    city = $(this).attr("cityData");
    localStorage.setItem("currentCity", city);
    getWeather(city);
});

//search button function


$("#citySearch").on("click", function() {

    var cityName = $("#input").val();
    $("#input").attr("placeholder", " Enter Another City")
    $("#input").val("")
    localStorage.setItem("currentCity", cityName);
    getWeather(cityName)


});


// History search function

function loadCityBtns() {

    if (localStorage.getItem("searchList") === null) {
        searchArr = [];
    } else {

        searchArr.forEach(function(city) {
            let cityBtn = $("<button>").text(city);
            cityBtn.addClass("btn btn-outline-info btn-block");
            cityBtn.attr("cityData", city);

            $(".searches").append(cityBtn);


        });
    }
}



//gets weather data function

function getWeather(city) {

    var currentCity = (localStorage.getItem("currentCity"));
    if (currentCity != null) {
        city = (localStorage.getItem("currentCity"))

    } else if (city === "" || city === undefined) {
        city = "atlanta";
    } else {

        city = city.toLowerCase();
    }
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + key + "&units=imperial"

    $.ajax({
        url: queryURL,
        method: "GET",
        statusCode: {

            200: function(response) {
                $("#location").text(response.name);
                $("#day").text(moment().format("(MM/DD/YYYY)"));
                $("#icon").attr("src", "https://openweathermap.org/img/wn/" + (response.weather[0].icon) + "@2x.png");
                $("#temp").text("Tempurature: " + Math.floor(response.main.temp) + "°F with " + response.weather[0].description);
                $("#humidity").text("Relative Humidity: " + (response.main.humidity) + "%");
                $("#wind").text("Wind Speed: " + (response.wind.speed) + "mph");

                var lat = response.coord.lat;
                var lon = response.coord.lon;
                getUV(lat, lon);
                getForcast(city);

                if (!searchArr.includes(city.toLowerCase())) {
                    searchArr.push(city);
                    saveCityBtns(city);
                    var cityBtn = $("<button>").text(city);
                    cityBtn.addClass("btn btn-outline-info btn-block");
                    cityBtn.attr("cityData", city);

                    $(".searches").append(cityBtn);

                }
            }
        }
    });


    // UV API call 

    function getUV(lat, lon) {

        var latitude = lat;
        var longitude = lon;
        var uvQuery = "https://api.openweathermap.org/data/2.5/uvi?appid=" + key + "&lat=" + latitude + "&lon=" + longitude

        $.ajax({
            url: uvQuery,
            method: "GET"
        }).then(function(response) {
            $("#uvIndex").text(response.value);
            var uv = response.value;
            if (uv < 3) {
                $("#uvIndex").removeClass()
                $("#uvIndex").addClass("badge badge-success")
            } else if (uv < 7) {
                $("#uvIndex").removeClass()
                $("#uvIndex").addClass("badge badge-warning")
            } else if (uv < 11) {
                $("#uvIndex").removeClass()
                $("#uvIndex").addClass("badge badge-danger")
            }
        });
    }


    // saves recently searched cities that you can get back to.

    function makeCityBtn(city) {

        var cityBtn = $("<button>").text(city);
        cityBtn.addClass("btn btn-outline-info btn-block");
        cityBtn.attr("cityData", city);

        $(".searches").append(cityBtn);
    }
}


//saves to local storage

function saveCityBtns(city) {

    localStorage.setItem("searchList", JSON.stringify(searchArr));
}

// API call to get weather info fuction.

function getForcast(city) {

    var queryURL = "https://api.openweathermap.org/data/2.5/forecast/?q=" + city + ",us&units=imperial&APPID=" + key;





    // Forecast call.
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {

        var forecastDayArr = [];

        for (var i = 1; i < 40; i++) {
            var forcastDay = moment(response.list[i].dt_txt).format("YYYY-MM-DD");
            if (!forecastDayArr.includes(forcastDay)) {
                forecastDayArr.push(forcastDay);
            }
        }

        var today = moment().format("YYYY-MM-DD");
        if (forecastDayArr.includes(today)) {
            var index = forecastDayArr.indexOf(today);
            forecastDayArr.splice(index, 1);
        }

    });
}