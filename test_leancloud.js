var AV = require('leanengine')

AV.initialize("Wqia15HnxcIAXH1Lk06m2n3Q-gzGzoHsz", "hwd81deBLAQDk1a3G4jTUKjY");





var promiseCreate = function () {
  return new Promise(function (resolve, reject) {

			var Post = AV.Object.extend('Post');
			var post = new Post();

			var start = new Date().getTime();

			post.set("text", "asdasdasasd")
			post.save().then(function(loc) {

			    var end = new Date().getTime();
			    var time = end - start;

			    console.log(time / 1000 + 's      - New object created with objectId: ' + loc.id);
			    resolve(loc.id)

			}, function(err) {
			    console.log(err)
			    reject(err)
			});

  })
}


var start = new Date().getTime();
var main  = function (num) {
  var promises = []

  var cnt

  for (cnt = 0; cnt < num; cnt++) {
    promises.push(promiseCreate())
  }

  Promise.all(promises).then(function () {

    var end = new Date().getTime();
    var time = end - start;

    console.log('done at time: ', (time)/1000)
  }, function (err) {
    console.log('err: ', err)
  })

}

main(100)

