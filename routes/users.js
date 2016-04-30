var express = require('express');
var router = express.Router();
var AV = require('leanengine')
var _ = require('underscore')
var requiredLogin = require('../module/requiredLogin.js')
var FILTER = require('../module/FILTER.js')

var parseToolkit = require('../module/parseToolkit')
var jsonAPI = require('../module/jsonAPI')

///////////////////////////////////////////
// signup
///////////////////////////////////////////
router.use('/signup', function(req, res, next) {
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
///////////////////////////////////////////
// GET/posts
///////////////////////////////////////////

router.use('/me/posts', function(req, res, next) {

    var offset = req.query.offset,
        limit = req.query.limit;

    if (!offset || !limit ) {
    req.OJson = {
      offset : 0,
      limit : 100
    }
        next()
    } 
    else{
    req.OJson = {
      offset : offset,
      limit : limit
    }
        next()
    }
})

router.get('/me/posts', function(req, res, next) {
  console.log("/me/post")

  if(AV.User.current()){
    var Post = AV.Object.extend('Post');
    var query = new AV.Query(Post);

    var offset = req.OJson.offset
    var limit = req.OJson.limit

    query.skip(offset);
    query.limit(limit);

    query.equalTo("author", AV.User.current());

    query.find().then(function(posts) {

      var postst = []
      _.each(posts,function(post){
        postst.push(FILTER.post(post))
      })

      res.status(200).json(postst)

    }, function(error) {
          res.status(400).send(error)
    });
  }
  else{
    // res.send({code: -1, message: "user not log in"}) 
    res.status(400).send({code: -1, message: "user not log in"})
  }

});


router.post('/logout', function(req, res, next) {

	if(AV.User.current()){
		AV.User.logOut();
		res.send({code: 0, message: "user log out"}) 
	}
	else{
		res.send({code: -1, message: "user not log in"}) 
	}

});

module.exports = router;
