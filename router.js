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

// router.get('/chat', async(req,res) => {
//     console.log('reqsession : ' + session)
//     if (req.session.mail) {
//         res.render('chat.html', {
//             title : 'blabla'
//         })
//     }
//     res.redirect('/pages/login');
// })

// router.get('/test', async(req,res) => {
//     test.testDelete(req,res)
// })

module.exports = router