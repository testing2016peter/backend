var utilsModule = function() {
};


utilsModule.randomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

utilsModule.randomStr= function(MAX) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < MAX; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports = utilsModule;
