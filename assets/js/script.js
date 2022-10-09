

$('#search_form').submit( function(e) {
  e.preventDefault();
  let query = 'https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}';
});