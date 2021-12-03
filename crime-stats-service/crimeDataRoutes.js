const moment = require('moment');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mysql = require('mysql');
const crimeService = require('./services/crimeService');

// parse application/json
app.use(bodyParser.json());
// create database connection
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'new_user',
  password: 'password',
  database: 'agency_locations_schema',
});

app.set('json spaces', 2);

// crimerates API will return crime rates by category of crime as JSON
app.get('/api/crimerates/', (req, res) =>
  {
    const lat = req.query.lat; 
    const long = req.query.long;
    axios.get('https://geo.fcc.gov/api/census/area?lat='+lat+'&lon='+long+'&format=json')
    .then(
        response => {
            const countyName = response.data.results[0].county_name;
            crimeService.getCrimes(countyName).then(crimesArr =>{
            let crimeRates = {};
            crimesArr.forEach(crimeDesc => {
                crimeRates[crimeDesc] = 0;
            });
        crimeService.getOffensesWithCounty(countyName).then(result => {
          result.forEach(report => {
            crimeRates[report.nibrs_crime_desc] += report.distinct_offenses;
          });
          crimeService.getPopFromCounty(countyName).then(countyPop => {
            for(let key in crimeRates){
              crimeRates[key] = ((crimeRates[key]/countyPop)*100000).toFixed(3);
            }
            res.send(crimeRates);
          })
        })
      });
    })
    .catch(err => console.error(err));
  });


// url gets crime data for motorvehicle thefts, robberies, weapon law violations, and simple
// assaults given zip code
// returns JSON object of crime incidents by month for each crime category
app.get('/api/incidents/', (req, res) => {
    const zipCode = req.query.zipcode;
    crimeService.getCountiesFromZip(zipCode).then(result => (
      res.send(result)
    ))
  });
  app.get('/api/crimeincidents/', (req, res) => {
    const zipCode = req.query.zipcode;
    let countyName = '';

    // will use "Motor Vehicle Theft", "Robbery", "Weapon Law Violations", "Simple Assault" for
    // statistics
    // if zip is given:
    if (typeof zipCode != 'undefined'){
        let sql = 'SELECT county FROM zipcode_to_county WHERE zip='+zipCode;
        conn.query(sql, (err, results) => {
          if (err) throw err;
          countyName = results[0].county;
        let sql = 'SELECT nibrs_crime_desc, incident_date, distinct_offenses FROM '+
            'agency_raw_crime_data WHERE county = "'+countyName+
            '" AND (nibrs_crime_desc = "Motor Vehicle Theft" OR nibrs_crime_desc = "Robbery" OR '+
            'nibrs_crime_desc = "Weapon Law Violations" OR nibrs_crime_desc = "Simple Assault")';
      conn.query(sql, (err, results) => {
      let crime;
      if (err) throw err;
      let data = {"Motor Vehicle Theft": [], "Robbery": [], "Weapon Law Violations": [],
        "Simple Assault": []};
      let dates = {};
      results.forEach(element => {
        let updated_date = new Date(element.incident_date.toString()).toLocaleDateString('en-US')
            .replace(/\//g, "-");
        let split_date = updated_date.split('-');
        if (split_date[0].length === 1){
          split_date[0] = '0'+split_date[0];
        }
        if (split_date[1].length === 1){
          split_date[1] = '0'+split_date[1];
        }
        updated_date = split_date[0]+'-'+split_date[1]+'-'+split_date[2];
        if (!moment(updated_date).format('MMM YY') in dates){
          dates[moment(updated_date).format('MMM YY')] = element.distinct_offenses;
        }
        else {

          dates[moment(updated_date).format('MMM YY')] += element.distinct_offenses;
        }
        data[element.nibrs_crime_desc].push(
            {"incident_date":element.incident_date, "distinct_offenses":element.distinct_offenses}
        );
      });
      let modData = {'Motor Vehicle Theft': {}, 'Robbery': {}, 'Weapon Law Violations': {},
        'Simple Assault': {}};
      for (crime in data){
        data[crime].forEach(incident => {
          let updated_date = new Date(incident.incident_date.toString())
              .toLocaleDateString('en-US')
              .replace(/\//g, "-");
          let split_date = updated_date.split('-');
          if (split_date[0].length === 1){
          split_date[0] = '0'+split_date[0];
        }
        if (split_date[1].length === 1){
          split_date[1] = '0'+split_date[1];
        }
        updated_date = split_date[0]+'-'+split_date[1]+'-'+split_date[2];
          let month_date = moment(updated_date).format('MMM YY');
          if(modData[crime][month_date]){
            modData[crime][month_date] += incident.distinct_offenses;
          }
          else{
            modData[crime][month_date] = incident.distinct_offenses;
          }
        });
      }
      let modData2 = {'Motor Vehicle Theft': {}, 'Robbery': {}, 'Weapon Law Violations': {},
        'Simple Assault': {}};
      for (crime in modData2){
        const datesArr = Object.keys(modData[crime]);
        const sortedDatesArr = datesArr.sort((a, b) => {
          const aMonth = a.slice(0, 3); // gets month of a in 'MMM'
          const bMonth = b.slice(0, 3); // gets month of b in 'MMM'
          const aYear = '20' + a.slice(4, 6); // gets year of a in 'YY' and turns it into 'YYYY'
          const bYear = '20' + b.slice(4, 6); // gets year of b in 'YY' and turns it into 'YYYY'
          // modified a: 'MM YY' becomes 'MM YYYY'
          const modA = moment(aMonth + ' ' + aYear).format('MM YYYY');
          // modified b: 'MM YY' becomes 'MM YYYY'
          const modB = moment(bMonth + ' ' + bYear).format('MM YYYY');
          const aMo = parseInt(modA.slice(0, 2));
          const bMo = parseInt(modB.slice(0, 2));
          const aYr = parseInt(modA.slice(3, 7));
          const bYr = parseInt(modB.slice(3, 7));
          if (aYr === bYr) {
            return aMo - bMo;
          } else if (aYr !== bYr) {
            return aYr - bYr;
          }
        });
        sortedDatesArr.forEach(date => {
          modData2[crime][date] = modData[crime][date];
        });
      }
      res.send(modData2);
    })

        });
      }
    
  });

  // handle errors
  app.use(function(req, res){
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
  });

  app.use(function(err, req, res){
    res.type('plain/text');
    res.status(500);
    res.send('500 - Server Error');
  });
  
const port = process.env.PORT || 2000;
app.listen(port,() =>{
  console.log(`Server started on port ${port}...`);
});