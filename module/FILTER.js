var singleton = function singleton(){
    //defining a var instead of this (works for variable & function) will create a private definition
 
    this.building = function ( building ){
	  return {
	    objectId: building.id,
	    name: building.get("name"),
	    updatedAt: building.get("updatedAt"),
	    createdAt: building.get("createdAt")
	  }
	}
 
    this.panorama = function ( pano ){
	  return {
	    objectId: pano.id,
	    app: pano.get("app"),
	    web: pano.get("web"),
	    name: pano.get("name"),
	    thumbnail: pano.get("thumbnail"),
	    updatedAt: pano.get("updatedAt"),
	    createdAt: pano.get("createdAt"),
	    categoryType: pano.get("categoryType")
	  }
	}
 
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
 
/* ************************************************************************
SINGLETON CLASS DEFINITION
************************************************************************ */
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

