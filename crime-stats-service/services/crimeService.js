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

module.exports = {getCrimes, getOffensesWithCounty, getPopFromCounty, 
                getCountiesFromZip}