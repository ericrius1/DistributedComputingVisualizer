var Contributor = function(options) {
  this.position = new THREE.Vector3(Math.random() * 10000 - 5000, -500, Math.random() * -8000);
  this.rotation = new THREE.Vector3(Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI);
  this.scale = new THREE.Vector3(Math.random() * 200 + 100, Math.random() * 200 + 100, Math.random() * 200 + 100);
  this.options = options;
  if(!this.options.isFriend){
    this.color = new THREE.Color(0xff0000);
  }

 if(this.options.isFriend){
    this.color = new THREE.Color(0xff00ff);
  }

  if (this.options.isSelf){
    this.position = new THREE.Vector3(151, -500, -500);
    this.color = new THREE.Color(0x0000ff);
    this.rotation = new THREE.Vector3(Math.PI *2,Math.PI *2, Math.PI *2);
    this.scale.multiplyScalar(3);
  }
 
};
