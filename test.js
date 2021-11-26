let axios = require('axios')
axios.get("http://localhost:8082/chat")
    .then(function(response){
        if (response.request._redirectable._redirectCount > 0) {
            console.log("redirection success")
        }
    })

axios.post("http://localhost:8082/login",{
    mail:'anis1@gmail.com',
    password:'anis1234A'
})
    .then(function(response){
        console.log('SUCESSFULL login')
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
