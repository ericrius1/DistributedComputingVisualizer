var Contributor = function(options) {
  this.position = new THREE.Vector3(Math.random() * 10000 - 5000, Math.random() * 6000 - 3000, Math.random() * 8000 - 4000);
  this.options = options
  if(this.options.isFriend === true){
    this.color = new THREE.Color(0xff00ff);
  }
  else{
    this.color = new THREE.Color(0xff0000);
  }

};

Contributor.prototype.getPosition = function() {
  return this.position;

}

Contributor.prototype.setPosition = function() {

}
