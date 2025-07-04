const apiKey = 'f24d1c2c5c4a31e0a2cbf5e1a7262d6a';

document.getElementById('locate').onclick = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            document.getElementById('lat').value = position.coords.latitude;
            document.getElementById('lon').value = position.coords.longitude;
        }, function() {
            alert('Unable to retrieve your location.');
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
};

document.getElementById('btn').onclick = async function() {
    const option = document.getElementById('option').value;
    let lat = document.getElementById('lat').value.trim();
    let lon = document.getElementById('lon').value.trim();
    const city = document.getElementById('city').value.trim();
    let resultDiv = document.getElementById('result');

    // If city is provided, get lat/lon from Geocoding API
    if (city) {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;
        resultDiv.style.display = "flex";
        resultDiv.textContent = 'Finding location...';
        try {
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();
            if (geoData.length > 0) {
                lat = geoData[0].lat;
                lon = geoData[0].lon;
                document.getElementById('lat').value = lat;
                document.getElementById('lon').value = lon;
            } else {
                resultDiv.textContent = 'City not found. Please check the city name.';
                return;
            }
        } catch (e) {
            resultDiv.textContent = 'Error finding city location.';
            return;
        }
    }

    // Validate latitude and longitude
    if (
        !lat || !lon || !option ||
        isNaN(lat) || isNaN(lon) ||
        Number(lat) < -90 || Number(lat) > 90 ||
        Number(lon) < -180 || Number(lon) > 180
    ) {
        resultDiv.style.display = "flex";
        resultDiv.textContent = 'Please select an option and provide valid latitude (-90 to 90) and longitude (-180 to 180).';
        resultDiv.style.marginTop = '30px';
        resultDiv.style.textAlign = 'center';
        resultDiv.style.fontSize = '1.3rem';
        resultDiv.style.color = '#333';
        return;
    }

    let url = '';
    if (option === 'current') {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else if (option === 'forecast') {
        url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else if (option === 'airquality') {
        url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    } else if (option === 'alerts') {
        url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    }

    resultDiv.style.display = "flex";
    resultDiv.textContent = 'Loading...';
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (option === 'current') {
            resultDiv.innerHTML = `<b>Location:</b> ${data.name ? data.name : 'Unknown'}, ${data.sys && data.sys.country ? data.sys.country : ''}<br>
                                   <b>Temperature:</b> ${data.main.temp}°C<br>
                                   <b>Weather:</b> ${data.weather[0].description}<br>
                                   <b>Humidity:</b> ${data.main.humidity}%<br>
                                   <b>Wind Speed:</b> ${data.wind.speed} m/s`;
        } else if (option === 'forecast') {
            resultDiv.innerHTML = `<b>Location:</b> ${data.city && data.city.name ? data.city.name : 'Unknown'}, ${data.city && data.city.country ? data.city.country : ''}<br>
                                   <b>Forecast (next 3 hours):</b> ${data.list[0].main.temp}°C, ${data.list[0].weather[0].description}<br>
                                   <b>Humidity:</b> ${data.list[0].main.humidity}%<br>
                                   <b>Wind Speed:</b> ${data.list[0].wind.speed} m/s`;
        } else if (option === 'airquality') {
            if (data && data.list && data.list.length > 0) {
                const aqi = data.list[0].main.aqi;
                const components = data.list[0].components;
                let aqiText = '';
                switch(aqi) {
                    case 1: aqiText = 'Good'; break;
                    case 2: aqiText = 'Fair'; break;
                    case 3: aqiText = 'Moderate'; break;
                    case 4: aqiText = 'Poor'; break;
                    case 5: aqiText = 'Very Poor'; break;
                    default: aqiText = 'Unknown';
                }
                resultDiv.innerHTML = `
                    <b>Air Quality Index:</b> ${aqi} (${aqiText})<br>
                    <b>CO:</b> ${components.co} μg/m³<br>
                    <b>NO:</b> ${components.no} μg/m³<br>
                    <b>NO₂:</b> ${components.no2} μg/m³<br>
                    <b>O₃:</b> ${components.o3} μg/m³<br>
                    <b>SO₂:</b> ${components.so2} μg/m³<br>
                    <b>PM2.5:</b> ${components.pm2_5} μg/m³<br>
                    <b>PM10:</b> ${components.pm10} μg/m³<br>
                    <b>NH₃:</b> ${components.nh3} μg/m³
                `;
            } else {
                resultDiv.innerHTML = 'No air quality data available for this location.';
            }
        } else if (option === 'alerts') {
            if (data.alerts && data.alerts.length > 0) {
                resultDiv.innerHTML = `<b>Alert:</b> ${data.alerts[0].event}<br>${data.alerts[0].description}`;
            } else {
                resultDiv.innerHTML = 'No weather alerts for this location.';
            }
        }
    } catch (e) {
        resultDiv.style.display = "flex";
        resultDiv.textContent = 'Could not fetch data. Please check your API key and network.';
    }
};