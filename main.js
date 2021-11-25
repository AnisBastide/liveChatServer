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


var users = [];

io.use((socketClient, next) => {
    sessionMiddleware(socketClient.request, {}, next);
    // sessionMiddleware(socket.request, socket.request.res, next); will not work with websocket-only
    // connections, as 'socket.request.res' will be undefined in that case
});


io.on('connection', socketClient => {
	console.log('Un client est connecté', socketClient.id)
    const session = socketClient.request.session;
    session.connections++;
    session.test = socketClient.id;
    session.save();
    console.log(socketClient.request.mail)

    socketClient.on('message-sent', data => {
		console.log(socketClient.id, 'message-sent', data)
        console.log('message sent - session mail : ' + session.test)

        // console.log('data.data : ' + data)
        // console.log('content : ' + data.content)
        // console.log('cookie: ' + data.cookie)



        //database.registerMessage(data.data, )
	})

})

app.get('/', async (req, res) => {
    res.render('home.html')
})

app.post('/login', async (req, res) => {
    let user = await database.getUser(req.body['mail'])
    if (user && database.checkPwd(user.password, req.body['password'])) {

        users.push(user)



        req.session.mail = req.body['mail']
        req.session.pseudo = user.pseudo

        // store.pseudo = user.pseudo
        // store.mail = user.mail
        // console.log('req.session.mail : ' + req.session.mail)
        // console.log('req.body[mail] : ' + req.body['mail'])

        res.cookie('user', users.length).redirect('/');
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

app.post('/register', async (req, res) => {
    let user = await database.Auth.findOne({mail:req.body['mail']})
    if (!user) {
        let newUser = await database.addUser(req.body['mail'],req.body['password'], req.body['pseudo'])
        if (newUser) {
            res.render('home.html', {
                title : 'ENREGISTRE !'
            })
        }
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

// app.get('/:id', async (req, res) => {
//     return await database.getUserById(req.params.id)
// })

// app.listen(port, () => {
//     console.log(`Example app listening at http://localhost:${port}`)
// })

app.get('/chat', async(req,res) => {
    //console.log('reqsession : ' + req.session.mail)
    let myArray = await database.Message.find({channelId: 1})
    if (req.session.mail) {
        res.render('chat.html', {
            messages : myArray
        })
    } else {
        res.redirect('/pages/login');
    }
})

server.listen(8082, () => {
    console.log('listenning on 8082')
})

