

var API = function() {};


API.post = function(post) {
      return {
        objectId: post.id,
        text: post.get("text"),
        like1_count: post.get("like1_count"),
        like2_count: post.get("like2_count")
      }
}


module.exports = API