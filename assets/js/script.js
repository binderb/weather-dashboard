// This variable maps the 'main' weather variables
// from API responses onto FontAwesome classes. I could have
// used the OpenWeatherMap stock icons but preferred the
// FontAwesome set aesthetically.
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

/*------------------------------
Page Load
------------------------------*/
// Load data from LocalStorage and add event listeners.
$( function () {
  load_recents();

  $('#clear_recents').click(function(e) {
    e.preventDefault();
    localStorage.removeItem('recent_cities');
    load_recents();
  });
});

/*------------------------------
Form Submission
------------------------------*/
$('#search_form').submit( function(e) {
  e.preventDefault();
  let city_name = encodeURI($('#search_field').val().trim());
  display_city_data(city_name);
});

function display_city_data (city_name) {
  // First, use the Geocoding API to locate the city
  // that was searched for. We could use the 'q' parameter
  // in the Weather or Forecast API's, but there's a note
  // indicating that this feature has been deprecated.
  let city_query = 'https://api.openweathermap.org/geo/1.0/direct?q='+city_name+'&limit=10&appid=9f18efe2cbef009702bff1a605ad69c2';
  fetch(city_query)
  .then(function(response) {return response.json()})
  .then(function(city_data) {
    console.log(city_data);
    // If the Geocoding API found a matching city, proceed to 
    // get the current weather conditions from the Weather API.
    if (city_data.length > 0) {
      let current_query = 'https://api.openweathermap.org/data/2.5/weather?lat='+city_data[0].lat+'&lon='+city_data[0].lon+'&appid=9f18efe2cbef009702bff1a605ad69c2';
      fetch(current_query)
      .then(function(response) {return response.json()})
      .then(function(current_weather) {
        console.log(current_weather);
        let display_string = current_weather.name;
        console.log(city_data[0]);
        if (city_data[0].hasOwnProperty('state')) display_string = display_string + ', '+get_state_code(city_data[0].state);

        // Update the current conditions box with info from
        // the API response.
        $('#initial_prompt').hide();
        $('#invalid_search_prompt').hide();
        $('#city_name').text(display_string);
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

        // Add entry to recents list, if there isn't already
        // a button with the same city name.
        let found_duplicate = false;
        $('.recent_button').each( function() {
          if ($(this).text() == display_string) found_duplicate = true;
        });
        if (!found_duplicate) {
          console.log('new recent!');
          let new_recent = {
            search_criteria: city_name,
            display_name: display_string
          }
          window.recent_cities = [];
          if (localStorage.getItem('recent_cities')) window.recent_cities = JSON.parse(localStorage.getItem('recent_cities'));
          window.recent_cities.push(new_recent);
          // Only keep the 5 most recent cities to avoid UI clutter.
          if (window.recent_cities.length > 5) window.recent_cities = window.recent_cities.slice(1);
          localStorage.setItem('recent_cities',JSON.stringify(window.recent_cities));
          load_recents();
        }

        $('#recent_searches').show();

      });
      // Also start a fetch request for the 5-day forecast
      // using the Forecast API.
      let forecast_query = 'https://api.openweathermap.org/data/2.5/forecast?lat='+city_data[0].lat+'&lon='+city_data[0].lon+'&appid=9f18efe2cbef009702bff1a605ad69c2';
      fetch(forecast_query)
      .then(function(response) {return response.json()})
      .then(function(forecast_data) {
        console.log(forecast_data);
        // Update the day cards with forecast info from
        // the API response.
        for (var i=1;i<6;i++) {
          let card_i = $('#day_'+i);
          let date_i = moment().add(1*i,'d');
          let date_i_text = date_i.format('MM/DD/YY');
          card_i.find('.forecast_date').text(date_i_text);
          card_i.find('.forecast_icon_container').empty();
          // Use a helper function to get the predominate weather
          // condition on this day, and display the corresponding
          // weather icon.
          card_i.find('.forecast_icon_container').append('<i class="fa-solid fa-3x '+icons[get_predominate_conditions(forecast_data.list, date_i)]+' forecast_icon"></i>');
          // Use a helper function to get the predicted high temp
          // for the day, convert to Fahrenheit, and display.
          let temp_i = (9/5*(parseFloat(get_max_temp(forecast_data.list,date_i))-273.15)+32).toFixed(0)+' °F';
          card_i.find('.forecast_temp').text(temp_i);
          // Use a helper function to get the average predicted
          // wind speed, convert to knots, and display.
          let ws_i = (parseFloat(get_avg_ws(forecast_data.list,date_i))/1.94384).toFixed(2)+' kts';
          card_i.find('.forecast_ws').text(ws_i);
          // Use a helper function to get the average predicted
          // humidity, and display.
          let hum_i = get_avg_hum(forecast_data.list,date_i).toFixed(0)+'%';
          card_i.find('.forecast_hum').text(hum_i);
        }
        $('#forecast').show();
      });
    } else {
      // If no city was found by the Geocoding API, display
      // a message prompting the user to try again.
      $('#initial_prompt').hide();
      $('#current').hide();
      $('#forecast').hide();
      $('#invalid_search_prompt').show();
    }

  });
}


