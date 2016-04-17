var express = require('express');
var router = express.Router();
var AV = require('leanengine')
var _ = require('underscore')

var parseToolkit = require('../module/parseToolkit')
var jsonAPI = require('../module/jsonAPI')

var Post = AV.Object.extend('Post');
var Comment = AV.Object.extend('Comment');





///////////////////////////////////////////
// GET/post
///////////////////////////////////////////

router.get('/post/:postId', function(req, res, next) {

    var postId = req.params.postId
    var query = new AV.Query(Post);

	query.include('_User');
	query.get(postId).then(function(post) {
		post=post.toJSON()

		console.log(post.likes)
        res.status(200).json(post)
	}, function(error) {
        res.status(400).send(error)
	});
});


///////////////////////////////////////////
// /post
///////////////////////////////////////////
router.use('/post', function(req, res, next) {
    var text = req.body.text

    if (!text) {
        res.status(400).send("error")
    } 
    else{
        req.pJson = jsonAPI.removeNull({
            text: text,
            user: AV.User.current()
        })
        next()
    }
});

router.post('/post', function(req, res, next) {
	var start = new Date().getTime();

    var post = new Post();

    parseToolkit.iterationSet(post, req.pJson)

    post.save().then(function(loc) {

		var end = new Date().getTime();
		var time = end - start;

        console.log(time/1000 + 's      - New object created with objectId: ' + loc.id);
        res.status(200).send(loc)

    }, function(err) {
        res.status(400).send(err)
    });
});


///////////////////////////////////////////
// /comment
///////////////////////////////////////////
router.use('/post/:postId/comment', function(req, res, next) {
    var text = req.body.text
    var postId = req.params.postId

    if (!text) {
        res.status(400).send("error")
    } 
    else{
        req.mJson = jsonAPI.removeNull({
            text: text,
            postId: postId
        })
        next()
    }
});

router.post('/post/:postId/comment', function(req, res, next) {

    var comment = new Comment();

    var query = new AV.Query(Post);
	query.get(req.mJson.postId).then(function(post) {
		comment.set("text" , req.mJson.text)
		comment.set("post" , post)
		comment.set("user" , AV.User.current())
		return comment.save()
	}).then(function(com){
        res.status(200).json(com)
	}, function(error) {
        res.status(400).send(error)
	});

});


///////////////////////////////////////////
// /post/like
///////////////////////////////////////////
router.use('/post/:postId/like', function(req, res, next) {
    var text = req.body.text
    var postId = req.params.postId

    if (!text) {
        res.status(400).send("error")
    } 
    else{
        req.mJson = jsonAPI.removeNull({
            text: text,
            postId: postId
        })
        next()
    }
});

router.post('/post/:postId/like', function(req, res, next) {

    var query = new AV.Query(Post);
	query.get(req.mJson.postId).then(function(post) {

		// var relation = post.relation('likes');
		// relation.add(AV.User.current())

		var likes = []
		likes.push(AV.User.current())

		post.set("likes", likes)

		return post.save()
	}).then(function(l){
        res.status(200).json(l)
	}, function(error) {
        res.status(400).send(error)
	});

});



///////////////////////////////////////////
// GET/comment
///////////////////////////////////////////

router.get('/comment/:commentId', function(req, res, next) {

    var commentId = req.params.commentId
    var query = new AV.Query(Comment);

	query.include('Post');
	query.get(commentId).then(function(comment) {
		console.log('comment.get("post")')
		console.log(comment.get("post"))
		console.log('comment.get("post").get("text")')
		console.log(comment.get("post").get("text"))
		console.log('comment.get("post").toJSON()')
		console.log(comment.get("post").toJSON())

		var post = {
			objectId : comment.get("post").objectId,
			text : comment.get("post").get('text')

		}
		var returnJson = {
			text : comment.get("text"),
			objectId : comment.get("objectId"),
			post : post
		}

        res.status(200).json(returnJson)
	}, function(error) {
        res.status(400).send(error)
	});
});

///////////////////////////////////////////
// /comment/like
///////////////////////////////////////////
router.use('/comment/:commentId/like', function(req, res, next) {
    var text = req.body.text
    var commentId = req.params.commentId

    if (!text) {
        res.status(400).send("error")
    } 
    else{
        req.mJson = jsonAPI.removeNull({
            text: text,
            commentId: commentId
        })
        next()
    }
});

router.post('/comment/:commentId/like', function(req, res, next) {

    var query = new AV.Query(Comment);
	query.get(req.mJson.commentId).then(function(comment) {

		var relation = comment.relation('likes');
		relation.add(AV.User.current())
		return comment.save()
	}).then(function(l){
        res.status(200).json(l)
	}, function(error) {
        res.status(400).send(error)
	});

});

module.exports = router;
