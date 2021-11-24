const Router = require('express').Router

const router = Router();

router.get('/', async(req,res) => {
    res.render('home.html', {
        title : 'je suis le title'
    })
})

module.exports = router