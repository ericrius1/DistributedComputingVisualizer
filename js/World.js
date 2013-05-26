var World = function() {

  pickingData = [],
  objects = [];
  this.numContributors = 10;

  mouse = new THREE.Vector2();
  offset = new THREE.Vector3(10, 10, 10);

};

World.prototype.init = function() {

  container = document.getElementById("container");

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 1000;

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

  World.prototype.applyVertexColors = function(g, c) {

    g.faces.forEach(function(f) {

      var n = (f instanceof THREE.Face3) ? 3 : 4;

      for (var j = 0; j < n; j++) {

        f.vertexColors[j] = c;

      }

    });

  }
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
  //Create contributors. Location and such can be pulled in from
  for (var i = 0; i < this.numContributors; i++) {

    var position = new THREE.Vector3();

    position.x = Math.random() * 10000 - 5000;
    position.y = Math.random() * 6000 - 3000;
    position.z = Math.random() * 8000 - 4000;

    var rotation = new THREE.Vector3();

    rotation.x = Math.random() * 2 * Math.PI;
    rotation.y = Math.random() * 2 * Math.PI;
    rotation.z = Math.random() * 2 * Math.PI;

    var scale = new THREE.Vector3();

    scale.x = Math.random() * 200 + 100;
    scale.y = Math.random() * 200 + 100;
    scale.z = Math.random() * 200 + 100;

    // give the geom's vertices a random color, to be displayed

    var geom = new THREE.CubeGeometry(1, 1, 1);
    var color = new THREE.Color(0xff00ff << 16);
    this.applyVertexColors(geom, color);

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

World.prototype.render = function() {
  controls.update();
  this.pick();
  renderer.render(scene, camera);
};