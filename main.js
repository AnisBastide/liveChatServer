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

// app.use(express.static('public'))

app.use('/pages', router)

let database = new db()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
// app.get('/', async (req, res) => {
//     res.send('Hello World!')
//     let auth = new database.Auth({mail:"pierre@gmail.com",password:"password"})
//     await auth.save();
//     let  find = await database.Auth.find({mail:"pierre@gmail.com"});
//     res.json(find);

// })
app.post('/register', async (req, res) => {
    console.log(req.body);
    let find = await database.Auth.findOne({mail:req.body['mail']})
    console.log(find);
    if (!find) {
        if(validateEmail(req.body['mail']) && validatePassword(req.body['password'])){
            let auth = new database.Auth({mail:req.body['mail'],password:req.body['password'], admin:req.body['admin']})
            await auth.save();
        }
    }
    
    res.json(find)
    res.end()
})
app.delete('/delete', async(req, res) => {
    console.log(req.body)
    let find = await database.Auth.findOne({mail:req.body['mail']})
    console.log(find)
    find.delete();
    res.json(find)
    res.end()
})
app.patch('/:id', async(req, res) => {
    if(isAdmin(req.params.id)){
        res.render('home.html', {
            title : 'Vous êtes admin'
        })
    }
    console.log(req.params.id)
    let find = await database.Auth.findOne({mail:'pierreTest@maiffffffl.frhgvkjgv'})
    var findBis = find;
    findBis.mail = 'update@test.fr';
    console.log(find)
    find.update(find, findBis);
    res.json(findBis)
    res.end()
})

app.get('/', async (req, res) => {
    
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
function validateEmail(mail) {
    var re = /\S+@\S+.\S+/;
    return re.test(mail);
}
function validatePassword(password) {
    var re =/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z0-9]).{8,}$/
    return re.test(password);
}
async function isAdmin(userId){
    let user = await database.Auth.findById(userId);
    return user.isAdmin;
}