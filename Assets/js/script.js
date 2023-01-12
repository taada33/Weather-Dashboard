let apiKey = "cff9c13586d21e7ca05040b8bba7de34";
let userFormEl = document.querySelector('#user-form');
let nameInputEl = document.querySelector('#myInput');
let weatherContainerEl = document.querySelector('#current-weather-container')
let historyContainerEl = document.querySelector('#history-container')

let country;

userFormEl.addEventListener('submit', formSubmitHandler);

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
    localStorage.setItem("City History", JSON.stringify(cityHistory));
  }
}

function populateHistory(){
  let cityHistory = JSON.parse(localStorage.getItem("City History"));
  for(let i = 0; i < cityHistory.length; i++){
    let historyEl = document.createElement('div');
    let cityEl = document.createElement('span');
    cityEl.textContent = cityHistory[i].city;

    //add button that calls getWeatherData() passing city and country

    historyEl.appendChild(cityEl);

    historyContainerEl.appendChild(historyEl);
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
    console.log(city)
    for(let i = 0; i < data.length; i++){
      
      if ((data[i].name.toLowerCase() === city.toLowerCase()) && (data[i].country === country)) {
        console.log("here")
        lon = data[i].coord.lon;
        lat = data[i].coord.lat;
        // console.log(lat + " " + lon);
      }
    }
    let urlForecast = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey;

    fetch(urlForecast)
      .then(function (response) {
    return response.json();
    })
      .then(function (data) {
        console.log(data);
        putLocalStorage(city,country);
      });
  })
  }



  

  //fetching weather object
  

  //filters out city
  function cityIndex(data){
    for(let i=0; i<data.length; i++){
      if(data[i].name.toLowerCase() === city.toLowerCase()){
        console.log(i);
        return i;
      }
    }
  }

  