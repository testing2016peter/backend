var express = require('express');
var router = express.Router();
var AV = require('leanengine')
var _ = require('underscore')
var _requiredLogin = require('../module/requiredLogin.js')
var FILTER = require('../module/FILTER.js')

var parseToolkit = require('../module/parseToolkit')
var jsonAPI = require('../module/jsonAPI')

///////////////////////////////////////////
// signup
///////////////////////////////////////////
var _checkSignup = function(req, res,next){
    var email = req.body.email,
        password = req.body.password;

    if (!email || !password ) {
        res.status(400).send("email and password is require")
    } 
    else{
        req.userJ = jsonAPI.removeNull({
            email: email,
            username: email,
            password: password
        })
        next()
    }
}

router.post('/signup',_checkSignup, function(req, res, next) {
    console.log("post signup")

    console.log(req.userJ)

    var user = new AV.User();

    parseToolkit.iterationSet(user, req.userJ)

    user.signUp().then(function(user) {
        res.status(200).json(FILTER.user(user))
    }, function(error) {
        console.log('Error: ' + error.code + ' ' + error.message);
        res.status(400).send(error)
    });

});


///////////////////////////////////////////
// login
///////////////////////////////////////////

var _checkLogin = function(req, res,next){
    var username = req.body.email,
        password = req.body.password;

    if (!username || !password) {
        res.status(400).send("error")
    } 
    else{
        req.userJ = {
            username: username,
            password: password
        }
        next()
    }
}

router.post('/login',_checkLogin, function(req, res) {
  console.log('/login   :')
  // console.log(req.userJ)

  var   username = req.userJ.username,
        password = req.userJ.password;

  AV.User.logIn(username, password).then(function(user) {
    res.status(200).json(FILTER.user(user))
  }, function(error) {

    console.log('Error: ' + error.code + ' ' + error.message);
    res.status(400).send(error)
  });
})

router.get('/me', function(req, res, next) {
	console.log("post me")

	if(AV.User.current()){
		res.json(FILTER.user(AV.User.current()))
	}
	else{
		// res.send({code: -1, message: "user not log in"}) 
		res.status(400).send({code: -1, message: "user not log in"})
	}

});



///////////////////////////////////////////
// Update
///////////////////////////////////////////


var _checkUpdate = function(req, res,next){
    var nickname = req.body.nickname,
        backgroundImg = req.body.backgroundImg,
        profileImg = req.body.profileImg;

        console.log("!backgroundImg &&  !profileImg && !nickname")
        console.log(!backgroundImg &&  !profileImg && !nickname)

    if (!backgroundImg &&  !profileImg && !nickname) {
      res.status(400).send("input should be nickname or backgroundImg or profileImg")
    } 
    else{
        req.body = jsonAPI.removeNull({
            nickname: nickname,
            backgroundImg: backgroundImg,
            profileImg: profileImg
        })
        next()
    }
}

router.post('/me',_requiredLogin,_checkUpdate, function(req, res, next) {
  console.log("me update")

  var json= req.body

  var user =AV.User.current()

  _.each(json, function( val, key ) {
    user.set(key, val);
  });

  user.save().then(function(user) {
    console.log(user);
      res.status(200).json(FILTER.user(user))
  }, function(error) {
    console.log('Error: ' + error.code + ' ' + error.message);
      res.status(400).send(error);
  });

});


router.post('/logout',_requiredLogin, function(req, res, next) {

	if(AV.User.current()){
		AV.User.logOut();
		res.status(200).json({code: 0, message: "user log out"}) 
	}
	else{
		res.status(400).send({code: -1, message: "user not log in"}) 
	}

});

module.exports = router;
