const mysql = require('mysql');
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'new_user',
    password: 'password',
    database: 'agency_locations_schema',
});

function mysqlBaseQuery(sql, callBackFunction) {
    conn.connect((err) =>{if(err) throw err;});
      const promiseQuery = new Promise(function(resolve, reject){
        conn.query(sql, (err, results) => {
          if (err) reject(err);
          const data= callBackFunction(results);
          resolve(data);
        });
      }).catch(error => console.log(error));
      conn.end();
      return promiseQuery;
  }
  module.exports = {mysqlBaseQuery};