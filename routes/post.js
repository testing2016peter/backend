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
// GET/posts
///////////////////////////////////////////



var _checkOffsetLimit = function(req, res, next) {

    var offset = req.query.offset,
        limit = req.query.limit;

    if (!offset || !limit ) {
		req.OJson = {
			offset : 0,
			limit : 100
		}
        next()
    } 
    else{
		req.OJson = {
			offset : offset,
			limit : limit
		}
        next()
    }
}

var _queryPost = function(req) {

    return new Promise(function(resolve, reject) {

        var query = new AV.Query(Post);

        var offset = req.OJson.offset
        var limit = req.OJson.limit
        var count

        query.skip(offset);
        query.limit(limit);
        query.include('_User');
        query.exists('objectId');

        query.count().then(function(num) {
            count = num
            return query.find()
        }).then(function(posts) {

            var returnJ = {
                total: count
            }

            var postArr = []
            _.each(posts, function(post) {

                postArr.push(FILTER.post(post))
            })

            returnJ.posts = postArr
            resolve(returnJ)
        }, function(error) {
            reject(error)
        });
    })
}

var _queryUsersPost = function(req) {

    return new Promise(function(resolve, reject) {
        var Post = AV.Object.extend('Post');
        var query = new AV.Query(Post);

        var offset = req.OJson.offset
        var limit = req.OJson.limit

        query.skip(offset);
        query.limit(limit);

        query.equalTo("author", req.query.userId);

        query.find().then(function(posts) {

            var postst = []
            _.each(posts, function(post) {
                postst.push(FILTER.post(post))
            })

            resolve(postst)

        }, function(error) {
            reject(error)
        });
    })

}

router.get('/', _checkOffsetLimit,function(req, res, next) {

    req.query.userId = "571336861ea493006b8cef45"

    _queryUsersPost(req).then(function(result){

    // _queryPost(req).then(function(result){

        res.status(200).json(result)
    },function(error){
        res.status(400).send(error)
    })
});


///////////////////////////////////////////
// GET/post
///////////////////////////////////////////

router.get('/:postId', function(req, res, next) {

    var postId = req.params.postId
    var query = new AV.Query(Post);

	query.include('_User');
	query.get(postId).then(function(post) {

        res.status(200).json(FILTER.post(post))
	}, function(error) {
        res.status(400).send(error)
	});
});


///////////////////////////////////////////
// /post
///////////////////////////////////////////
var _checkPostPosts = function(req, res, next) {
    var text = req.body.text

    if (!text) {
        res.status(400).send("error")
    } 
    else{
        req.pJson = jsonAPI.removeNull({
            text: text,
            author: AV.User.current()
        })
        next()
    }
}

router.post('/',_requiredLogin,_checkPostPosts, function(req, res, next) {
	var start = new Date().getTime();

    var post = new Post();

    parseToolkit.iterationSet(post, req.pJson)

    post.save().then(function(post) {

		var end = new Date().getTime();
		var time = end - start;

        console.log(time/1000 + 's      - New object created with objectId: ' + post.id);
        res.status(200).json(FILTER.post(post))

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
