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
// GET /
// POST /
// GET /:postId
// DELETE /:postId
// PUT /:postId
///////////////////////////////////////////




///////////////////////////////////////////
// GET/posts
///////////////////////////////////////////

var _checkOffsetLimit = function(req, res, next) {

    var offset = req.query.offset,
        limit = req.query.limit,
        sortby = req.query.sortby

    var sortbyType = ["createdAt","text"]

        // query.addAscending('createdAt');
        // query.addDescending('pubTimestamp');

    if (sortby) {
        if (_.indexOf(sortbyType, sortby) == -1){
            sortby = null
        }
    }


    if (!offset || !limit ) {
		req.OJson = jsonAPI.removeNull({
			offset : 0,
			limit : 100,
            sortby : sortby
		})
        next()
    } 
    else{
		req.OJson = jsonAPI.removeNull({
			offset : offset,
			limit : limit,
            sortby : sortby
		})
        next()
    }
}

var _queryPost = function(req) {

    return new Promise(function(resolve, reject) {

        var query = new AV.Query(Post);

        var offset = req.OJson.offset
        var limit = req.OJson.limit
        var count

        query.notEqualTo('isDelete', true);
        query.skip(offset);
        query.limit(limit);
        query.include('author');
        query.exists('objectId');
        query.addAscending('createdAt');

        query.count().then(function(num) {
            count = num
            return query.find()
        }).then(function(posts) {

            var returnJ = {
                total: count
            }

            var postArr = []
            _.each(posts, function(post) {

                postArr.push(FILTER.postAndAuthor(post))
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

        var queryUser = new AV.Query(AV.User);

        queryUser.get(req.query.userId).then(function(user) {

            query.notEqualTo('isDelete', true);
            query.skip(offset);
            query.limit(limit);
            query.include('author');
            query.addAscending('createdAt');

            query.equalTo("author", user);
            return query.find()

        }).then(function(posts) {

            var returnJ = {
                total: posts.length
            }


            var postst = []
            _.each(posts, function(post) {
                
                postst.push(FILTER.postAndAuthor(post))
            })

            returnJ.posts = postst
            resolve(returnJ)

        }, function(error) {
            reject(error)
        });
    })

}

router.get('/', _checkOffsetLimit,function(req, res, next) {

    var userId = req.query.userId 

    if(userId ){    
        console.log("  if userId")

        _queryUsersPost(req).then(function(result){
            res.status(200).json(result)
        },function(error){
            res.status(400).send(error)
        })
    }
    else{
        console.log("  else ")
        _queryPost(req).then(function(result){
            res.status(200).json(result)
        },function(error){
            res.status(400).send(error)
        })
    }

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
// GET PUT DELETE/:postId
///////////////////////////////////////////

var initCommentQuery = function(relationt){
    var query = relationt.query();
    query.include('author');
    query.notEqualTo('isDelete', true);
    query.limit(1000);

    return query
}

var initLikeQuery = function(relationt){
    var query = relationt.query();
    query.limit(1000);

    return query
}

router.get('/:postId', function(req, res, next) {

    var postId = req.params.postId
    var query = new AV.Query(Post);
    var returnPost
    var postTemp,commentsTemp, like1sTemp,like2sTemp

	query.include('author');
    query.notEqualTo('isDelete', true);
	query.get(postId).then(function(post) {

        postTemp = post

        var queryComment = initCommentQuery(post.relation("comment"))
        var queryLike1 = initLikeQuery(post.relation("like1"))
        var queryLike2 = initLikeQuery(post.relation("like2"))

        return AV.Promise.all([
            queryComment.find(), 
            queryLike2.find(),
            queryLike1.find()
        ])

    }).then(function(results){

        commentsTemp = results[0]
        like1sTemp = results[1]
        like2sTemp = results[2]

        returnPost = FILTER.post(postTemp)
        returnPost.author = FILTER.user(postTemp.get("author"))
        returnPost.comments = []
        returnPost.like1s = []
        returnPost.like2s = []


        _.each(commentsTemp, function(commentObj) {
            returnPost.comments.push(FILTER.comment(commentObj))
        })

        _.each(like1sTemp, function(like1Obj) {
            returnPost.like1s.push(FILTER.user(like1Obj))
        })

        _.each(like2sTemp, function(like2Obj) {
            returnPost.like2s.push(FILTER.user(like2Obj))
        })

        res.status(200).json(returnPost)
	}, function(error) {
        res.status(400).send(error)
	});
});

router.put('/:postId',_requiredLogin, function(req, res, next) {

    var text = req.body.text

    if(!text) 
        res.status(400).send(" text empty error")

    var postId = req.params.postId
    var query = new AV.Query(Post);

    query.notEqualTo('isDelete', true);
    query.get(postId).then(function(post) {

        if(!post){
            res.status(400).send(" incorrect postId and not found ")
        }
        else{
            post.set("text", text)
            return post.save()
        }
    }).then(function(post2){
        res.status(200).json(FILTER.post(post2))
    }, function(error) {
        res.status(400).send(error)
    });
});

router.delete('/:postId',_requiredLogin, function(req, res, next) {


    var postId = req.params.postId
    var query = new AV.Query(Post);

    query.get(postId).then(function(post) {

        if(!post){
            res.status(400).send(" incorrect postId and not found ")
        }
        else{
            post.set("isDelete", true)
            return post.save()
        }
    }).then(function(post2){
        res.status(200).json(FILTER.post(post2))
    }, function(error) {
        res.status(400).send(error)
    });
});



module.exports = router;
