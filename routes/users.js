var express = require('express');
var router = express.Router();
var AV = require('leanengine')
var _ = require('underscore')
var requiredLogin = require('../module/requiredLogin.js')


//istaging home
AV.initialize("Wqia15HnxcIAXH1Lk06m2n3Q-gzGzoHsz", "hwd81deBLAQDk1a3G4jTUKjY");

/* GET users listing. */
router.get('/login', function(req, res, next) {
  res.send('respond with a resource');
});


router.post('/location', function(req, res, next) {

	var location ={
     longtitude : req.body.longtitude,
     latitude : req.body.latitude,
     country : req.body.country,
     state : req.body.state,
     city : req.body.city,
     postcode : req.body.postcode
	}

	var Location = AV.Object.extend('Location');
	var loc = new Location();

	console.log("req.body")
	console.log(req.body)

	var str=""
	_.each(location, function( val, key ) {
		loc.set(key, val);
		str+=val+"/"
	});

	loc.save().then(function(loc) {
	  // 成功保存之后，执行其他逻辑.
	  console.log('New object created with objectId: ' + loc.id);

	  var user = AV.User.current()
	  user.set('Location', loc);
	  return user.save();
	}).then(function(user) {

		res.send('location: '+str+" is created by user:"+user.id);
	  
	}, function(err) {
	  // 失败之后执行其他逻辑
	  // error 是 AV.Error 的实例，包含有错误码和描述信息.
	  console.log('Failed to create new object, with error message: ' + err.message);
	});


});


router.get('/signup', function(req, res, next) {
  res.render('usersignup');
});

router.post('/signup', function(req, res, next) {
	console.log("post signup")

    var username = req.body.username;
    var password = req.body.password;
    var desc = req.body.desc;

	var user = new AV.User();
	user.set('username', username);
	user.set('password', password);
	user.set('desc', desc);
	user.set('gender', gender);
	user.set('backgroundUrl', backgroundUrl);
	// user.set('longitude', longitude);
	// user.set('latitude', latitude);


	user.signUp().then(function(user) {
	  console.log(user);
  	  res.send(user);
	}, function(error) {
	  // 失败了
	  console.log('Error: ' + error.code + ' ' + error.message);
	
  	  res.send(error);
	});

});


router.post('/me',requiredLogin, function(req, res, next) {
	console.log("post update")

	var json= req.body


	if(AV.User.current()){
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
	}
	else{
		// res.send({code: -1, message: "user not log in"}) 
		res.status(400).send({code: -1, message: "user not log in"})
	}

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
