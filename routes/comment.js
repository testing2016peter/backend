var express = require('express');
var router = express.Router();
var AV = require('leanengine')
var _ = require('underscore')
var _requiredLogin = require('../module/requiredLogin.js')


var parseToolkit = require('../module/parseToolkit')
var jsonAPI = require('../module/jsonAPI')
var FILTER = require('../module/FILTER')

var Post = AV.Object.extend('Post');
var Comment = AV.Object.extend('Comment');



///////////////////////////////////////////
// POST /
// DELETE /:comment
// PUT /:comment
///////////////////////////////////////////



router.post('/',_requiredLogin, function(req, res, next) {

    var text = req.body.text
    var postId = req.body.postId
    var post

    if(!text || !postId) 
        res.status(400).send(" text or postId empty error")

    var query = new AV.Query(Post);

    query.notEqualTo('isDelete', true);
    query.get(postId).then(function(pObj) {

        if(!pObj){
            res.status(400).send(" incorrect postId and not found ")
        }
        else{
        	post = pObj
    		var comment = new Comment();
            comment.set("author", AV.User.current())
    		comment.set("text", text)

            return comment.save()
        }
    }).then(function(cObj){


        var comment_count = post.get("comment_count")
        var relation = post.relation("comment");

        relation.add(cObj);
        post.set("comment_count",comment_count+1)

        return post.save()
    }).then(function(pObj2){
        res.status(200).json(FILTER.post(pObj2))
    }, function(error) {
        res.status(400).send(error)
    });
});




router.put('/:commentId',_requiredLogin, function(req, res, next) {

    var text = req.body.text

    if(!text) 
        res.status(400).send(" text empty error")

    var commentId = req.params.commentId
    var query = new AV.Query(Comment);

    query.notEqualTo('isDelete', true);
    query.get(commentId).then(function(comment) {

        if(!comment){
            res.status(400).send(" incorrect commentId and not found ")
        }
        else{
            comment.set("text", text)
            return comment.save()
        }
    }).then(function(comment2){
        res.status(200).json(FILTER.cmoment(comment2))
    }, function(error) {
        res.status(400).send(error)
    });
});









///////////////////////////////////////////
// /comment
///////////////////////////////////////////
router.use('/post/:postId/comment', function(req, res, next) {
    var text = req.body.text
    var postId = req.params.postId

    if (!text) {
        res.status(400).send(" text empty error")
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
// router.use('/posts/:postId/like', function(req, res, next) {
//     var text = req.body.text
//     var postId = req.params.postId

//     if (!text) {
//         res.status(400).send("error")
//     } 
//     else{
//         req.mJson = jsonAPI.removeNull({
//             text: text,
//             postId: postId
//         })
//         next()
//     }
// // });

// router.post('/posts/:postId/like', function(req, res, next) {
//     console.log('/post/:postId/like')

//     var query = new AV.Query(Post);
// 	query.get(req.mJson.postId).then(function(post) {

// 		// var relation = post.relation('likes');
// 		// relation.add(AV.User.current())

// 		var likes = []
// 		likes.push(AV.User.current())

// 		console.log(likes)
// 		post.set("likes", likes)

// 		return post.save()
// 	}).then(function(l){
//         res.status(200).json(l)
// 	}, function(error) {
//         res.status(400).send(error)
// 	});

// });



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