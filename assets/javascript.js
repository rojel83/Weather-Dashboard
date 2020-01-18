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


$("#citySearch").on("click", function() {
    //search button click event 


    var cityName = $("#input").val();
    $("#input").attr("placeholder", " Enter Another City")
    $("#input").val("")
    localStorage.setItem("currentCity", cityName);
    getWeather(cityName)


});


// function that loads previously searched city

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



//function that gets weather data and displays in DOM.

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









    function makeCityBtn(city) {
        // creates the city buttons after a search
        var cityBtn = $("<button>").text(city);
        cityBtn.addClass("btn btn-outline-info btn-block");
        cityBtn.attr("cityData", city);

        $(".searches").append(cityBtn);
    }
}




function saveCityBtns(city) {
    // saves searched city to local storage
    localStorage.setItem("searchList", JSON.stringify(searchArr));
}


function getForcast(city) {
    //ajax call to API to get weather info and print into DOM
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast/?q=" + city + ",us&units=imperial&APPID=" + key;





    //Ajax call to get forecast
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