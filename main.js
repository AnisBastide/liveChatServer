const express = require('express')
const app = express()
const port = 3001
const db = require('./db')
const router = require('./router')
const nunjucks = require('nunjucks')
const session = require('express-session')
var cookieParser = require('cookie-parser');
app.use(cookieParser());


// configure socket.io
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io')
const io = new Server(server);
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var mongoose = require('mongoose');


nunjucks.configure('views', {
    autoescape: true,
    express: app
})
let database = new db()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static('styles'))
app.use('/pages', router)
// store = new connect.middleware.session.MemoryStore();
var store = new session.MemoryStore;

const sessionMiddleware = session({
    secret: 'sssssshhhhhhh',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
})

app.use(sessionMiddleware)

io.use((socketClient, next) => {
    sessionMiddleware(socketClient.request, {}, next);
    // sessionMiddleware(socket.request, socket.request.res, next); will not work with websocket-only
    // connections, as 'socket.request.res' will be undefined in that case
});



/**
 * Catches the connection event
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

    socketClient.on('channel-sent', async(data) => {
        console.log(data)
        var newChannel = await database.addChannel(data.data)
            io.emit('channelRegistered', {data : newChannel})
    })

    socketClient.on('changeChannel', async(data) => {
        // let messageList = await d
        io.emit('channelRegistered', {data : newChannel})
    })

})


//We handle the '/' route
app.get('/', async (req, res) => {
    if (req.session.mail) {
        res.render('home.html', {
            title : req.session.mail,
            isConnected: true
        })
    } else {
        res.render('home.html', {
            title : req.session.mail
        })
    }
})

//We handle the login and check if user is existing then create the cookies of his session
app.post('/login', async (req, res) => {
    var user = await database.getUser(req.body['mail'])
    if (user && database.checkPwd(user.password, req.body['password'])) {
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

//We handle the '/logout' route and disconnect the user
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
    if (err) {
        return console.log(err);
    }
    res.redirect('/');
    })
});

//We handle the '/login' route 
app.get('/login', (req, res) => {
    res.render('login.html')
});

app.get('/register', (req, res) => {
    res.render('register.html')
});

//We handle the registering of the user
app.post('/register', async (req, res) => {
    let user = await database.Auth.findOne({mail:req.body['regmail']})
    var userPseudo = await database.Auth.findOne({pseudo:req.body['regpseudo']})
    //If the email and the pseudo doesn't already exist we're registering the user
    if (!user && !userPseudo) {
        await database.addUser(req.body['regmail'],req.body['regpassword'], req.body['regpseudo'])
        .then(()=>{
            res.render('home.html', {
                title : 'ENREGISTRE !',
                isConnected: true
            })
        })
    } else {
        res.render('home.html', {
            title : 'ce mail ou ce pseudo existe deja !'
        })
    }
})

//We handle the 'delete/:id' route to delete a user 
app.post('/delete/:id', async(req, res) => {
    let castedId = mongoose.Types.ObjectId(req.params.id)
    console.log('user id to delete : ' + req.params.id)
    let deleted = await database.deleteUser(req.params.id)
    if(deleted){
        console.log('deleted')
        res.redirect('/interfaceAdmin')
    }
    else{
        res.json('User could not be deleted')
    }
})

//We handle the '/:id' route to update a user 
app.patch('/:id', async(req, res) => {
    let user = await database.getUserById(req.params.id)
    let newUserInfo = new  database.Auth({mail:req.body['mail'],password:req.body['password']})
    await database.updateUser(user,newUserInfo)
    res.end()
}) 

//We handle the '/chat' route to render the chat page to the user
app.get('/chat', async(req,res) => {
    //we display the messages of the first channel in the chat interface
    let myArray = await database.Message.find({channelId: 1})
    if (req.session.mail) {
        res.render('chat.html', {
            messages : myArray,
            channels : await database.getChannels(),
            isConnected: true
        })
    } else {
        res.redirect('/login');
    }
})

app.get('/interfaceAdmin', async(req,res) => {
    let user = await database.getUser(req.session.mail)
    let users = await database.Auth.find()

    if (user && user.admin) {
        res.render('interfaceAdmin.html', {
            userList: users,
            isConnected: true
        })
    } else {
        res.redirect('/error');
    }
})

app.get('/error', (req, res) => {
    res.render('error.html')
});

//We establish the socket.IO connection
server.listen(8082, () => {
    console.log('listenning on 8082')
})

