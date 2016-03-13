var express = require('express');
var router = express.Router();
var AV = require('leanengine')
var _ = require('underscore')

//istaging home
AV.initialize("Wqia15HnxcIAXH1Lk06m2n3Q-gzGzoHsz", "hwd81deBLAQDk1a3G4jTUKjY");

/* GET users listing. */
router.get('/login', function(req, res, next) {
  res.send('respond with a resource');
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
	user.set('longitude', longitude);
	user.set('latitude', latitude);


	user.signUp().then(function(user) {
	  console.log(user);
  	  res.send(user);
	}, function(error) {
	  // 失败了
	  console.log('Error: ' + error.code + ' ' + error.message);
	
  	  res.send(error);
	});

});


router.post('/me/update', function(req, res, next) {
	console.log("post update")

	var json= {
		username : "aa",
		desc : "desc"
	}


	if(AV.User.current()){
		var user =AV.User.current()
		_.each(json, function( val, key ) {
			user.set(key, val);
		});
	}
	else{
		// res.send({code: -1, message: "user not log in"}) 
		res.status(400).send({code: -1, message: "user not log in"})
	}

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



router.post('/me', function(req, res, next) {
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
