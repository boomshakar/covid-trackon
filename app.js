const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const api = require("novelcovid");
const moment = require("moment");

// you can choose which URL to use, this will not change the behaviour of the API
api.settings({
  baseUrl: "https://disease.sh",
});

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
const port = process.env.PORT || 3000;

let allDataCase = [];
let allDataDeath = [];
let allDataRecovered = [];
let caseData = [];

app.get("/", async (req, res) => {
  const global = await api.all();
    const globeUpdated = global.updated;
    const minutesAgo = moment(globeUpdated).fromNow(); //last time updated
    const countries = await api.countries({ sort: 'cases' });
    const titleHead = "Home";
    res.render('index', { 
      confirmedCases: thousands_separators(global.cases),
      activeCases: thousands_separators(global.active),
      dischargedCases: thousands_separators(global.recovered), 
      deathCases: thousands_separators(global.deaths), 
      countries: countries,titleHead:titleHead,
      minutesAgo,
    });
});
app.get("/country/:countryName", async (req, res)=>{
  const global = await api.all();
    const globeUpdated = global.updated;
    const minutesAgo = moment(globeUpdated).fromNow();
    const countryName = req.params.countryName.toString();
    const history = await api.historical.countries({country:countryName, days: 'all', minutesAgo});
    const timelineCases = history.timeline.cases;
    const timelineDeaths = history.timeline.deaths;
    const timelineRecovered = history.timeline.recovered;
    for (var i in timelineCases){
      allDataCase.push(i);
      caseData.push(timelineCases[i]);
    }
    for (var i in timelineDeaths){
      allDataDeath.push(timelineDeaths[i]);
    }
    for (var i in timelineRecovered){
      allDataRecovered.push(timelineRecovered[i]);
    }
    const countryCap = countryName.toUpperCase(); 
    res.render("country", {titleHead:countryCap,countryCap,caseData,allDataRecovered,allDataDeath, allDataCase, minutesAgo});
    allDataCase = [];
    allDataDeath = [];
    allDataRecovered = [];
    caseData = [];
})

// to sepate the numbers in thousands with comma
function thousands_separators(num){
  let num_parts = num.toString().split(".");
  num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return num_parts.join(".");
  }
app.get("/contactme", async (req, res)=>{
  const global = await api.all();
    const updated = global.updated;
    const minutesAgo = moment(updated).fromNow();
    const titleHead = "ContactMe";
  res.render("contact", {titleHead:titleHead,minutesAgo});
})
app.get("*", async(req, res)=>{
  const global = await api.all();
    const updated = global.updated;
    const minutesAgo = moment(updated).fromNow();
    const titleHead = "4.0.4";
  res.render("notfound", {titleHead:titleHead,postTitle: "4.0.4", minutesAgo});
})
app.listen(port, () => {
  console.log("Server is up and running on port " + port);
});
