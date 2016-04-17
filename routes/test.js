var express = require('express');
var router = express.Router();
var AV = require('leanengine')
var _ = require('underscore')
var utils = require('../module/utils')


var genUserJson = function(){
	return {
	    username : utils.randomStr(20),
	    password :  "1234",
	    desc :  utils.randomStr(20),
	    gender :  utils.randomInt(0,1),
	    nickname :  utils.randomStr(20),
	    backgroundUrl :  utils.randomStr(20)
	}

}

var signup = function(json){
	console.log("/signup :"+ json)


    return new Promise(function(resolve, reject) {
			var user = new AV.User();

			_.each(json, function( val, key ) {
				user.set(key, val);
			});

			user.signUp().then(function(user) {
			  console.log("user: "+user.id);
			  resolve(user)
			}, function(error) {
			  // 失败了
			  console.log('Error: ' + error.code + ' ' + error.message);
			
         	   reject(error);
			});

	})
}

var parallelPro = function(proArr){
	console.log("/parallelPro :"+ proArr.length)


    return new Promise(function(resolve, reject) {

			Promise.all([
				proArr
			]).then(function(result){

				console.log(proArr.length+" user has been created.")
		  		resolve(result);

			},function(err){
				reject(err)
			})

	})
}

var genPromiseArr = function (MAX){
	var proArr = []

	_.times(MAX, function(i){
		console.log("i: "+i)
		proArr.push(signup(genUserJson()))
	});

	return proArr
}


router.get('/1000_user', function(req, res, next) {
	console.log("/1000_user")

	var MAX = 5000

	// console.log("proArr.length: " + proArr.length)

	parallelPro(genPromiseArr(MAX)).then(function(result){

		console.log(MAX+"user has been created.")

	// 	return parallelPro(proArr)

	// }).then(function(result2){

  		res.send(result);

	},function(err){
	    // Receives first rejection among the Promises
	    console.log("err")
	    console.log(err)
		renderF(res, err, start)
	})

});


module.exports = router;
