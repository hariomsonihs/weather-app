const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const API_KEY = "1b3541d716d994afacf2ce55b428c254"; // API key for OpenWeatherMap API

// Function to show loading spinner
const showLoading = () => {
    currentWeatherDiv.innerHTML = `<div class="loading-spinner"></div>`;
    weatherCardsDiv.innerHTML = "";
};

// Function to hide loading spinner
const hideLoading = () => {
    const spinner = document.querySelector(".loading-spinner");
    if (spinner) spinner.remove();
};

// Function to get weather-specific icon, animation, and background
const getWeatherDetailsWithEffects = (weatherCondition, iconCode) => {
    const isDay = iconCode.includes("d"); // Check if it's day or night

    const weatherEffects = {
        Clear: {
            icon: isDay ? "☀️" : "🌙",
            animation: isDay ? "sunny" : "night",
            background: isDay ? "linear-gradient(135deg, #ff9a9e, #fad0c4)" : "linear-gradient(135deg, #0f0c29, #302b63)",
        },
        Clouds: {
            icon: isDay ? "☁️" : "☁️",
            animation: isDay ? "cloudy" : "cloudy-night",
            background: isDay ? "linear-gradient(135deg, #bdc3c7, #2c3e50)" : "linear-gradient(135deg, #1e3c72, #2a5298)",
        },
        Rain: {
            icon: "🌧️",
            animation: "rainy",
            background: "linear-gradient(135deg, #4da0b0, #d39d38)",
        },
        Snow: {
            icon: "❄️",
            animation: "snowy",
            background: "linear-gradient(135deg, #e6e9f0, #eef1f5)",
        },
        Thunderstorm: {
            icon: "⛈️",
            animation: "stormy",
            background: "linear-gradient(135deg, #0f0c29, #302b63)",
        },
        Drizzle: {
            icon: "🌦️",
            animation: "drizzly",
            background: "linear-gradient(135deg, #89f7fe, #66a6ff)",
        },
        Mist: {
            icon: "🌫️",
            animation: "misty",
            background: "linear-gradient(135deg, #d3cce3, #e9e4f0)",
        },
        default: {
            icon: "🌈",
            animation: "default",
            background: "linear-gradient(135deg, #1e3c72, #2a5298)",
        },
    };

    return weatherEffects[weatherCondition] || weatherEffects.default;
};

// Function to create weather card
const createWeatherCard = (cityName, weatherItem, index) => {
    const weatherCondition = weatherItem.weather[0].main;
    const iconCode = weatherItem.weather[0].icon; // Get the icon code (e.g., "01d" or "01n")
    const { icon, animation, background } = getWeatherDetailsWithEffects(weatherCondition, iconCode);

    if (index === 0) {
        return `<div class="details" style="background: ${background};">
            <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
            <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
            <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
            <h6>Humidity: ${weatherItem.main.humidity}%</h6>
            <h6>Visibility: ${(weatherItem.visibility / 1000).toFixed(1)} km</h6>
            <h6>Pressure: ${weatherItem.main.pressure} hPa</h6>
        </div>
        <div class="icon">
            <span class="weather-icon ${animation}">${icon}</span>
            <h6>${weatherItem.weather[0].description}</h6>
        </div>`;
    } else {
        return `<li class="card" style="background: ${background};">
            <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
            <span class="weather-icon ${animation}">${icon}</span>
            <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
            <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
            <h6>Humidity: ${weatherItem.main.humidity}%</h6>
            <h6>Visibility: ${(weatherItem.visibility / 1000).toFixed(1)} km</h6>
            <h6>Pressure: ${weatherItem.main.pressure} hPa</h6>
        </li>`;
    }
};

// Function to fetch weather details
const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
    
    showLoading(); // Show loading spinner

    fetch(WEATHER_API_URL)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            console.log("API Response:", data); // Debugging
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });
            
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";
            
            fiveDaysForecast.forEach((weatherItem, index) => {
                const html = createWeatherCard(cityName, weatherItem, index);
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", html);
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", html);
                }
            });
        })
        .catch(error => {
            console.error("Error fetching weather data:", error); // Debugging
            alert("An error occurred while fetching the weather forecast!");
        })
        .finally(() => {
            hideLoading(); // Hide loading spinner
        });
};

// Function to fetch city coordinates
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return alert("Please enter a city name");
    
    showLoading(); // Show loading spinner

    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(error => {
            console.error("Error fetching coordinates:", error); // Debugging
            alert("An error occurred while fetching the coordinates!");
        })
        .finally(() => {
            hideLoading(); // Hide loading spinner
        });
};

// Function to fetch user coordinates
const getUserCoordinates = () => {
    showLoading(); // Show loading spinner

    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            
            fetch(API_URL)
                .then(response => {
                    if (!response.ok) throw new Error("Network response was not ok");
                    return response.json();
                })
                .then(data => {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(error => {
                    console.error("Error fetching city name:", error); // Debugging
                    alert("An error occurred while fetching the city name!");
                })
                .finally(() => {
                    hideLoading(); // Hide loading spinner
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
            hideLoading(); // Hide loading spinner
        }
    );
};

// Event listeners
searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);