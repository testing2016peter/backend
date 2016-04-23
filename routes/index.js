var express = require('express');
var router = express.Router();

var PUSH = require('../module/PushNoticfication')

/* GET home page. */
router.get('/', function(req, res, next) {
	var p = new PUSH("c78b13de4a587933a949088881931899ae680568212034cda14a685ffd19cfd9")


		p.send("hello 2: "+1).then(function(){
			return p.send("hello 2: "+2)
		}).then(function(){
			console.log("sent 2 msg")
		},function(err){
			console.log(err)
		})

  res.render('index', { title: 'Express' });
});

module.exports = router;
