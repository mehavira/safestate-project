const express = require('express');
const cors = require('cors');
const app = express();
const handlebars = require('express-handlebars').create({defaultLayout: 'main'});
const bodyParser = require('body-parser');
const axios = require('axios');
const mysql = require('mysql');
const path = require('path');

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'new_user',
    password: 'password',
    database: 'agency_locations_schema',
      
});
    
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../public')));

app.get('/stats/', function(req, res){
    let context = {};
    const zipCode = req.query.zipcode;

    if ('zipcode' in req.query){
        if (isNaN(parseInt(zipCode))){
            res.render('infoerror', {header: 'The information you entered is invalid. '+
                                    'Please enter a valid zip code in Oregon.'});
        }
        else{
            let parsedZip = parseInt(zipCode);
            let sqlQuery = 'SELECT zip FROM zipcode_to_county WHERE zip='+parsedZip;
            conn.query(sqlQuery, (err, results) => {
                if (err) throw err;
                if (results.length === 0){
                    res.render('infoerror', {header: 'The information you entered is invalid.'+
                    ' Please enter a valid zip code in Oregon.'});
                }
                else{
                    context['locationMeasure'] = zipCode;
                    axios.get('http://localhost:2000/api/crimeincidents/?zipcode='+zipCode)
                    .then(response => {
                        let data = response.data;
                        context['mvThefts'] = data['Motor Vehicle Theft']; 
                        context['robberies'] = data['Robbery'];
                        context['wlvs'] = data['Weapon Law Violations'];
                        context['assaults'] = data['Simple Assault'];
                        context.mvTheftDates = Object.keys(data['Motor Vehicle Theft']);
                        context['mvTheftOffenses'] = Object.values(data['Motor Vehicle Theft']);
                        context['robberyDates'] = Object.keys(data['Robbery']);
                        context['robberyOffenses'] = Object.values(data['Robbery']);
                        context['wlvDates'] = Object.keys(data['Weapon Law Violations']);
                        context['wlvOffenses'] = Object.values(data['Weapon Law Violations']);
                        context['assaultDates'] = Object.keys(data['Simple Assault']);
                        context['assaultOffenses'] = Object.values(data['Simple Assault']);

                        const info = { 'zipCode': parseInt(zipCode) };
                        axios.post('http://localhost:8222/sight-ideas/', info)
                        .then(response => {
                                let data = response.data;
                                context.sightsResults = [];
                            data.forEach(sight => {
                                if(sight != null){
                                    context.sightsResults.push(sight.name);
                                }
                            });
                            let sql = 'SELECT LAT, LNG FROM zipcode_to_coords WHERE ZIP='+zipCode;
                            conn.query(sql, (err, results) => {
                                if (err) throw err;
                                const lat = results[0]['LAT'];
                                const long = results[0]['LNG'];
                                axios.get('http://localhost:'+port+
                                '/nearbyagencies/?lat='+lat+'&long='+long)
                                .then(response => {
                                    context.lawAgencies = response.data;
                                    context.mapDivStyle = 'display:none';
                                    if(JSON.stringify(context.sightsResults) ===
                                        JSON.stringify([])){
                                        context.sightsResults = [
                                            'We could not find information for '+
                                            'the zip code you entered.', 
                                            'Click the link below to view places to'+
                                            ' visit on Google Maps.'];
                                        context.sightsLink = 'https://www.google.com/maps/'+
                                        'search/tourist+attractions+near+'+zipCode;
                                        context.mapDivStyle = 'display:block';
                                    }

                                    res.render('stats1', context);
                                    
                                }).catch(error => console.log(error));
                            });
                        
                        }
                        
                        ).catch(error=>console.log(error));
            
            
                    })
                    .catch(error => console.log(error))
                }
            });

        }
        
    }
});

