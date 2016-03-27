var AV = require('leanengine')

module.exports = function(req, res, next) {

  if (AV.User.current()) {
    next();
  } else {
	res.status(403).send("You need to be logged in to see this page.");
  }

}