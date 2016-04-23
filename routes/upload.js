var express = require('express');
var formidable = require('formidable')
var form = new formidable.IncomingForm()

var router = express.Router();

var Flickr = require("flickrapi"),
    flickrOptions = {
        api_key: "6b66bfb0e4d7e851dfb59cc92dfe5865",
        secret: "7448c55b99c17e17",
        permissions: "delete",
        //FLICKR_USER_ID="12345678%40N12"
        nobrowser: true,
        user_id: "140468363@N04",
        access_token: "72157667322078282-e9a21d3484f192dc",
        access_token_secret: "bdedce2c6d128edb"
    };

var getInfoOptions = {
    api_key: "6b66bfb0e4d7e851dfb59cc92dfe5865"
};

/* GET home page. */
router.post('/', function(req, res, next) {

    console.log("upload")

    var json = {}

    form.parse(req, function(err, fields, files) {
        // json = JSON.parse(fields.fields)
        console.log("parse . ...")
    })

    form.on('file', function(fields, files) {

        var fileName = files.name
        var fileLocalPath = files.path


		Flickr.authenticate(flickrOptions, function(error, flickr) {
		    var uploadOptions = {
		        photos: [{
		            title: "test",
		            tags: [
		                "happy fox",
		                "test 1"
		            ],
		            // photo: __dirname + "/fb523fab-7848-4286-9eae-d264847c7a34.jpg"
		            photo: fileLocalPath
		        }]
		    };


		    Flickr.upload(uploadOptions, flickrOptions, function(err, result) {
		        if (err) {
		            return console.error(error);
		        }
		        console.log("photos uploaded", result);
		        for (var i in result) {
		            var photoId = result[i];
		            getInfoOptions["photo_id"] = photoId;
		            getInfoOptions["user_id"] = "140468363@N04";
		            getInfoOptions["api_key"] = "6b66bfb0e4d7e851dfb59cc92dfe5865";
		            console.log(getInfoOptions);
		            flickr.photos.getInfo(getInfoOptions, function(err, result) {
		                if (!err) {
		                    //https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg
		                    //https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
		                    var imageUrlfarmId = result.photo.farm;
		                    var imageUrlServerId = result.photo.server;
		                    var imageUrlPhotoId = result.photo.id;
		                    var imageUrlSecretId = result.photo.secret;
		                    var originalFormat = result.photo.originalformat;

		                    var imageUrl = "https://farm" + imageUrlfarmId + ".staticflickr.com/" + imageUrlServerId + "/" + imageUrlPhotoId + "_" + imageUrlSecretId + "." + originalFormat;
		                    // console.log(imageUrl);
		                    res.status(200).json(imageUrl)
		                }

		            });
		        }

		    });


		});
    })

});
module.exports = router;
