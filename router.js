const Router = require('express').Router
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


module.exports = router