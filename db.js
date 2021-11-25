const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const saltRounds = 10;

class Database{
    dbSchema = new mongoose.Schema({
        mail: String,
        password: String,
        pseudo: String,
        admin: { type: Boolean, default: false }
    });
    messageSchema = new mongoose.Schema({
        content: String,
        author: String,
        channelId: Number
    }); 
    channelSchema = new mongoose.Schema({
        title: String,
        channelId : Number
    })
    Auth = mongoose.model('auth', this.dbSchema);
    Message = mongoose.model('message', this.messageSchema)
    Channel = mongoose.model('channel', this.channelSchema)

    constructor() {
        this.connect()
    }
    async connect() {
        await mongoose.connect(process.env.URL_DB);
    }
    
    /**
     * Check validity of email & password, and push in db
     * @param {String} email 
     * @param {String} password 
     * @param {Boolean} isAdmin 
     * @return {import('mongoose/node_modules/mongodb').Auth}
     */
    async addUser(email, password, isAdmin = false) {
        if (this.validateEmail(email) && this.validatePassword(password)) {
            let auth = new this.Auth({
                mail: email,
                password: await this.hashPwd(password),
                admin: isAdmin
            })
            await auth.save();
            return auth
        }
    }

    /**
     * Hash the user password with bcrypt
     * @param {String} myPwd 
     * @return {String} 
     */
    async hashPwd(myPwd) {
        const hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(myPwd, saltRounds, function(err, hash) {
              if (err) reject(err)
              resolve(hash)
            });
        })
        return hashedPassword
    }

    /**
     * Compares the password entered by the user with the one found (hashed) in the database
     * @param {String} hashPwd 
     * @param {String} pwd 
     */
    async checkPwd(hashPwd, pwd) {
        bcrypt.compare(pwd, hashPwd, function(err, result) {
            return result
        });
    }

    /**
     * Deletes a user with his id
     * @param {number} userId 
     * @returns {Boolean}
     */
    async deleteUser(userId) {
        await this.Auth.deleteUser(userId);
        let deletedUser = this.getUserById(userId)
        if(deletedUser){
            return false
        }
        return true
    }

    /**
     * Retrieves a user in db with his id
     * @param {number} userId 
     * @return {user} 
     */
    async getUserById(userId) {
        return this.Auth.findById(userId)
    }

    /**
     * Retrieves a user in db with his mail
     * @param {String} mail 
     * @return {user} 
     */
    async getUser(mail) {
        return await this.Auth.findOne({mail:mail})
    }

    /**
     * Update a user in db
     * @param {user} user 
     * @param {user} newUserInfo 
     */
    async updateUser(user,newUserInfo) {
        this.Auth.updateOne(user,newUserInfo);
    }

    /**
     * Checks if the user is an admin
     * @param {number} userId 
     * @return {Boolean} 
     */
    async isAdmin(userId){
        let user = await this.getUserById(userId);
        return user.admin;
    }

    async registerMessage(message, testPseudo){
        let messageCoucou = new this.Message({
            content: message,
            author: testPseudo,
            channelId: 1,
        })
        await messageCoucou.save();
        return messageCoucou
    }

    validateEmail(mail) {
        var re = /\S+@\S+.\S+/;
        return re.test(mail);
    }
    validatePassword(password) {
        var re =/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z0-9]).{8,}$/
        return re.test(password);
    }
}
module.exports = Database
