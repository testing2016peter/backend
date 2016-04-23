var express = require('express');
var router = express.Router();

var PUSH = require('../module/PushNoticfication')

/* GET home page. */
router.post('/', function(req, res, next) {
	var token = req.body.device_token
	var msg = req.body.msg

	// var p = new PUSH("c78b13de4a587933a949088881931899ae680568212034cda14a685ffd19cfd9")
	var p = new PUSH(token)


		p.send(msg).then(function(){
			res.status(200).send("iOS Push Noticfication ")
		},function(err){
			console.log(err)
			res.status(400).send("fail iOS Push Noticfication ")
		})

  // res.render('index', { title: 'Express' });
});

module.exports = router;
