let axios = require('axios')
axios.get("http://localhost:8082/chat")
    .then(function(response){
        console.log(response.request._redirectable._redirectCount)
    })

axios.post("http://localhost:8082/login",{
    mail:'anis1@gmail.com',
    password:'anis1234A'
})
    .then(function(response){
        console.log('SUCESSFULL login')
        console.log(response.request.cookie)
    })
    .catch(function (err){
        console.log('ERROR login')
    });
axios.post("http://localhost:8082/register",{
    mail:'anis1@gmail.com',
    password:'anis1234A',
    pseudo:'anis'
})
    .then(function(response){
        console.log('SUCESSFULL register')
    })
    .catch(function (err){
        console.log('ERROR register')
    });
