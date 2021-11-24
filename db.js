const mongoose = require('mongoose');
require('dotenv').config();

class Database{
    constructor() {
        this.connect()
    }
    async connect() {
        await mongoose.connect(process.env.URL_DB);
    }
    dbSchema = new mongoose.Schema({
        mail: String,
        password: String,
        admin: { type: Boolean, default: false }
    });
    Auth = mongoose.model('auth', this.dbSchema);
}
module.exports = Database
