var apns = require('apn');


function pushAPI(tokent) {

    var options = {
        cert: './cert/cert.pem',
        /* Certificate file path */
        key: './cert/key.pem',
        /* Key file path */
        gateway: 'gateway.sandbox.push.apple.com',
        /* gateway address */
        port: 2195,
        /* gateway port */
        errorCallback: errorHappened,
        /* Callback when error occurs function(err,notification) */
    };

    function errorHappened(err, notification) {
        console.log("err " + err);
    }
    var apnsConnection = new apns.Connection(options);

	var token = tokent;
	var myDevice = new apns.Device(token);
	var note = new apns.Notification();
	note.expiry = Math.floor(Date.now() / 1000) + 1; // Expires 1 hour from now.
	note.badge = 1;
	console.log(note);
	//note.sound = "ping.aiff";

    function send(msg) {

	  return new Promise(function (resolve, reject) {
		note.alert = msg;
		note.payload = {
		    'messageFrom': 'Caroline'
		};
		note.device = myDevice;
		apnsConnection.sendNotification(note);

		apnsConnection.on('transmitted', function(){
		    console.log("Send msg: "+msg)
		    resolve()
		})

		apnsConnection.on('error', function(){
		    console.log("Error")
		    reject("Send msg fail ")
		})

	  })

	}

    return {
        send: send,
    }
}

module.exports = pushAPI