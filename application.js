const express = require('express');
const DBConnector = require('./database/dbConnection');
require('dotenv').config();
const app = express();

//DB connection
const dbConnector = new DBConnector();
dbConnector.connect()
    .then(result => console.log("MongoDB is now connected"))
    .catch(err => console.log(err));


// defining the middleware functions to parse the body of the requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// defining paths for login & registeration
app.use('/api/auth', require('./routes/api/authentication'));
// defining paths for check operations
app.use('/api/checks', require('./routes/api/check'));
// defining paths for report operations
app.use('/api/reports', require('./routes/api/report'));

//Set development port
const port = process.env.DEV_PORT || 3000;
app.listen(port, () => {

    console.log(`Example app listening at http://localhost:${port}`)

})