var express = require('express');
var router = express.Router();
var AV = require('leanengine')
var _ = require('underscore')

var parseToolkit = require('../module/parseToolkit')
var jsonAPI = require('../module/jsonAPI')
var FILTER = require('../module/FILTER')

var Post = AV.Object.extend('Post');
var Comment = AV.Object.extend('Comment');
var Like1 = AV.Object.extend('Like1');
var Like2 = AV.Object.extend('Like2');
var requiredLogin = require('../module/requiredLogin.js')

var likeFunction = function(postId,likeType) {
	var likeType = likeType
	var likeCountStr = likeType+"_count"


    return new Promise(function(resolve, reject) {
        var query = new AV.Query(Post);
        query.get(postId).then(function(p) {
            console.log("  ------- 1")
            console.log("AV.User.current().id")
            console.log(AV.User.current().id)
            post = p

            var QueryIsUserLiked = post.relation(likeType).query()
            return QueryIsUserLiked.equalTo("objectId", AV.User.current().id).find()
        }).then(function(listUser) {
            console.log("  ------- 2")

            if (listUser.length >= 1) {
                reject("user liked this post")
            } else {
                var like_count = post.get(likeCountStr)
                var relation = post.relation(likeType);

                relation.add(AV.User.current());
                post.set(likeCountStr, like_count + 1)


                return post.save()
            }

        }).then(function(post) {
            console.log("  ------- 3")
            resolve(post)
        }, function(error) {
        	reject(error)
        })

    })
}

var like1Function = function(postId){
	return likeFunction(postId, "like1")
}

var like2Function = function(postId){
	return likeFunction(postId, "like2")
}


var disklikefunction = function(postId, likeType){

	var likeType = likeType
	var likeCountStr = likeType+"_count"

    return new Promise(function(resolve, reject) {
	    var query = new AV.Query(Post);

	    query.get(postId).then(function(p) {

	    	console.log("   ------ 1")

	    	var like_count = p.get(likeCountStr)

	    	p.relation(likeType).remove(AV.User.current());
	    	p.set(likeCountStr,like_count)

	    	return p.save()
	    }).then(function(p2){
	    	console.log("   ------ 2")
	    	resolve(p2)
        }, function(error) {
        	reject(error)
        })
    })
}


var disklike1function = function(postId){
	return disklikefunction(postId, "like1" )
}
var disklike2function = function(postId){
	return disklikefunction(postId, "like2" )
}

router.delete('/posts/:postId/like1',requiredLogin, function(req, res, next) {

    console.log('delete /post/:postId/like1: '+req.params.postId)

    var postId = req.params.postId

    disklike1function(postId).then(function(post){
    	res.status(200).json(FILTER.post(post))
	}, function(error) {
		console.log(error)
        res.status(400).send(error)
	});

});

router.delete('/posts/:postId/like2',requiredLogin, function(req, res, next) {

    console.log('delete /post/:postId/like2: '+req.params.postId)

    var postId = req.params.postId

    disklike1function(postId).then(function(post){
    	res.status(200).json(FILTER.post(post))
	}, function(error) {
		console.log(error)
        res.status(400).send(error)
	});

});

router.post('/posts/:postId/like1',requiredLogin, function(req, res, next) {

    console.log('/post/:postId/like1: '+req.params.postId)

    var postId = req.params.postId
    var post

    like1Function(postId).then(function(post){
    	res.status(200).json(FILTER.post(post))
	}, function(error) {
		console.log(error)
        res.status(400).send(error)
	});

});

router.post('/posts/:postId/like2',requiredLogin, function(req, res, next) {

    console.log('/post/:postId/like2: '+req.params.postId)

    var postId = req.params.postId
    var post

    like2Function(postId).then(function(post){
    	res.status(200).json(FILTER.post(post))
	}, function(error) {
		console.log(error)
        res.status(400).send(error)
	});

});



module.exports = router;
