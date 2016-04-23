var singleton = function singleton(){
    this.post = function ( post ){
	  return {
	    objectId: post.id,
	    app: post.get("text")
	  }
	}
    if(singleton.caller != singleton.getInstance){
        throw new Error("This object cannot be instanciated");
    }
}

singleton.instance = null;

/**
 * Singleton getInstance definition
 * @return singleton class
 */
singleton.getInstance = function(){
    if(this.instance === null){
        this.instance = new singleton();
    }
    return this.instance;
}

module.exports = singleton.getInstance();

