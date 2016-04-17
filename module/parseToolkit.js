var _ = require('underscore')


var parseToolkit = function() {};


parseToolkit.iterationSet = function(obj, json){

    _.each(json, function(val, key) {
        if (val){
        	obj.set(key,val)
        }
    });

}


module.exports = parseToolkit