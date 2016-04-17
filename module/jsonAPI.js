var _ = require('underscore')


var jsonAPI = function() {};


jsonAPI.removeNull = function(j) {
    var j2 = {}

    _.each(j, function(val, key) {
        if (val)
            j2[key] = val
    });

    return j2
}


module.exports = jsonAPI