app.get('/getsights/', (req, res) => {
    ////CONVERTING THE INPUT TO ZIP CODE
    const input = req.query.input;
    let modInput = parseFloat(input);
    let context = {};
    if (isNaN(modInput) || !Number.isInteger(modInput) || modInput < 0){
        context.header = 'No results for '+input+'. Please enter a valid zip code within Oregon.';
        res.render('sightsresults', context);
    }
    else{
        axios.post('http://localhost:8222/sight-ideas', {'zipCode': modInput})
        .then(response => {
            const data = response.data;
            if (JSON.stringify(data) === JSON.stringify([]) ||
            JSON.stringify(data) === JSON.stringify({"error": "Invalid zip code"})){
                context.header = 'No results for '+input+
                '. Please enter a valid zip code within Oregon.';
                res.render('sightsresults', context);
            }
            else{
                context.header = 'Viewing tourist attractions near '+input;
                context.sightsResults = [];
                data.forEach(result => {
                    if (result !== null){
                        const modLocName = result.name.replace(/\s+/g, '-');
                        const sightLink = 'http://localhost:' + port +
                            '/stats/?locationname=' + modLocName + '&lat=' +
                            result.latitude + '&long=' + result.longitude;
                        context.sightsResults.push({link: sightLink, name: result.name});
                    }
                });
                
                res.render('sightsresults', context);
            }
        })
        .catch(error => console.log(error));
    }
});

app.get('/nearbyagencies', (req, res) => {
    const lat = req.query.lat;
    const long = req.query.long;
    let sql = 'SELECT latitude, longitude FROM agency_locations';
    conn.query(sql, (err, results) => {
        if (err) throw err;
        const apiKey = 'Aqn0MpJUwV3puwE4G9IdcgKNY9eRVM-ygLBo-ShPzErfApIhVbY-01X8su3jX0Z9';
        let bingApiUrl1 = 'https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins='
            + lat + ',' + long + '&destinations=';
        let bingApiUrl2 = 'https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins='
            + lat + ',' + long + '&destinations=';
        let dists1 = '';
        let dists2 = '';
        const urlEnd = '&travelMode=driving&key='+apiKey;
        for (let i=0; i<results.length; i++){
            if(i<results.length/2){
                dists1 += results[i].latitude+','+results[i].longitude+';';
            }
            else{
                dists2 += results[i].latitude+','+results[i].longitude+';';
            }
        }
        dists1 = dists1.slice(0,-1);
        dists2 = dists2.slice(0,-1);
        bingApiUrl1 += dists1+urlEnd;
        bingApiUrl2 += dists2+urlEnd;
        axios.get(bingApiUrl1).then(response => {
            const distances1 = response['data']['resourceSets'][0]['resources'][0]['results'];
            axios.get(bingApiUrl2).then(resp => {
                const distances2 = resp['data']['resourceSets'][0]['resources'][0]['results'];
                let allDistances = [];
                distances1.forEach(element => {
                    allDistances.push(element.travelDistance);
                });
                distances2.forEach(element => {
                    allDistances.push(element.travelDistance);
                })
                let count = 0;
                results.forEach(element => {
                    element.dist = allDistances[count];
                    count += 1;
                });
                results.sort(function (a, b) {
                    return a.dist - b.dist;
                });
                let sql1 = 'SELECT agency_name FROM agency_locations WHERE';
                count = 5;
                for (let i=0; i<count; i++){
                    sql1 +=  ' (ABS(latitude - '+results[i].latitude+') < 0.00005) OR';
                }
                sql1 = sql1.slice(0, -2);
                conn.query(sql1, (err, results1) => {
                    if (err) throw err;
                    let agencies = [];
                    results1.forEach(element => {
                        if(JSON.stringify(element['agency_name']).indexOf('PD') > -1){
                            const pdReplace = 'Police Department';
                            element.agency_name = element.agency_name.replace('PD', pdReplace);
                        }
                        else if(element['agency_name'].indexOf('SO') > -1){
                            const soReplace = "Sheriff's Office";
                            element.agency_name = element.agency_name.replace('SO', soReplace);
                        }   
                            agencies.push(element.agency_name);
                    });
                    res.send(agencies);
                })
            }).catch(err => console.log(err));

        });
    });
});

// handle errors
app.use(function(req, res){
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res){
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});

const port = process.env.PORT || 3500;
app.listen(port,() =>{
    console.log(`Server started on port ${port}...`);
});