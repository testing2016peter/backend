var express = require('express');
var router = express.Router();
var AV = require('leanengine')
var _ = require('underscore')
var requiredLogin = require('../module/requiredLogin.js')

var parseToolkit = require('../module/parseToolkit')
var jsonAPI = require('../module/jsonAPI')

/* GET users listing. */
router.get('/login', function(req, res, next) {
  res.send('respond with a resource');
});


var updateUserLocation = function (locJson, isHome){
  var deferred = Promise.defer();

  var isHomeStr = (isHome)?"homeLocation":"currentLocation"

	var Location = AV.Object.extend('Location');
	var loc = new Location();

	var str=""
	_.each(locJson, function( val, key ) {
		loc.set(key, val);
		str+=val+"/"
	});

	loc.save().then(function(loc) {
	  // 成功保存之后，执行其他逻辑.
	  console.log('New object created with objectId: ' + loc.id);

	  var user = AV.User.current()
	  user.set(isHomeStr, loc);
	  return user.save();
	}).then(function(user) {
	  
    	deferred.resolve(user)
	}, function(err) {
	  // 失败之后执行其他逻辑
    	deferred.reject(err);
	});

  return deferred.promise;
}


router.put('/me/location/current', function(req, res, next) {

	var location ={
     longtitude : req.body.longtitude,
     latitude : req.body.latitude,
     country : req.body.country,
     state : req.body.state,
     city : req.body.city,
     postcode : req.body.postcode
	}

	updateUserLocation (location, false).then(function(user){
		res.send('location:  is created by user:'+user.id);
	},function(error){
	  console.log('Failed to create new object, with error message: ' + err.message);
  		res.send(error);
	})

});


router.put('/me/location/home', function(req, res, next) {

	var location ={
     longtitude : req.body.longtitude,
     latitude : req.body.latitude,
     country : req.body.country,
     state : req.body.state,
     city : req.body.city,
     postcode : req.body.postcode
	}

	updateUserLocation (location, true).then(function(user){
		res.send('location:  is created by user:'+user.id);
	},function(error){
	  console.log('Failed to create new object, with error message: ' + err.message);
  		res.send(error);
	})

});


router.get('/signup', function(req, res, next) {
  res.render('usersignup');
});


///////////////////////////////////////////
// signup
///////////////////////////////////////////
router.use('/signup', function(req, res, next) {
    var email = req.body.email,
        password = req.body.password;

    if (!email || !password ) {
        res.status(400).send("error")
    } 
    else{
        req.userJ = jsonAPI.removeNull({
            email: email,
            username: email,
            password: password
        })
        next()
    }
});

router.post('/signup', function(req, res, next) {
    console.log("post signup")

    console.log(req.userJ)

    var user = new AV.User();

    parseToolkit.iterationSet(user, req.userJ)

    user.signUp().then(function(user) {
        console.log(user);
        res.status(200).send(user)
    }, function(error) {
        console.log('Error: ' + error.code + ' ' + error.message);
        res.status(400).send(error)
    });

});


///////////////////////////////////////////
// login
///////////////////////////////////////////

router.use('/login', function(req, res, next) {
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
});

router.post('/login', function(req, res) {
  console.log('/login   :')
  // console.log(req.userJ)

  var   username = req.userJ.username,
        password = req.userJ.password;

  AV.User.logIn(username, password).then(function(result) {
    res.status(200).send(result)
  }, function(error) {

    console.log('Error: ' + error.code + ' ' + error.message);
    res.status(400).send(error)
  });
})







router.post('/me',requiredLogin, function(req, res, next) {
	console.log("post update")

	var json= req.body


	var user =AV.User.current()
	_.each(json, function( val, key ) {
		user.set(key, val);
	});

	user.save().then(function(user) {
	  console.log(user);
  	  res.send(user);
	}, function(error) {
	  console.log('Error: ' + error.code + ' ' + error.message);
  	  res.send(error);
	});

});

router.post('/login', function(req, res, next) {
	console.log("post login")

    var username = req.body.username;
    var password = req.body.password;

	AV.User.logIn(username,password).then(function(user) {
	  console.log(user);
  	  res.send(user);
	}, function(error) {
	  console.log(error);
  	  res.send(error);
	});

});


router.get('/me', function(req, res, next) {
	console.log("post me")

	if(AV.User.current()){
		res.send(AV.User.current()) 
	}
	else{
		// res.send({code: -1, message: "user not log in"}) 
		res.status(400).send({code: -1, message: "user not log in"})
	}

});

router.post('/logout', function(req, res, next) {
	console.log("post me")

	if(AV.User.current()){
		AV.User.logOut();
		res.send({code: 0, message: "user log out"}) 
	}
	else{
		res.send({code: -1, message: "user not log in"}) 
	}

});

module.exports = router;
