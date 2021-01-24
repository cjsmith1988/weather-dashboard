var citiesSearched = [];
var UVIndex = 0;

var userFormEl = document.querySelector("#user-form");
var cityInputEl = document.querySelector("#city");
var searchContainerEl = document.querySelector("#cities-container");
var todayContainerEl = document.querySelector("#today-container");
var weatherAPIKey = "39a3f471939cbc77529580ec155df895"

var formSubmitHandler = function(event) {
    event.preventDefault();
    
    var city = cityInputEl.value.trim();
    todayContainerEl.innerHTML = '';
    createCityHistory(city);
    citiesSearched.unshift(city);
    var x = document.getElementById("cities-container").childElementCount;
    for (var i = 1; i < x; i++) {
        if (city.toLowerCase() === String(citiesSearched[i]).toLowerCase()) {
            citiesSearched.splice(i,1);
            searchContainerEl.removeChild(searchContainerEl.childNodes[i]);
            i--;
        };
    };
    if (x > 10) {
        searchContainerEl.removeChild(searchContainerEl.childNodes[10]);
    };
    getTodayWeather(city);
    saveCities();
};
var previousCityHandler = function(event) {
    todayContainerEl.innerHTML = '';
    var city = event.target.getAttribute("data");
    createCityHistory(city);
    citiesSearched.unshift(city);
    var x = document.getElementById("cities-container").childElementCount;
    for (var i = 1; i < x; i++) {
        if (city.toLowerCase() === String(citiesSearched[i]).toLowerCase()) {
            citiesSearched.splice(i,1);
            searchContainerEl.removeChild(searchContainerEl.childNodes[i]);
            i--;
        };
    };
    getTodayWeather(city);
    saveCities();
};

var createCityHistory = function(city) {
    var cityEl = document.createElement("a");
    cityEl.classList = "list-item flex-row justify-space-between align-center";
    cityEl.setAttribute("data", city);
    //cityEl.setAttribute("href", "./single-repo.html?repo=" + repoName);
    // create a span element to hold repository name
    var cityNameEl = document.createElement("span");
    cityNameEl.textContent = city;
    // append to container
    cityEl.appendChild(cityNameEl);
    // append container to the dom
    searchContainerEl.insertBefore(cityEl, searchContainerEl.firstChild);
    //searchContainerEl.appendChild(cityEl);
};

var saveCities = function() {
    if (citiesSearched.length > 10) {
        citiesSearched.length = 10;
    };
    localStorage.setItem("citiesSearched", JSON.stringify(citiesSearched));
 }

 var loadSearch = function () {   
    var savedCities = localStorage.getItem("citiesSearched");
    // if there are no tasks, set tasks to an empty array and return out of the function
    if (!savedCities) {
        return false;
    }
    // else, load up saved cities
    // parse into array of objects
    savedCities = JSON.parse(savedCities);
    citiesSearched = savedCities;
    // loop through savedTasks array
    for (var i = 0; i < 10; i++) {
        // pass each task object into the `createTaskEl()` function
        if(citiesSearched[9-i]){
            createCityHistory(citiesSearched[9-i]);
        };       
    };
};
var getTodayWeather = function(city) {
    var city = city;
    
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q="+city+"&appid=" + weatherAPIKey;

    // make a request to the url
    fetch(apiUrl)
    .then(function(response) {
        // request was successful
        if (response.ok) {
        response.json().then(function(data) {
            console.log(data);
            var date = data.coord.dt;
            date = new Intl.DateTimeFormat('en-US').format(date);
            var lat = data.coord.lat;
            var lon = data.coord.lon;
            var tempCelc = (data.main.temp - 273.15).toFixed(2);
            var humidity = (data.main.humidity).toFixed(0);
            var wind = (data.wind.speed).toFixed(1);
            var icon = data.weather[0].icon;
            UVIndex = getUVIndex(lat, lon, city, date, tempCelc, humidity, wind, icon);
        });
        } else {
        alert("Error: " + response.statusText);
        }
    })
    .catch(function(error) {
        // Notice this `.catch()` getting chained onto the end of the `.then()` method
        alert("Unable to get data");
    });
};
var getUVIndex = function(lat, lon, city, date, tempCelc, humidity, wind, icon) {
    var lat = lat;
    var lon = lon;
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&appid="+weatherAPIKey;

    // make a request to the url
    fetch(apiUrl)
    .then(function(response) {
        // request was successful
        if (response.ok) {
            response.json().then(function(data) {
                console.log(data);
                var UVIndex = (data.current.uvi).toFixed(2);
                
                for (var i = 1; i < 6; i++) {
                    var card = i
                    var fiveDayDate = new Date((data.daily[i].dt) * 1000);
                    fiveDayDate = new Intl.DateTimeFormat('en-US').format(fiveDayDate);
                    var fiveDayTempCelc = (data.daily[i].temp.day - 273.15).toFixed(2);
                    var fiveDayHumidity = (data.daily[i].humidity).toFixed(0);
                    var fiveDayIcon = data.daily[i].weather[0].icon;
                    create5day(card, fiveDayDate, fiveDayTempCelc, fiveDayHumidity, fiveDayIcon);
                };
                createTodayWeather(city, date, tempCelc, humidity, wind, icon, UVIndex);
            });
        } else {
        alert("Error: " + response.statusText);
        }
    })
    .catch(function(error) {
        alert("Unable to get data");
    });
    
};

