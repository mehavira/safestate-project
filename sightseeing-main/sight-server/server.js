const express = require('express');
const resultSights = require('./resultSights')


const port = process.env.PORT || 8222


const app = express()
app.use(express.json());

app.use(resultSights);


app.listen(port, '0.0.0.0', () => {
    console.log(`Server online at http://localhost:${port}`)
})
