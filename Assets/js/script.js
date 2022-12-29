




console.log("hello world")


fetch('http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid={cff9c13586d21e7ca05040b8bba7de34}')
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log(data);
  });

