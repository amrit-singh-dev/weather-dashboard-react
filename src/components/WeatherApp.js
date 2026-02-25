import { useState, useEffect, useCallback } from "react";

import clear from "../assets/clear.jpg";
import cloudy from "../assets/cloudy.jpg";
import rainy from "../assets/rainy.jpg";
import thunder from "../assets/thunder.jpg";
import snowy from "../assets/snowy.jpg";
import foggy from "../assets/foggy.jpg";

function WeatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [bgImage, setBgImage] = useState(clear);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState("C"); 

  const apiKey = process.env.REACT_APP_WEATHER_KEY;

  const setBackground = (condition) => {
    const type = condition.toLowerCase();

    if (type.includes("cloud")) setBgImage(cloudy);
    else if (type.includes("rain")) setBgImage(rainy);
    else if (type.includes("thunder")) setBgImage(thunder);
    else if (type.includes("snow")) setBgImage(snowy);
    else if (type.includes("mist") || type.includes("fog"))
      setBgImage(foggy);
    else setBgImage(clear);
  };

  const getWeather = useCallback(
    async (searchCity) => {
      if (!searchCity) return;

      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${searchCity}&days=3&aqi=no&alerts=no`
        );

        const data = await res.json();

        if (data.error) {
          setError(data.error.message);
          setWeather(null);
          setForecast([]);
          setLoading(false);
          return;
        }

        setWeather(data);
        setForecast(data.forecast.forecastday);
        setBackground(data.current.condition.text);

        localStorage.setItem("lastCity", searchCity);
      } catch (err) {
        setError("Network error. Please try again.");
      }

      setLoading(false);
    },
    [apiKey]
  );

  useEffect(() => {
    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) {
      setCity(lastCity);
      getWeather(lastCity);
    }
  }, [getWeather]);

  const convertTemp = (tempC) => {
    if (unit === "C") return `${tempC}°C`;
    return `${((tempC * 9) / 5 + 32).toFixed(1)}°F`;
  };

  return (
    <div
      className="container"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="glass-card">

        <h1 className="title">Weather Dashboard</h1>

        <div className="search-box">
          <input
            type="text"
            placeholder="Enter city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && getWeather(city.trim())
            }
          />
          <button onClick={() => getWeather(city.trim())}>
            Search
          </button>
        </div>

        <div className="unit-toggle">
          <button
            className={unit === "C" ? "active" : ""}
            onClick={() => setUnit("C")}
          >
            °C
          </button>
          <button
            className={unit === "F" ? "active" : ""}
            onClick={() => setUnit("F")}
          >
            °F
          </button>
        </div>

        {loading && <div className="spinner"></div>}

        {error && <p className="error">{error}</p>}

        {weather && !loading && (
          <div className="current-weather">
            <h2>
              {weather.location.name}, {weather.location.country}
            </h2>
            <img
              src={`https:${weather.current.condition.icon}`}
              alt="icon"
            />
            <p className="temp">
              {convertTemp(weather.current.temp_c)}
            </p>
            <p>{weather.current.condition.text}</p>
            <p>Humidity: {weather.current.humidity}%</p>
          </div>
        )}

        {forecast.length > 0 && !loading && (
          <div className="forecast">
            {forecast.map((day) => (
              <div key={day.date} className="forecast-day">
                <h4>{day.date}</h4>
                <img
                  src={`https:${day.day.condition.icon}`}
                  alt="forecast"
                />
                <p>{convertTemp(day.day.avgtemp_c)}</p>
                <p>{day.day.condition.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WeatherApp;