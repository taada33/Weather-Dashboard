let apiKey = "cff9c13586d21e7ca05040b8bba7de34";
let userFormEl = document.querySelector('#user-form');
let nameInputEl = document.querySelector('#myInput');
let weatherContainerEl = document.querySelector('#current-weather-container')
let historyContainerEl = document.querySelector('#history-container')
let forecastContainerEl = document.querySelector('#forecast-container')

let switchEl = document.getElementById('check')

let country, forecastObj, currentWeatherObj;

switchEl.classList.add("fahrenheit")
let tempUnits = " °F";
let speedUnits = " MPH";

userFormEl.addEventListener('submit', formSubmitHandler);
switchEl.addEventListener('change',function(){
  if (switchEl.checked){
    //convert to metric
      switchEl.classList.remove("fahrenheit");
      switchEl.classList.add("celsius");
      tempUnits = " °C";
      speedUnits = " KPH";
  } else {
    //convert to imperial
      switchEl.classList.remove("celsius");
      switchEl.classList.add("fahrenheit");
      tempUnits = " °F";
      speedUnits = " MPH";
  }
  displayWeatherData();
});





populateHistory();

//fetches cityList json object containing all cities supported by openWeather
fetch("./Assets/js/cityList.json")
  .then(function (response){
    return response.json();
    
  })
  .then(function(data){
    autoComplete(document.getElementById("myInput"), data);
  })


//modified autocomplete function (https://www.w3schools.com/howto/howto_js_autocomplete.asp) to work with openweather API's cityList.json
function autoComplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  // variable which keeps track of the current focused (shaded) element and applies css
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      if(val.length < 2){return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].name.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].name.substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].name.substr(val.length) + ", " + arr[i].country;
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
              b.addEventListener("click", function(e,i) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.textContent.split(', ')[0];
              country = this.textContent.split(', ')[1];
              
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);

          //limits number of autocomplete recommendations to 10 elements
          if(a.childElementCount > 9){
            return;
          }
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
}

function formSubmitHandler(){
  
  //prevents the page from reloading when the form is submitted
  event.preventDefault();
  console.log(nameInputEl.value)
  //cleans up user submitted data and stores as variable username (trim() removes any excess whitespace at the beginning and end of string)
  city = nameInputEl.value;
  //filters for valid username inputs
  if (city) {
    //function call to get user repos with username parameter
    getWeatherData(city);
    //
    weatherContainerEl.textContent = '';
    //clears the input field
    nameInputEl.value = '';
  } else {
    //if the username is invalid, provides alert
    alert('Please enter a City');
  }
}

function putLocalStorage(city,country){
  let cityObj = {
    city: city,
    country: country
  };
  if(localStorage.getItem("City History") === null){
    let newHistory = [cityObj];
    localStorage.setItem("City History", JSON.stringify(newHistory));
  }else{
    let cityHistory = JSON.parse(localStorage.getItem("City History"));
    cityHistory.push(cityObj);
    //limits the amount of cityObjs in localstorage to 8
    if (cityHistory.length >= 9) {
      cityHistory.splice(0, 1)
    }
    let uniqueHistory = unique(cityHistory, (a, b) => (a.city === b.city) & (a.country === b.country));
    localStorage.setItem("City History", JSON.stringify(uniqueHistory));
    populateHistory();
  }
}

function populateHistory(){
  if(localStorage.getItem("City History") !== null){
    historyContainerEl.textContent = "";
    let cityHistory = JSON.parse(localStorage.getItem("City History"));
    for(let i = 0; i < cityHistory.length; i++){
      let historyEl = document.createElement('div');
      let cityEl = document.createElement('span');
      let historyBtn = document.createElement('button');

      cityEl.textContent = cityHistory[i].city + ", " + cityHistory[i].country
  
      historyEl.appendChild(historyBtn)
      historyEl.appendChild(cityEl);

      historyBtn.addEventListener('click', function(){
        city = cityEl.textContent.split(', ')[0];
        country = cityEl.textContent.split(', ')[1];
        getWeatherData();
      })
  
      historyContainerEl.appendChild(historyEl);
    }
  }
}




