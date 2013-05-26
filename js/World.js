var World = function() {

  pickingData = [],
  objects = [];
  this.numContributors = 0;
  ipMapper = new IpMapper();

  mouse = new THREE.Vector2();
  offset = new THREE.Vector3(10, 10, 10);

};

World.prototype.initialize = function() {

  container = document.getElementById("container");

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);


  controls = new THREE.TrackballControls(camera);
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  scene = new THREE.Scene();


  pickingScene = new THREE.Scene();
  pickingTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
  pickingTexture.generateMipmaps = false;

  scene.add(new THREE.AmbientLight(0x555555));

  var light = new THREE.SpotLight(0xffffff, 1.5);
  light.position.set(0, 500, 2000);
  scene.add(light);

  this.geometry = new THREE.Geometry(),
  pickingGeometry = new THREE.Geometry(),
  pickingMaterial = new THREE.MeshBasicMaterial({
    vertexColors: THREE.VertexColors
  }),
  defaultMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    shading: THREE.FlatShading,
    vertexColors: THREE.VertexColors
  });

  //ADD CONTRIBUTORS
  this.addContributors();

  var drawnObject = new THREE.Mesh(this.geometry, defaultMaterial);
  scene.add(drawnObject);

  pickingScene.add(new THREE.Mesh(pickingGeometry, pickingMaterial));

  highlightBox = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1), new THREE.MeshLambertMaterial({
    color: 0xffff00
  }));
  scene.add(highlightBox);

  projector = new THREE.Projector();

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    clearColor: 0xffffff
  });
  renderer.sortObjects = false;
  renderer.setSize(window.innerWidth, window.innerHeight);
  

//****JOB BUNCH***************
  jobBunch = new JobBunch();

  container.appendChild(renderer.domElement);

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild(stats.domElement);

  renderer.domElement.addEventListener('mousemove', this.onMouseMove);

}

World.prototype.onMouseMove = function(e) {

  mouse.x = e.clientX;
  mouse.y = e.clientY;
}

World.prototype.animate = function() {
  that = this;
  requestAnimationFrame(function() {
    that.animate();
  });

  this.render();
  stats.update();

}

World.prototype.pick = function() {

  //render the picking scene off-screen

  renderer.render(pickingScene, camera, pickingTexture);

  var gl = renderer.getContext();

  //read the pixel under the mouse from the texture

  var pixelBuffer = new Uint8Array(4);
  gl.readPixels(mouse.x, pickingTexture.height - mouse.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelBuffer);

  //interpret the pixel as an ID
  var id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2]);
  var data = pickingData[id];
  if (data) {
    //move our highlightBox so that it surrounds the picked object

    if (data.position && data.rotation && data.scale) {

      highlightBox.position.copy(data.position);
      highlightBox.rotation.copy(data.rotation);
      highlightBox.scale.copy(data.scale).add(offset);
      highlightBox.visible = true;
    }
  } else {
    highlightBox.visible = false;
  }
}

World.prototype.addContributors = function() {
  //Create contributors. Location and such can be pulled in from firebase
  for (var i = 0; i < this.numContributors; i++) {
    var options = {
      isFriend : i!==0 && i % 2 === 0 ? true : false,
      isSelf: i === 0 ? true : false
    };
    var contributor = new Contributor(options);

    var position = contributor.position;
    var rotation = contributor.rotation;
    var scale = contributor.scale;

  
   

    // give the geom's vertices a random color, to be displayed

    var geom = new THREE.CubeGeometry(1, 1, 1);
    this.applyVertexColors(geom, contributor.color);

    var cube = new THREE.Mesh(geom);
    cube.position.copy(position);
    cube.rotation.copy(rotation);
    cube.scale.copy(scale);

    THREE.GeometryUtils.merge(this.geometry, cube);

    //give the pickingGeom's vertices a color corresponding to the "id"

    var pickingGeom = new THREE.CubeGeometry(1, 1, 1);
    var pickingColor = new THREE.Color(i);
    this.applyVertexColors(pickingGeom, pickingColor);

    var pickingCube = new THREE.Mesh(pickingGeom);
    pickingCube.position.copy(position);
    pickingCube.rotation.copy(rotation);
    pickingCube.scale.copy(scale);

    THREE.GeometryUtils.merge(pickingGeometry, pickingCube);

    pickingData[i] = {
      position: position,
      rotation: rotation,
      scale: scale
    };
  }
}

World.prototype.applyVertexColors = function(geometry, color) {

  geometry.faces.forEach(function(face) {

    var numVertices = (face instanceof THREE.Face3) ? 3 : 4;

    for (var j = 0; j < numVertices; j++) {
      face.vertexColors[j] = color;
    }
  });

}

World.prototype.render = function() {
  controls.update();
  this.pick();
  renderer.render(scene, camera);

};