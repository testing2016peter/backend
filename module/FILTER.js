

var API = function() {};


API.post = function(post) {
      return {
        objectId: post.id,
        text: post.get("text"),
        like1_count: post.get("like1_count"),
        like2_count: post.get("like2_count"),
        comment_count: post.get("comment_count"),
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: post.get("author").id
      }
}

API.comment = function(comment) {
      return {
        objectId: comment.id,
        text: comment.get("text"),
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: API.user(comment.get("author"))
      }
}

API.postAndAuthor = function(post) {

      var pt = API.post(post)
      pt.author = API.user(post.get("author"))

      return pt
}

API.user = function(user) {
      return {
        objectId: user.id,
        nickname: user.get("nickname"),
        email: user.get("email"),
        backgroundImg: user.get("backgroundImg"),
        profileImg: user.get("profileImg"),
        createdAt: user.get("createdAt"),
        updatedAt: user.get("updatedAt"),
      }
}

module.exports = API