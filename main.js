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

io.on('connection', socketClient => {
	console.log('Un client est connecté', socketClient.id)

	socketClient.on('event-name', data => {
		console.log(socketClient.id, 'event-name', data)
	})

    socketClient.on('message-sent', data => {
		console.log(socketClient.id, 'message-sent', data)
        console.log('session mail : ' + session.mail)
        database.registerMessage(data.data, session.mail)
	})

})

app.get('/', async (req, res) => {
    //database.hashPwd('tetstkjqsjshjlqdhs')
    res.render('home.html', {
        title : req.session.mail || 'test session' 
    })
})

app.post('/login', async (req, res) => {
    let user = await database.getUser(req.body['mail'])
    if (user && database.checkPwd(user.password, req.body['password'])) {


        req.session.mail = req.body['mail']
        session.mail = req.body['mail']
        // console.log('req.session.mail : ' + req.session.mail)
        // console.log('req.body[mail] : ' + req.body['mail'])

        
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

app.post('/register', async (req, res) => {
    let user = await database.Auth.findOne({mail:req.body['mail']})
    if (!user) {
        let newUser = await database.addUser(req.body['mail'],req.body['password'])
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
    console.log('reqsession : ' + req.session.mail)
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
    console.log('dgsfhgjhjkkkugjkfhdghsghghjgfhjdxwxh')
})

