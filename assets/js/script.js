var icons = {
  'Thunderstorm' : 'fa-cloud-bolt',
  'Drizzle' : 'fa-cloud-rain',
  'Rain' : 'fa-cloud-showers-heavy',
  'Snow' : 'fa-snowflake',
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
  let city_name = encodeURI($('#search_field').val().trim());
  let city_query = 'https://api.openweathermap.org/geo/1.0/direct?q='+city_name+'&limit=1&appid=9f18efe2cbef009702bff1a605ad69c2';
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
        for (var i=1;i<6;i++) {
          let card_i = $('#day_'+i);
          let date_i = moment().add(1*i,'d');
          let date_i_text = date_i.format('MM/DD/YY');
          card_i.find('.forecast_date').text(date_i_text);
          card_i.find('.forecast_icon_container').empty();
          card_i.find('.forecast_icon_container').append('<i class="fa-solid fa-3x '+icons[get_predominate_conditions(forecast_data.list, date_i)]+' forecast_icon"></i>');
          let temp_i = (9/5*(parseFloat(get_max_temp(forecast_data.list,date_i))-273.15)+32).toFixed(0)+' °F';
          card_i.find('.forecast_temp').text(temp_i);
          let ws_i = (parseFloat(get_avg_ws(forecast_data.list,date_i))/1.94384).toFixed(2)+' kts';
          card_i.find('.forecast_ws').text(ws_i);
          let hum_i = get_avg_hum(forecast_data.list,date_i).toFixed(0)+'%';
          card_i.find('.forecast_hum').text(hum_i);
          

        }
        $('#forecast').show();
        
      });
    } else {
      $('#initial_prompt').hide();
      $('#current').hide();
      $('#forecast').hide();
      $('#invalid_search_prompt').show();
    }

  });
});

function get_predominate_conditions (data, date) {
  let filtered_data = data.filter(e => moment(e.dt_txt).day() == date.day());
  let counts = {
    'Thunderstorm' : 0,
    'Drizzle' : 0,
    'Rain' : 0,
    'Snow' : 0,
    'Mist' : 0,
    'Smoke' : 0,
    'Haze' : 0,
    'Dust' : 0,
    'Fog' : 0,
    'Sand' : 0,
    'Ash' : 0,
    'Squalls' : 0,
    'Tornado' : 0,
    'Clear' : 0,
    'Clouds' : 0
  };
  let max_count = 0;
  let max_key = 0;
  for (var i=0;i<filtered_data.length;i++) {
    let weather = filtered_data[i].weather[0].main;
    counts[weather] = counts[weather] + 1;
    if (counts[weather] > max_count) {
      max_count = counts[weather];
      max_key = weather;
    }
  }
  return max_key;
}

function get_max_temp (data, date) {
  let filtered_data = data.filter(e => moment(e.dt_txt).day() == date.day());
  let max_temp = 0;
  for (var i=0;i<filtered_data.length;i++) {
    let high_temp = filtered_data[i].main.temp_max;
    if (high_temp > max_temp) max_temp = high_temp;
  }
  return max_temp;
}

function get_avg_ws (data, date) {
  let filtered_data = data.filter(e => moment(e.dt_txt).day() == date.day());
  let avg_ws = 0;
  for (var i=0;i<filtered_data.length;i++) {
    avg_ws = avg_ws + filtered_data[i].wind.speed;
  }
  avg_ws = avg_ws / filtered_data.length;
  return avg_ws;
}

function get_avg_hum (data, date) {
  let filtered_data = data.filter(e => moment(e.dt_txt).day() == date.day());
  let avg_hum = 0;
  for (var i=0;i<filtered_data.length;i++) {
    avg_hum = avg_hum + filtered_data[i].main.humidity;
  }
  avg_hum = avg_hum / filtered_data.length;
  return avg_hum;
}