var create5day = function(card, fiveDayDate, fiveDayTempCelc, fiveDayHumidity, fiveDayIcon) {
    //call DOM elements dynamically
    var cardID = "#card-"+card;
    var cardBodyID = "#card-"+card+"-info";
    var cardEl = document.querySelector(cardID);
    var cardBodyEl = document.querySelector(cardBodyID);
    //clear the old contente
    cardEl.removeChild(cardEl.childNodes[0]);
    cardBodyEl.innerHTML = '';
    //add elements to cards
    var cardHeadEl = document.createElement("div");
    cardHeadEl.classList = "card-header";
    cardHeadEl.textContent = "("+fiveDayDate+")";
    cardEl.insertBefore(cardHeadEl, cardEl.firstChild);
    cardIconEl = document.createElement("img");
    cardIconEl.classList = "d-inline";
    cardIconEl.setAttribute("src", "http://openweathermap.org/img/wn/"+fiveDayIcon+"@2x.png");
    cardIconEl.setAttribute("id", "icon");
    cardTempEl = document.createElement("p");
    cardTempEl.classList = "card-text";
    cardTempEl.textContent = fiveDayTempCelc+" \u2103";
    cardHumidityEl = document.createElement("p");
    cardHumidityEl.classList = "card-text";
    cardHumidityEl.textContent = "Hum: "+fiveDayHumidity;
    cardBodyEl.appendChild(cardIconEl);
    cardBodyEl.appendChild(cardTempEl);
    cardBodyEl.appendChild(cardHumidityEl);
};

var createTodayWeather = function(city, date, tempCelc, humidity, wind, icon, UVIndex) {
    var cityEl = document.createElement("h3");
    cityEl.classList = "d-inline";
    cityEl.textContent = city;
    var dateEl = document.createElement("h3");
    dateEl.classList = "d-inline";
    dateEl.textContent = " ("+date+")";
    var iconEl = document.createElement("img");
    iconEl.classList = "d-inline";
    iconEl.setAttribute("src", "http://openweathermap.org/img/wn/"+icon+"@2x.png");
    var temperatureEl = document.createElement("span");
    temperatureEl.classList = "d-block list-item no-back";
    temperatureEl.textContent = "Temperature: "+tempCelc+" \u2103";
    var humidityEl = document.createElement("span");
    humidityEl.classList = "d-block list-item no-back";
    humidityEl.textContent = "Humidity: "+humidity;
    var windEl = document.createElement("span");
    windEl.classList = "d-block list-item no-back";
    windEl.textContent = "Wind Speed: "+wind+" MPH";


    var uviLabelEl = document.createElement("span");
    uviLabelEl.classList = "d-inline list-item no-back";
    uviLabelEl.textContent = "UV Index: ";
    var uviEl = document.createElement("span");
    uviEl.classList = "d-inline list-item no-back";
    //create warning background for UVI
    var UVWarning = "moderate";
    if (UVIndex <= 2) {
        UVWarning = "favorable";
    } else if (UVIndex >= 8) {
        UVWarning = "severe";
    }; 
    uviEl.setAttribute("id", UVWarning);
    uviEl.textContent = UVIndex;



    todayContainerEl.appendChild(cityEl);
    todayContainerEl.appendChild(dateEl);
    todayContainerEl.appendChild(iconEl);
    todayContainerEl.appendChild(temperatureEl);
    todayContainerEl.appendChild(humidityEl);
    todayContainerEl.appendChild(windEl);
    todayContainerEl.appendChild(uviLabelEl);
    todayContainerEl.appendChild(uviEl);
};


loadSearch();
userFormEl.addEventListener("submit", formSubmitHandler);
searchContainerEl.addEventListener("click", previousCityHandler);