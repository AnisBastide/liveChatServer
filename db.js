const mongoose = require('mongoose');
require('dotenv').config();

class Database{
    dbSchema = new mongoose.Schema({
        mail: String,
        password: String,
        admin: { type: Boolean, default: false }
    });
    Auth = mongoose.model('auth', this.dbSchema);
    constructor() {
        this.connect()
    }
    async connect() {
        await mongoose.connect(process.env.URL_DB);
    }

    async addUser(email, password,isAdmin) {
        if (this.validateEmail(email) && this.validatePassword(password)) {
            let auth = new this.Auth({
                mail: email,
                password: password,
                admin: isAdmin
            })
            await auth.save();
            return auth
        }
    }

    async deleteUser(userId) {
        await this.Auth.deleteUser(userId);
        let deletedUser = this.getUser(userId)
        if(deletedUser){
            return false
        }
        return true
    }
    async getUser(userId) {
        return this.Auth.findById(userId)
        }

    async updateUser(user,newUserInfo) {
        this.Auth.updateOne(user,newUserInfo);
    }

    validateEmail(mail) {
        var re = /\S+@\S+.\S+/;
        return re.test(mail);
    }
    validatePassword(password) {
        var re =/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z0-9]).{8,}$/
        return re.test(password);
    }

    async isAdmin(userId){
        let user = await this.getUser(userId);
        return user.admin;
    }
}
module.exports = Database
