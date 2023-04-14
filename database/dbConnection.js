const mongoose = require('mongoose');
require('dotenv').config();
const MongoURI = process.env.MONGO_URI;
class DBConnector {
    constructor(uri) {
        this.uri = uri;
    }

    async connect() {
        await mongoose.connect(MongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

    }

    async disconnect() {
        await mongoose.disconnect();
    }

}

module.exports = DBConnector