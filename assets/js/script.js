var icons = {
  'Thunderstorm' : 'fa-cloud-bolt',
  'Drizzle' : 'fa-cloud-rain',
  'Rain' : 'fa-cloud-showers-heavy',
  'Snow' : 'fa-cloud-snowflake',
  'Mist' : 'fa-smog',
  'Smoke' : 'fa-smog',
  'Haze' : 'fa-smog',
  'Dust' : 'fa-smog',
  'Fog' : 'fa-smog',
  'Sand' : 'fa-smog',
  'Ash' : 'fa-volcano',
  'Squalls' : 'fa-wind',
  'Tornado' : 'fa-tornado',
  'Clear' : 'fa-sun',
  'Clouds' : 'fa-cloud'
}

$('#search_form').submit( function(e) {
  e.preventDefault();
  console.log("submitted!");
  let city_name = encodeURI($('#search_field').val().trim());
  let city_query = 'http://api.openweathermap.org/geo/1.0/direct?q='+city_name+'&limit=1&appid=9f18efe2cbef009702bff1a605ad69c2';
  fetch(city_query)
  .then(function(response) {return response.json()})
  .then(function(city_data) {
    console.log(city_data);
    if (city_data.length > 0) {
      let current_query = 'https://api.openweathermap.org/data/2.5/weather?lat='+city_data[0].lat+'&lon='+city_data[0].lon+'&appid=9f18efe2cbef009702bff1a605ad69c2';
      fetch(current_query)
      .then(function(response) {return response.json()})
      .then(function(current_weather) {
        console.log(current_weather);
        $('#initial_prompt').hide();
        $('#invalid_search_prompt').hide();
        $('#city_name').text(current_weather.name);
        let current_date = moment().format('dddd, MMMM Do, YYYY');
        $('#current_date').text(current_date);
        $('#current_description').text(current_weather.weather[0].description)
        $('.icon_element').remove();
        $('#current_icon').append('<i class="fa-solid fa-3x '+icons[current_weather.weather[0].main]+' icon_element"></i>');
        let current_temp = (9/5*(parseFloat(current_weather.main.temp)-273.15)+32).toFixed(0)+' °F';
        $('#current_temp').text(current_temp);
        let current_ws = (parseFloat(current_weather.wind.speed)/1.94384).toFixed(2)+' kts';
        $('#current_ws').text(current_ws);
        let current_hum = current_weather.main.humidity+'%';
        $('#current_hum').text(current_hum);
        $('#current').show();

      });
      
      let forecast_query = 'https://api.openweathermap.org/data/2.5/forecast?lat='+city_data[0].lat+'&lon='+city_data[0].lon+'&appid=9f18efe2cbef009702bff1a605ad69c2';
      fetch(forecast_query)
      .then(function(response) {return response.json()})
      .then(function(forecast_data) {
        console.log(forecast_data);
        // let current_date = moment(forecast_data.dt_txt).format('dddd, MMMM Do, YYYY');
      });
    } else {
      $('#initial_prompt').hide();
      $('#current').hide();
      $('#forecast').hide();
      $('#invalid_search_prompt').show();
    }

  });
});