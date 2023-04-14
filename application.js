const express = require('express');
const connect = require('./database/dbConnection');
const DBConnector = require('./database/dbConnection');
require('dotenv').config();
const app = express();

//DB connection
const dbConnector = new DBConnector();
dbConnector.connect()
    .then(result => console.log("MongoDB is now connected"))
    .catch(err => console.log(err));

//Dummy test
app.get('/', (req, res) => {
    res.send('Hello World!')
})

//Set development port
const port = process.env.DEV_PORT || 3000;
app.listen(port, () => {

    console.log(`Example app listening at http://localhost:${port}`)

})