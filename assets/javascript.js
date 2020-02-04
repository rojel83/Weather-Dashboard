$(document).ready(function() {
    loadCityBtns()
    getWeather()
});


let searchArr = JSON.parse(localStorage.getItem("searchList"));
let key = "a11a1e9269e13230951ba04ac2f8b89c";
let currentCity = "atlanta";


$(".searches").on("click", "button", function() {
    city = $(this).attr("cityData");
    localStorage.setItem("currentCity", city);
    getWeather(city);
});

//search button 

$("#citySearch").on("click", function() {

    let cityName = $("#input").val();
    $("#input").attr("placeholder", " Enter Another City")
    $("#input").val("")
    localStorage.setItem("currentCity", cityName);
    getWeather(cityName)


});


//searched history saved in local storage

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




//retrived weather data from api
function getWeather(city) {

    let currentCity = (localStorage.getItem("currentCity"));
    if (currentCity != null) {
        city = (localStorage.getItem("currentCity"))
        console.log(localStorage.getItem("currentCity"))
    } else if (city === "" || city === undefined) {
        city = "atlanta";
    } else {

        city = city.toLowerCase();
    }
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + key + "&units=imperial"
    console.log(queryURL)
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

                let lat = response.coord.lat;
                let lon = response.coord.lon;
                getUV(lat, lon);
                getForcast(city);

                if (!searchArr.includes(city.toLowerCase())) {
                    searchArr.push(city);
                    saveCityBtns(city);
                    let cityBtn = $("<button>").text(city);
                    cityBtn.addClass("btn btn-outline-info btn-block");
                    cityBtn.attr("cityData", city);

                    $(".searches").append(cityBtn);

                }
            }
        }
    });


    //uv api call

    function getUV(lat, lon) {

        let latitude = lat;
        let longitude = lon;
        let uvQuery = "https://api.openweathermap.org/data/2.5/uvi?appid=" + key + "&lat=" + latitude + "&lon=" + longitude

        $.ajax({
            url: uvQuery,
            method: "GET"
        }).then(function(response) {
            $("#uvIndex").text(response.value);
            let uv = response.value;
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




    //button search generator 
    function makeCityBtn(city) {

        let cityBtn = $("<button>").text(city);
        cityBtn.addClass("btn btn-outline-info btn-block");
        cityBtn.attr("cityData", city);

        $(".searches").append(cityBtn);
    }
}


//save search cities

function saveCityBtns(city) {

    localStorage.setItem("searchList", JSON.stringify(searchArr));
}

//ajax call to API to get weather info 

function getForcast(city) {

    let queryURL = "https://api.openweathermap.org/data/2.5/forecast/?q=" + city + ",us&units=imperial&APPID=" + key;

    console.log(queryURL)


    // call to get forcast and put data into an object 
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response)
        let forcastDayArr = [];

        for (let i = 1; i < 40; i++) {
            let forcastDay = moment(response.list[i].dt_txt).format("YYYY-MM-DD");
            if (!forcastDayArr.includes(forcastDay)) {
                forcastDayArr.push(forcastDay);
            }
        }

        let today = moment().format("YYYY-MM-DD");
        if (forcastDayArr.includes(today)) {
            let index = forcastDayArr.indexOf(today);
            forcastDayArr.splice(index, 1);
        }

        for (let j = 0; j < forcastDayArr.length; j++) {
            let maxTempArr = [];
            let temps = [];
            let max = 0;

            for (let k = 0; k < 40; k++) {
                let forcastDay = moment(response.list[k].dt_txt).format("YYYY-MM-DD");

                if (forcastDayArr[j] === forcastDay) {
                    let tempurature = response.list[k].main.temp;

                    if (tempurature > max) {
                        max = tempurature;

                        icon = response.list[k].weather[0].icon;
                        icon = icon.replace(/n/g, "d");

                        $(".card-day-" + j).text(moment(forcastDayArr[j]).format("dddd"));
                        $(".card-title-" + j).text(moment(forcastDayArr[j]).format("MM/DD/YYYY"));
                        $(".icon-" + j).attr("src", `https://openweathermap.org/img/wn/${icon}@2x.png`);
                        $(".tempHi-" + j).text(`Temp: ${Math.floor(max)}°F`);
                        $(".humidity-" + j).text(`Humidity: ${Math.floor(response.list[k].main.humidity)}%`);
                    }
                }
            }
        }
    });
}