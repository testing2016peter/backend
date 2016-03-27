var express = require('express');
var router = express.Router();
var AV = require('leanengine')
var _ = require('underscore')
var requiredLogin = require('../module/requiredLogin.js')

var AWS = require('aws-sdk');


AWS.config.update({
    accessKeyId: "AKIAIN2KDGDYOCHHYDXA",
    secretAccessKey: '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',
    "region": "sa-east-1" 
});

// AWS_ACCESS_KEY_ID='AKIAIN2KDGDYOCHHYDXA'
// AWS_SECRET_ACCESS_KEY='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'

// var params = {Key: 'AKIAIN2KDGDYOCHHYDXA', Body: 'Hello!'};

// var s3bucket = new AWS.S3({params: {Bucket: 'myBucket'}});
// s3bucket.createBucket(function() {
//   s3bucket.upload(params, function(err, data) {
//     if (err) {
//       console.log("Error uploading data: ", err);
//     } else {
//       console.log("Successfully uploaded data to myBucket/myKey");
//     }
//   });
// });

// var bucketName = "elasticbeanstalk-ap-southeast-1-510734621033"
var bucketName = "newBucket"

// var s3 = new AWS.S3({params: {Bucket: bucketName, Key: 'myKey'}});
// s3.createBucket(function(err) {
//   if (err) { console.log("Error:", err); }
//   else {
//     s3.upload({Body: 'Hello!'}, function() {
//       console.log("Successfully uploaded data to myBucket/myKey");
//     });
//   }
// });

var s3 = new AWS.S3();

s3.listBuckets(function(err, data) {
  if (err) { console.log("Error:", err); }
  else {
    for (var index in data.Buckets) {
      var bucket = data.Buckets[index];
      console.log("Bucket: ", bucket.Name, ' : ', bucket.CreationDate);
    }
  }
});

/* GET users listing. */
router.get('/upload', function(req, res, next) {
  res.send('respond with a resource');
});


module.exports = router;
