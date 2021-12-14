var APIKey = "bbf72040ef465202d5d3facd4828a64e";
var cityInput = $("#city");
var form = $("form");
var citySelector = $("#city-selection");
var weatherContainer = $("#weather-display");
var cities = JSON.parse(localStorage.getItem("cities"));

function renderWeatherContent(city, data){
    var fiveDay = renderFiveDayForecast(data);
    var uv = data.current.uvi;
    var favorability = uv > 2 ? "uk-text-warning" : "uk-text-success";
    favorability = uv > 6 ? "uk-text-danger" : favorability;
    return `
<li>
    <div class="uk-card uk-card-body uk-card-default">
        <h3 class="uk-card-title">${city} Weather (${moment.unix(data.current.dt).format("M/D/YYYY")})</h3>
        <ul class="uk-list">
            <li>Temp: ${data.current.temp}&deg;F</li>
            <li>Wind: ${data.current.wind_speed} MPH</li>
            <li>Humidity: ${data.current.humidity}%</li>
            <li>UV Index: <span class="${favorability}">${uv}</span></li>
        </ul>
    </div>
    <div class="uk-card uk-card-body">
        <h2 class="uk-card-title">Five Day Forecast</h2>
        <div uk-grid class="uk-grid-small uk-child-width-expand\@s uk-flex uk-flex-center">
            ${fiveDay}
        </div>
    </div>
</li>`;
}

function renderFiveDayForecast(data){
    var forecast = "";
    for(i = 0; i < 5; i++){
        forecast += `
<div class="uk-width-auto">
    <div class="uk-card uk-card-body uk-card-default">
        <h3 class="uk-card-title">${moment.unix(data.daily[i].dt).format("M/D/YYYY")}</h3>
        <ul class="uk-list">
            <li><img src="https://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}@2x.png" alt="${data.daily[i].weather.description}"></li>
            <li>Temp: ${data.daily[i].temp.day}&deg;F</li>
            <li>Wind: ${data.daily[i].wind_speed} MPH</li>
            <li>Humidity: ${data.daily[i].humidity}%</li>
        </ul>
    </div>
</div>`
    }
    return forecast;
}

function renderCitySelector(city){
    return `<li><a href="#" id="${city}">${city}</a></li>`;
}

function search(e, city){
    if(!city){
        city = cityInput.val();
    }
    if(!city){
        return;
    }
    var url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${APIKey}`;
    fetch(url, {mode: "cors"})
        .then(function(response){
            if(response.ok){
                return response.json();
            }else{
                throw new Error(response.status);
            }
        })
        .then(function(data){
            if(data.length === 0){
                throw new Error("Invalid location.");
            }
            getWeather(data[0].lat, data[0].lon, city);
        })
        .catch(function(error){
            alert(error);
        });
}

function getWeather(lat, lon, city){
    var url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=imperial&appid=${APIKey}`;

    fetch(url, {mode: "cors"})
        .then(function(response){
            if(response.ok){
                return response.json();
            }else{
                throw new Error(response.status);
            }
        })
        .then(function(data){
            if(!cities.includes(city)){
                cities.push(city);
                localStorage.setItem("cities", JSON.stringify(cities));
            }
            if(!$(`#${city}`).text()){
                citySelector.append(renderCitySelector(city));
                weatherContainer.append(renderWeatherContent(city, data));
            }
        })
        .catch(function(error){
            alert(error);
        })
}
if(cities !== null){
    for(city of cities){
        search({}, city);
    }
}else{
    cities = [];
}

form.submit(search);