let base = require('./mySqlProvider');
function getAllCounties(){
    const counties = ["Linn", "Jackson", "Clatsop", "Marion", "Baker", "Coos", "WASHINGTON",
    "Deschutes", "BENTON", "Morrow", "Curry", "Harney", "Clackamas", "Yamhill",
    "Lane", "Columbia", "DOUGLAS", "Crook", "Polk", "Wallowa", "Gilliam", "Josephine",
    "Multnomah", "Umatilla", "Hood River", "Jefferson", "Grant", "KLAMATH", "Union",
    "LAKE", "Lincoln", "Malheur", "TILLAMOOK", "Sherman", "WASCO", "Wheeler"];
    return '"'+ counties.join('", "')+ '"'
  }

function getCrimes(countyName){
    let sql = 'SELECT DISTINCT nibrs_crime_desc FROM agency_raw_crime_data WHERE county IN ('+
    getAllCounties()+')';
    if (countyName != null){sql = 'SELECT DISTINCT nibrs_crime_desc FROM agency_raw_crime_data'+
        ' WHERE county ="'+countyName+'"';
    }
    return base.mysqlBaseQuery(sql, function(result) {
        let crimesArr = [];
        result.forEach(crimeDesc => crimesArr.push(crimeDesc.nibrs_crime_desc));
        return crimesArr;
    })
}

function getOffensesWithCounty(countyName){
    let sql = 'SELECT nibrs_crime_desc, distinct_offenses FROM agency_raw_crime_data WHERE county='
        + '"'+countyName+'"';
    return base.mysqlBaseQuery(sql, function(result){
        return result;
    })
}

function getPopFromCounty(countyName){
    let sql = 'SELECT population FROM counties_and_pop WHERE county='+'"'+countyName+' County"';
    return base.mysqlBaseQuery(sql, function(result){
        return result[0].population.replace(/,/g, '');
    })
}

function getCountiesFromZip(zipCode){
    let sql = 'SELECT county FROM zipcode_to_county WHERE zip='+zipCode;
    return base.mysqlBaseQuery(sql, function(result){
        return result
    })
}

function getIncidentsFromCounty(countyName){
    let sql = 'SELECT nibrs_crime_desc, incident_date, distinct_offenses FROM '+
    'agency_raw_crime_data WHERE county = "'+countyName+'" AND '+
    '(nibrs_crime_desc = "Motor Vehicle Theft" OR nibrs_crime_desc = "Robbery" OR '+
    'nibrs_crime_desc = "Weapon Law Violations" OR nibrs_crime_desc = "Simple Assault")';
    return base.mysqlBaseQuery(sql, (result) => {
        let data = {"Motor Vehicle Theft": [], "Robbery": [], "Weapon Law Violations": [],
            "Simple Assault": []};
        let dates = {};
        result.forEach(element => {
            let updatedDate = new Date(element.incident_date.toString())
                .toLocaleDateString('en-US').replace(/\//g, "-");
            let splitDate = updatedDate.split('-');
            if (splitDate[0].length === 1){
            splitDate[0] = '0'+splitDate[0];
          }
          if (splitDate[1].length === 1){
            splitDate[1] = '0'+splitDate[1];
          }
          updatedDate = splitDate[0]+'-'+splitDate[1]+'-'+splitDate[2];
          if (!moment(updatedDate).format('MMM YY') in dates){
            dates[moment(updatedDate).format('MMM YY')] = element.distinct_offenses;
          }
          else {dates[moment(updatedDate).format('MMM YY')] += element.distinct_offenses}
          data[element.nibrs_crime_desc]
              .push({"incident_date":element.incident_date,
                  "distinct_offenses":element.distinct_offenses});
        });
        return data;
    })
}


module.exports = {getCrimes, getOffensesWithCounty, getPopFromCounty, 
                getCountiesFromZip, getIncidentsFromCounty}