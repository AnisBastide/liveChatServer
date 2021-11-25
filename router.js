const Router = require('express').Router
const test = require('./main')

const router = Router();

router.get('/', async(req,res) => {
    res.render('home.html', {
        title : 'je suis le title'
    })
})
router.get('/login', async(req,res) => {
    res.render('login.html', {
        title : 'blabla'
    })
})

// router.get('/test', async(req,res) => {
//     test.testDelete(req,res)
// })

module.exports = router