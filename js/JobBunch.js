var JobBunch = function() {
  
  var group = new THREE.Object3D();
  var particle;
  scene.add(group);
  configureParticles();

  function configureParticles() {
        //// EMITTER STUFF
    
        var onParticleCreated = function(p) {
          // create a three.js particle
          
          var material = new THREE.ParticleCanvasMaterial( {  program: SPARKS.CanvasShadersUtils.circles, blending:THREE.AdditiveBlending } );
          material.color.setRGB(1.0, 0.0, 1.0); 
          
          particle = new THREE.Particle( material );
          particle.scale.x = particle.scale.y = 4;
          group.add( particle );  
          
          // assign three.js particle to sparks.js position
          particle.position = p.position;

          // assign sparks.js target particle to three.js particle

          p.target = particle;
          
        };
        
        var onParticleDead = function(particle) {
          particle.target.visible = false; // is this a work around?
          group.remove(particle.target); 
        };
        
        
        sparksEmitter = new SPARKS.Emitter(new SPARKS.SteadyCounter(100));

        sparksEmitter.addInitializer(new SPARKS.Position( new SPARKS.PointZone( new THREE.Vector3(0,0,0) ) ) );
        sparksEmitter.addInitializer(new SPARKS.Lifetime(3,3));
        sparksEmitter.addInitializer(new SPARKS.Velocity(new SPARKS.PointZone(new THREE.Vector3(0,0,100))));

        sparksEmitter.addAction(new SPARKS.Age());
        sparksEmitter.addAction(new SPARKS.Move()); 
        
        sparksEmitter.addCallback("created", onParticleCreated);
        sparksEmitter.addCallback("dead", onParticleDead);

        sparksEmitter.start();
        
      }
}