const express = require('express')
const app = express()
const port = 3001
const db = require('./db')
const router = require('./router')
const nunjucks = require('nunjucks')
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io')
const io = new Server(server);
var cookieParser = require('cookie-parser');
app.use(cookieParser());

nunjucks.configure('views', {
    autoescape: true,
    express: app
})
const session = require('express-session')
let database = new db()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static('styles'))
app.use('/pages', router)
app.use(session({
  
    // It holds the secret key for session
    secret: 'Your_Secret_Key',
  
    // Forces the session to be saved
    // back to the session store
    resave: true,
  
    // Forces a session that is "uninitialized"
    // to be saved to the store
    saveUninitialized: true
}))


/**
 * Catches the connection event to the server socket.io
 * @param {[Object Object]} socketClient
 */
io.on('connection', socketClient => {
	console.log('Un client est connecté', socketClient.id)
    //When a 'message-sent' event is emitted
    socketClient.on('message-sent', data => {
        //we push the message in the database
        database.registerMessage(data.data, data.cookieValue)
        .then(async ()=>{
            //If we pushed succesfully, we emit the 'messageRegistered' event
            io.emit('messageRegistered', { message: data.data, pseudo: data.cookieValue })
        })
	})

})

// async function getMessages() {
//     let myArray = await database.Message.find({channelId: 1})
//     return myArray
// }


//We handle the '/' route
app.get('/', async (req, res) => {
    res.render('home.html', {
        title : req.session.mail || 'test session' 
    })
})

//We handle the '/login' route
app.post('/login', async (req, res) => {
    var user = await database.getUser(req.body['mail'])
    var userPseudo = await database.getUser(req.body['Pseudo'])
    if (user && database.checkPwd(user.password, req.body['password'])) {
        console.log("session id : " + req.session.id)
        globalThis.pseudoUser = res.cookie('mail', req.body['mail'])
        res.cookie('pseudo', user.pseudo)
        req.session.mail = req.body['mail']
        session.mail = req.body['mail']
        session.pseudo = user.pseudo
        res.redirect('/');
    } else {
        res.render('home.html', {
            title : 'Combinaison mdp mail incorrect'
        })
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
    if (err) {
        return console.log(err);
    }
    res.redirect('/');
    })
});

app.get('/login', (req, res) => {
    res.render('login.html')
});

app.post('/register', async (req, res) => {
    let user = await database.Auth.findOne({mail:req.body['mail']})
    if (!user) {
        let newUser = await database.addUser(req.body['mail'],req.body['password'], req.body['pseudo'])
        .then((success)=>{
            res.render('home.html', {
                title : 'ENREGISTRE !'
            })
        })
    } else {
        res.render('home.html', {
            title : 'ce mail existe deja !'
        })
    }
})

app.delete('/:id', async(req, res) => {
    let deleted = await database.deleteUser(req.params.id)
    if(deleted){
        res.end()
    }
    else{
        res.json('User could not be deleted')
    }
})

app.patch('/:id', async(req, res) => {
    let user = await database.getUserById('id')
    let newUserInfo = new  database.Auth({mail:req.body['mail'],password:req.body['password']})
    await database.updateUser(user,newUserInfo)
    res.end()
}) 

app.get('/chat', async(req,res) => {
    console.log('reqsession : ' + req.session.mail)
    let myArray = await database.Message.find({channelId: 1})
    if (req.session.mail) {
        res.render('chat.html', {
            messages : myArray
        })
    } else {
        res.redirect('/login');
    }
})

server.listen(8082, () => {
    console.log('connecté au serveur')
})

