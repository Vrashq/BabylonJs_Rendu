(function(fps) {
    fps.createExplosion = function(position) {
        var baseMesh = new BABYLON.Mesh("mesh", fps.Game.getInstance().scene);
        baseMesh.position = position.clone();
        baseMesh.speed = fps.options.current.worldSpeed * 0.2;
        baseMesh.direction = fps.options.current.backward;
        baseMesh.onBeforeRender = function(dt) {
            this.translate(this.direction, this.speed * dt / 1000, BABYLON.Space.LOCAL);
        };

        //var light = new BABYLON.PointLight("pointLight", baseMesh.position, fps.Game.getInstance().scene);

        var particleSystem = new BABYLON.ParticleSystem("PlayerParticlesTest", 10000, fps.Game.getInstance().scene);
        particleSystem.particleTexture = new BABYLON.Texture("particles/flame.png", fps.Game.getInstance().scene);
        particleSystem.startDirectionFunction = function(emitPower, worldMatrix, directionToUpdate) {
            var randX = randomNumber(this.direction1.x, this.direction2.x);
            var randY = randomNumber(this.direction1.y, this.direction2.y);
            var randZ = randomNumber(this.direction1.z, this.direction2.z);

            BABYLON.Vector3.TransformNormalFromFloatsToRef(randX * emitPower, randY * emitPower, randZ * emitPower, worldMatrix, directionToUpdate);
        };
        particleSystem.emitter = baseMesh;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.25;
        particleSystem.minLifeTime = 0.5;
        particleSystem.maxLifeTime = 1;
        particleSystem.emitRate = 2500;
        particleSystem.direction1 = new BABYLON.Vector3(-1,-0.5,-1);
        particleSystem.direction2 = new BABYLON.Vector3(1,1,1);
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.1,-0.1,-0.1); // Starting all from
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.1,0.1,0.1); // To...
        particleSystem.targetStopDuration = 0.2;
        particleSystem.disposeOnStop = true;
        particleSystem.onDispose = function() {
            baseMesh.dispose();
        };
        particleSystem.start();

        fps.Game.getInstance().register(baseMesh);

    }
})(fps);