
const { connect } = require('http2');
var base = require('./mysqlProvider');
function getAllCounties(){
    const counties = ["Linn", "Jackson", "Clatsop", "Marion", "Baker", "Coos", "WASHINGTON",
    "Deschutes", "BENTON", "Morrow", "Curry", "Harney", "Clackamas", "Yamhill",
    "Lane", "Columbia", "DOUGLAS", "Crook", "Polk", "Wallowa", "Gilliam", "Josephine",
    "Multnomah", "Umatilla", "Hood River", "Jefferson", "Grant", "KLAMATH", "Union",
    "LAKE", "Lincoln", "Malheur", "TILLAMOOK", "Sherman", "WASCO", "Wheeler"];
    return '"'+ counties.join('", "')+ '"'
  }

function getCrimes(countyName){
    var sql = 'SELECT DISTINCT nibrs_crime_desc FROM agency_raw_crime_data WHERE county IN ('+
    getAllCounties()+')';
    if (countyName != null){
        sql = 'SELECT DISTINCT nibrs_crime_desc FROM agency_raw_crime_data WHERE county ='+ 
        '"'+countyName+'"';
    }
    return base.mysqlBaseQuery(sql, function(result) {
        var crimesArr = [];
        result.forEach(crimeDesc => crimesArr.push(crimeDesc.nibrs_crime_desc));
        return crimesArr;
    })
}

function getOffensesWithCounty(countyName){
    var sql = 'SELECT nibrs_crime_desc, distinct_offenses FROM agency_raw_crime_data WHERE county='+'"'+countyName+'"';
    return base.mysqlBaseQuery(sql, function(result){
        return result;
    })
}

function getPopFromCounty(countyName){
    var sql = 'SELECT population FROM counties_and_pop WHERE county='+'"'+countyName+' County"';
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
        var data = {"Motor Vehicle Theft":[], "Robbery":[], "Weapon Law Violations":[], "Simple Assault":[]};
        var dates = {};
        result.forEach(element => {
          var updated_date = new Date(element.incident_date.toString()).toLocaleDateString('en-US').replace(/\//g, "-");
          var split_date = updated_date.split('-');
          if (split_date[0].length == 1){
            split_date[0] = '0'+split_date[0];
          }
          if (split_date[1].length == 1){
            split_date[1] = '0'+split_date[1];
          }
          updated_date = split_date[0]+'-'+split_date[1]+'-'+split_date[2];
          if (!moment(updated_date).format('MMM YY') in dates){
            dates[moment(updated_date).format('MMM YY')] = element.distinct_offenses;
          }
          else {
  
            dates[moment(updated_date).format('MMM YY')] += element.distinct_offenses;
          }
          data[element.nibrs_crime_desc].push({"incident_date":element.incident_date, "distinct_offenses":element.distinct_offenses});
        });
        return data;
    })
}


module.exports = {getCrimes, getOffensesWithCounty, getPopFromCounty, 
                getCountiesFromZip, getIncidentsFromCounty}