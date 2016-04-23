var apns = require('apn');
var options = {
   cert: './cert/cert.pem',                 /* Certificate file path */
   key:  './cert/key.pem',                  /* Key file path */
   gateway: 'gateway.sandbox.push.apple.com',/* gateway address */
   port: 2195,                       /* gateway port */
   errorCallback: errorHappened ,    /* Callback when error occurs function(err,notification) */
};
function errorHappened(err, notification){
   console.log("err " + err);
}
var apnsConnection = new apns.Connection(options);

var token = "c78b13de4a587933a949088881931899ae680568212034cda14a685ffd19cfd9";
var myDevice = new apns.Device(token);
var note = new apns.Notification();
note.expiry = Math.floor(Date.now() / 1000) + 1; // Expires 1 hour from now.
note.badge = 1;
console.log(note);
//note.sound = "ping.aiff";

note.alert = "You have a new message";
note.payload = {'messageFrom': 'Caroline'};
note.device = myDevice;

apnsConnection.sendNotification(note);
