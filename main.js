const express = require('express')
const app = express()
const port = 3001
const db = require('./db')

const router = require('./router')
const nunjucks = require('nunjucks')

nunjucks.configure('views', {
    autoescape: true,
    express: app
})

app.use(express.static('public'))

app.use('/pages', router)

let database = new db()
app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.post('/register', async (req, res) => {
    let user = await database.Auth.findOne({mail:req.body['mail']})
    if (!user) {
        await database.addUser(req.body['mail'],req.body['password'])
    }
    res.end()
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
    let user = await database.getUser('id')
    let newUserInfo = new  database.Auth({mail:req.body['mail'],password:req.body['password']})
    await database.updateUser(user,newUserInfo)
    res.end()
})

app.get('/:id', async (req, res) => {
    return await database.getUser(req.params.id)
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})