//fetching lat and lot of specified city
function getWeatherData(){
  let lon;
  let lat;
  
  fetch("./Assets/js/cityList.json")
  .then(function (response){
    return response.json();
    
  })
  .then(function(data){
    for(let i = 0; i < data.length; i++){
      
      if ((data[i].name.toLowerCase() === city.toLowerCase()) && (data[i].country === country)) {
        lon = data[i].coord.lon;
        lat = data[i].coord.lat;
        // console.log(lat + " " + lon);
      }
    }
    let urlForecast = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey;
    let urlCurrentWeather = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey;

    fetch(urlForecast)
      .then(function (response) {
    return response.json();
    })
      .then(function (data) {
        // console.log(data);
        forecastObj = data;
        putLocalStorage(city,country);

        fetch(urlCurrentWeather)
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            // console.log(data);
            currentWeatherObj = data;
            displayWeatherData();
      });
      });
  })
  }

  function displayWeatherData(){
    weatherContainerEl.textContent = "";
    let currentCityEl = document.createElement('h2')
    let currentCityImgEl = document.createElement('img');
    currentCityEl.textContent = city + getCurrentDate();
    // currentCityEl.textContent = city + date + weatherstatus;

    let currentWeatherEl = document.createElement('p')
    currentWeatherEl.innerHTML = "Temp: " + convertTemp(currentWeatherObj.main.temp) + tempUnits + "<br>" + " Wind: " + convertSpeed(currentWeatherObj.wind.speed) + speedUnits + "<br>" + " Humidity: " + currentWeatherObj.main.humidity.toFixed(2) + " %";
    currentCityImgEl.src = "http://openweathermap.org/img/wn/" + currentWeatherObj.weather[0].icon + "@2x.png";

    console.log(currentWeatherObj.weather[0].icon);
    weatherContainerEl.appendChild(currentCityEl);
    weatherContainerEl.appendChild(currentCityImgEl);
    weatherContainerEl.appendChild(currentWeatherEl);

    forecastContainerEl.textContent = "";

    for(let i = 0; i < 5; i++){
      let forecastCardEl = document.createElement('div')
      let forecastDateEl = document.createElement('h3')
      let forecastWeatherEl = document.createElement('p')
      let forecastImgEl = document.createElement('img')
      let forecastList = [];
      for(let j = 0; j < forecastObj.list.length; j++){
        if(+forecastObj.list[j].dt_txt.split(' ')[0].split('-')[2] === +getCurrentDate().split('/')[0].split('(')[1]+1+i){
          forecastList.push(forecastObj.list[j]);
        }
      }
      let avgSpeed = 0;
      let avgTemp = 0;
      let avgHumidity = 0;
      let conditions = [];
      for(let k = 0; k < forecastList.length; k++){
        avgTemp += forecastList[k].main.temp;
        avgHumidity += forecastList[k].main.humidity;
        avgSpeed += forecastList[k].wind.speed;
        conditions.push(forecastList[k].weather[0].icon)
      }
      avgTemp = avgTemp / forecastList.length;
      avgSpeed = avgSpeed / forecastList.length;
      avgHumidity = avgHumidity / forecastList.length;

      forecastDateEl.textContent = "(" + (+getCurrentDate().split("/")[0].split('(')[1]+ 1 + i) + getCurrentDate().slice(4);
      forecastWeatherEl.innerHTML = "Temp: " + convertTemp(avgTemp) + tempUnits + "<br>" + " Wind: " + convertSpeed(avgSpeed) + speedUnits + "<br>" + " Humidity: " + avgHumidity.toFixed(2) + " %";
      forecastImgEl.src = "http://openweathermap.org/img/wn/" + getMode(conditions) + "@2x.png";

      forecastCardEl.appendChild(forecastDateEl);
      forecastCardEl.appendChild(forecastImgEl);
      forecastCardEl.appendChild(forecastWeatherEl);
      forecastContainerEl.appendChild(forecastCardEl);
    }

    console.log(currentWeatherObj);
    // console.log(forecastObj);
  }

  //removes duplicate items https://www.javascripttutorial.net/array/javascript-remove-duplicates-from-array/ 
  //given array of objects and callback function
  function unique(a, fn) {
    if (a.length === 0 || a.length === 1) {
      return a;
    }
    if (!fn) {
      return a;
    }
  
    for (let i = 0; i < a.length; i++) {
      for (let j = i + 1; j < a.length; j++) {
        if (fn(a[i], a[j])) {
          a.splice(i, 1);
        }
      }
    }
    return a;
  }

  function getCurrentDate(){
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    // This arrangement can be altered based on how we want the date's format to appear.
    return ` (${day}/${month}/${year})`;
  }

  function convertTemp(temp){
    let convertedTemp;
    if(switchEl.classList.contains("celsius")){
      convertedTemp = (temp-273).toFixed(2)
    }else{
      convertedTemp = (((temp-273)*9/5)+32).toFixed(2)  
    }
    return convertedTemp;
  }

  function convertSpeed(speed){
    let convertedSpeed;
    if(switchEl.classList.contains("celsius")){
      convertedSpeed = speed.toFixed(2);
    }else{
      convertedSpeed = (speed*0.621371).toFixed(2)
    }
    return convertedSpeed;
}

function getMode(array) {
  a = [];
  for(let i = 0; i < array.length; i++){
    if(!a[array[i]]){
      a[array[i]] = 1;
    }else{
      a[array[i]] += 1;
    }

  }
  let highestCount = 0, modeKey;
  for(let key in a){
    let value = a[key];
    if(value > highestCount){
      highestCount = value;
      modeKey = key;
    }
  }
  return modeKey;
}
  