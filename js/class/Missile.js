(function(fps) {
    var index = 0;
    var Missile = function(direction, speed, target) {
        BABYLON.Mesh.call(this, "missile" + index++, fps.Game.getInstance().scene);
        this.direction = direction;
        this.speed = speed / 2;
        this.maxSpeed = speed * 2;
        this.target = target;

        this.hasCollide = false;

        this.mesh = BABYLON.Mesh.CreateCylinder(this.name + "_Mesh", 0.25, 0.05, 0.05, 8, this.getScene());
        this.mesh.lookAt(this.target);
        this.mesh.rotate(BABYLON.Axis.X, Math.PI * 0.5, BABYLON.Space.LOCAL);
        this.mesh.parent = this;

        var particleSystem = new BABYLON.ParticleSystem("particles", 2000, this.getScene());

        //Texture of each particle
        particleSystem.particleTexture = new BABYLON.Texture("particles/flame.png", this.getScene());

        particleSystem.emitter = this.mesh;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        particleSystem.minSize = 0.05;
        particleSystem.maxSize = 0.05;
        particleSystem.minLifeTime = 0.05;
        particleSystem.maxLifeTime = 0.08;
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.02,0.125,-0.02); // Starting all from
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.02,0.125,0.02); // To...
        particleSystem.emitRate = 200;
        particleSystem.direction1 = new BABYLON.Vector3(0,20,0);
        particleSystem.start();

        particleSystem.parent = this;

        fps.Game.getInstance().register(this);
        fps.Game.getInstance().shadowGenerator.getShadowMap().renderList.push(this.mesh);

    };
    Missile.prototype = fps.outils.extend(BABYLON.Mesh.prototype, {
        onBeforeRender: function(dt) {
            if(!this.hasCollide) {
                if(this.speed < this.maxSpeed)
                    this.speed += this.speed * dt / 1000;
                this.translate(this.direction, this.speed, BABYLON.Space.LOCAL);
            }

            if(this.position.z >= fps.options.current.deadLimitBullet)
                fps.Game.getInstance().unregister(this);
            else {
                for(var i = fps.grounds.length; i--;) {
                    if(this.mesh.intersectsMesh(fps.grounds[i], true) && !this.hasCollide)
                    {
                        fps.createExplosion(this.position);
                        this.destroy();
                        this.hasCollide = true;
                        break;
                    }
                }
            }
        },
        destroy: function() {
            fps.Game.getInstance().unregister(this);
            fps.Player.getInstance().missiles.splice(fps.Player.getInstance().missiles.indexOf(this), 1);
        }
    });

    fps.Missile = Missile;
})(fps);
