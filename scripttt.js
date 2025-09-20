const cityInput = document.querySelector('.city-input');
const searchButton = document.querySelector('.search-button');
const notFoundSection = document.querySelectorAll('.search-city')[1]; // second one is "not found"
const searchCitySection = document.querySelectorAll('.search-city')[0]; // first one is default
const weatherInfoSection = document.querySelector('.weather-info');//important section
const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt-regular');
const humidityValueTxt = document.querySelectorAll('.humidity-value-txt')[0];
const windValueTxt = document.querySelectorAll('.humidity-value-txt')[1]; // wind is using same class
const weatherSummaryImg = document.querySelector('.weather-summary-container img');
const currentDateTxt = document.querySelector('.current-data-txt');
const forecastContainer = document.querySelector('.forecast-items-container');
const themeToggle = document.getElementById('theme-toggle');

const apiKey = 'ebf424370eb6c1e9629e1328f832622d';



searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city !== '') {
        updateWeatherInfo(city);
        cityInput.value = '';
        cityInput.blur();
    }
});



cityInput.addEventListener('keydown', (event) => {
    const city = cityInput.value.trim();
    if (event.key === 'Enter' && city !== '') {
        updateWeatherInfo(city);
        cityInput.value = '';
        cityInput.blur();
    }
});



function getWeatherIcon(id) {
    if (id >= 200 && id < 300) return 'thunderstorm.svg';
    if (id >= 300 && id < 400) return 'drizzle.svg';
    if (id >= 500 && id < 600) return 'rain.svg';
    if (id >= 600 && id < 700) return 'snow.svg';
    if (id >= 700 && id < 800) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';
    if (id > 800 && id < 900) return 'clouds.svg';
    return 'unknown.svg';
}


async function updateWeatherInfo(cityInput) {
    const city = cityInput.toLowerCase();

    try {
        const weatherData = await getFetchData('weather', city);

        if (weatherData.cod !== 200) {
            showDisplaySection(notFoundSection);
            return;
        }

        const {
            main: { temp, humidity },
            weather: [{ id: conditionId, main }],
            wind: { speed: windSpeed },
            name:  country ,
            dt: dateTime,
            
        } = weatherData;

        countryTxt.textContent = country;
        cityInput.textContent = city.charAt(0).toUpperCase() + city.slice(1);
        tempTxt.textContent = `${Math.round(temp)}°C`;
        conditionTxt.textContent = main;// Set the main weather condition
        humidityValueTxt.textContent = `${humidity}%`;
        windValueTxt.textContent = `${Math.round(windSpeed)} m/s`;
        
        // Format the date and time
        currentDateTxt.textContent = new Date(dateTime * 1000).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        });
        weatherSummaryImg.src = `assets/weather/${getWeatherIcon(conditionId)}`;

        await updateForecastsInfo(city);
        showDisplaySection(weatherInfoSection);
    } catch (error) {
        console.error('Error updating weather info:', error);
        showDisplaySection(notFoundSection);
    }
}

async function updateForecastsInfo(cityInput) {
    const city = cityInput.toLowerCase();

    try {
        // Fetch the forecast data for the city
        const forecastData = await getFetchData('forecast', city);
        forecastContainer.innerHTML = '';// Clear the forecast container before adding new items

        const dailyForecastMap = {};// Create a map to store daily forecasts, using the date as the key

        forecastData.list.forEach((item) => { // Iterate through the forecast data
            const date = item.dt_txt.split(' ')[0];
            const time = item.dt_txt.split(' ')[1];

            // Store only one forecast per day, preferably 12:00:00
            if (!dailyForecastMap[date] || time === '12:00:00') {
                dailyForecastMap[date] = item;
            }
        });
// Create a map to store daily forecasts, using the date as the key
        
        // Convert the map to an array and limit it to 5 days of forecast
        const dailyForecasts = Object.values(dailyForecastMap).slice(0, 5);
// Limit to 5 days of forecast
        dailyForecasts.forEach((forecast) => {
            const forecastDate = new Date(forecast.dt * 1000);// Convert Unix timestamp to JavaScript Date object
            const forecastDay = forecastDate.toLocaleDateString('en-US', { weekday: 'short' });// Get the day of the week in short format
            const forecastIcon = getWeatherIcon(forecast.weather[0].id);// Get the weather icon based on the condition ID
            const forecastTemp = Math.round(forecast.main.temp);// Round the temperature to the nearest integer

            const forecastItem = document.createElement('div');// Create a new div for each forecast item
            forecastItem.classList.add('forecast-item');// Add the 'forecast-item' class for styling
            // Set the inner HTML of the forecast item
            forecastItem.innerHTML = `
                <h5 class="forcast-item-date regular-txt">${forecastDay}    
                    <img src="assets/weather/${forecastIcon}" class="forcast-item-img" alt="">
                </h5>
                <h5 class="forecast-item-temp">${forecastTemp}°C</h5>
            `;
            forecastContainer.appendChild(forecastItem);
        });
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}

async function getFetchData(endpoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);
    if (!response.ok) {// Check if the response is OK
        throw new Error(`API error: ${response.status}`);       // Handle errors checking the response status
    }
    return response.json();// Parse the JSON response
}

function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection].forEach((sec) => {
        sec.style.display = 'none';
    });
    section.style.display = 'flex';
}

// Theme toggle logic
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '🌞';
    }
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? '🌞' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