/*------------------------------
Helper Functions
------------------------------*/

// Function that filters the forecast down to entries that
// correspond to a particular day, and returns the 'main' weather
// variable associated with the predominate weather condition.
// 
// NOTE: If there is a tie, this function is biased toward 
// conditions that occur earlier in the forecast.
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

// Function that returns the maximum predicted temperature 
// for a given day in the forecast.
function get_max_temp (data, date) {
  let filtered_data = data.filter(e => moment(e.dt_txt).day() == date.day());
  let max_temp = 0;
  for (var i=0;i<filtered_data.length;i++) {
    let high_temp = filtered_data[i].main.temp_max;
    if (high_temp > max_temp) max_temp = high_temp;
  }
  return max_temp;
}

// Helper function that returns the average predicted wind speed 
// for a given day in the forecast.
function get_avg_ws (data, date) {
  let filtered_data = data.filter(e => moment(e.dt_txt).day() == date.day());
  let avg_ws = 0;
  for (var i=0;i<filtered_data.length;i++) {
    avg_ws = avg_ws + filtered_data[i].wind.speed;
  }
  avg_ws = avg_ws / filtered_data.length;
  return avg_ws;
}

// Helper function that returns the average predicted humidity 
// for a given day in the forecast.
function get_avg_hum (data, date) {
  let filtered_data = data.filter(e => moment(e.dt_txt).day() == date.day());
  let avg_hum = 0;
  for (var i=0;i<filtered_data.length;i++) {
    avg_hum = avg_hum + filtered_data[i].main.humidity;
  }
  avg_hum = avg_hum / filtered_data.length;
  return avg_hum;
}

// Helper function that generates buttons in the recent cities
// panel based on the contents of LocalStorage.
function load_recents () {
  if (localStorage.getItem('recent_cities')) {
    window.recent_cities = JSON.parse(localStorage.getItem('recent_cities'));
    $('#recents_list').empty();
    if (window.recent_cities.length > 0) {
      for (var i=0;i<window.recent_cities.length;i++) {
        $('#recents_list').append('<button class="btn btn-secondary my-1 w-100 recent_button" data-city="'+window.recent_cities[i].search_criteria+'">'+window.recent_cities[i].display_name+'</button>');
        $('button[data-city="'+window.recent_cities[i].search_criteria+'"]').click( function(e) {
          e.preventDefault();
          display_city_data($(this).attr('data-city'));
        });
      }
      $('#no_recents').hide();
      $('#recents_list').show();
    } else {
      $('#recents_list').hide();
      $('#no_recents').show();
    }
  } else {
    $('#recents_list').empty();
    $('#recents_list').hide();
    $('#no_recents').show();
  }
}

// Helper function that translates full state names into
// two-letter state codes for US states. This is purely
// used for neat formatting of display text.
function get_state_code (state) {
  switch (state) {
    case "Alabama":
      return "AZ";
    case "Alaska":
      return "AK";
    case "Arizona":
      return "AZ";
    case "Arkansas":
      return "AR";
    case "California":
      return "CA";
    case "Colorado":
      return "CO";
    case "Connecticut":
      return "CT";
    case "Delaware":
      return "DE";
    case "Florida":
      return "FL";
    case "Georgia":
      return "GA";
    case "Hawaii":
      return "HI";
    case "Idaho":
      return "ID";
    case "Illinois":
      return "IL";
    case "Indiana":
      return "IN";
    case "Iowa":
      return "IA";
    case "Kansas":
      return "KS";
    case "Kentucky":
      return "KY";
    case "Louisiana":
      return "LA";
    case "Maine":
      return "ME";
    case "Maryland":
      return "MD";
    case "Massachusetts":
      return "MA";
    case "Michigan":
      return "MI";
    case "Minnesota":
      return "MN";
    case "Mississippi":
      return "MS";
    case "Missouri":
      return "MO";
    case "Montana":
      return "MT";
    case "Nebraska":
      return "NE";
    case "Nevada":
      return "NV";
    case "New Hampshire":
      return "NH";
    case "New Jersey":
      return "NJ";
    case "New Mexico":
      return "NM";
    case "New York":
      return "NY";
    case "North Carolina":
      return "NC";
    case "North Dakota":
      return "ND";
    case "Ohio":
      return "OH";
    case "Oklahoma":
      return "OK";
    case "Oregon":
      return "OR";
    case "Pennsylvania":
      return "PA";
    case "Rhode Island":
      return "RI";
    case "South Carolina":
      return "SC";
    case "South Dakota":
      return "SD";
    case "Tennessee":
      return "TN";
    case "Texas":
      return "TX";
    case "Utah":
      return "UT";
    case "Vermont":
      return "VT";
    case "Virginia":
      return "VA";
    case "Washington":
      return "WA";
    case "West Virginia":
      return "WV";
    case "Wisconsin":
      return "WI";
    case "Wyoming":
      return "WY";
    default:
      return state;
  }
}

