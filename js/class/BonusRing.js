(function(fps) {
    var index = 0;

    var BonusRing = function(type) {
        BABYLON.Mesh.call(this, "BonusRing" + index++, fps.Game.getInstance().scene);
        this.type = type;
        this.animations  = [];
        this.direction = fps.options.current.backward;
        this.speed = fps.options.current.worldSpeed;

        this.init();

        fps.Game.getInstance().register(this);
    };
    BonusRing.TYPE = {
        NORMAL: 0x0000,
        SHIELDED: 0x0001
    };
    BonusRing.prototype = fps.outils.extend(BABYLON.Mesh.prototype, {
        init: function() {
            this.mesh = fps.meshes['porte'].clone(name + "_OutRing");
            this.mesh.parent = this;
            this.mesh.rotation.x = -Math.PI / 2;
            this.mesh.material = new BABYLON.StandardMaterial(name + "_Material", this.getScene());
            this.mesh.material.diffuseColor = BABYLON.Color3.Red();
            this.mesh.material.specularColor = BABYLON.Color3.Red();

            var children = this.mesh.getChildren();
            for(var i = children.length; i--;) {
                children[i].material = this.mesh.material;
            }

            this.collider = BABYLON.Mesh.CreateDisc(name + "_Collider", 0.75, 16, this.getScene());
            this.collider.parent = this;
            this.collider.visibility = false;

            if(this.type == BonusRing.TYPE.SHIELDED) {
                var shield = null;
                if(fps.Player.getInstance().score < 25)
                    shield = fps.RingShield.CreateShield(fps.RingShield.TYPE.WEAK);
                else if(fps.Player.getInstance().score < 50)
                    shield = fps.RingShield.CreateShield(fps.RingShield.TYPE.MEDIUM);
                else if(fps.Player.getInstance().score < 100)
                    shield = fps.RingShield.CreateShield(fps.RingShield.TYPE.LARGE);
                else if(fps.Player.getInstance().score < 200)
                    shield = fps.RingShield.CreateShield(fps.RingShield.TYPE.HEAVY);
                this.shield = shield;
                this.shield.parent = this;
            }

            this.mesh.checkCollisions = true;
            fps.Game.getInstance().shadowGenerator.getShadowMap().renderList.push(this.mesh);
        },
        initParticleSystem: function() {
            var particleTexture = new BABYLON.Texture("particles/particle-star.png", this.getScene());
            particleTexture.emissiveColor = BABYLON.Color3.Yellow();
            this.particleSystem = new BABYLON.ParticleSystem(this.name + "_DeathParticleSystem", 2000, this.getScene());
            this.particleSystem.particleTexture = particleTexture;
            this.particleSystem.emitter = this.mesh;
            this.particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
            this.particleSystem.minSize = 0.05;
            this.particleSystem.maxSize = 0.3;
            this.particleSystem.minLifeTime = 0.1;
            this.particleSystem.maxLifeTime = 0.5;
            this.particleSystem.minEmitBox = new BABYLON.Vector3(1,-1,0); // Starting all from
            this.particleSystem.maxEmitBox = new BABYLON.Vector3(1,1,0); // To...
            this.particleSystem.direction1 = new BABYLON.Vector3(0,5,0);
            this.particleSystem.emitRate = 300;
            this.particleSystem.minAngularSpeed = 0;
            this.particleSystem.maxAngularSpeed = Math.PI;
            this.particleSystem.start();

            this.particleSystem.parent = this;
        },
        onBeforeRender: function(dt) {
            if(this.collider.intersectsMesh(fps.Player.getInstance().mesh, true) && !this.hasCollidedWithPlayer)
                this.onPlayerCollision();

            if(!this.hasCollidedWithPlayer) {
                this.translate(this.direction, this.speed * dt / 1000, BABYLON.Space.LOCAL);
                this.rotate(this.direction, dt / 1000, BABYLON.Space.LOCAL);
                if (this.position.z <= -0) {
                    fps.Game.getInstance().unregister(this);
                    fps.Player.getInstance().changeHealth(-1);
                }
            }
            else {
                this.rotate(this.direction, Math.PI / 18, BABYLON.Space.LOCAL);
                this.position = fps.Player.getInstance().mesh.position;
            }
        },
        onPlayerCollision: function() {
            this.hasCollidedWithPlayer = true;
            this.initParticleSystem();

            fps.Player.getInstance().addScore(1);

            var animation = new BABYLON.Animation("AnimationScaling", "scaling", 30,
                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );
            animation.setKeys([
                {frame: 0, value: this.scaling.clone()},
                {frame: 100, value: new BABYLON.Vector3(0.1,0.1,0.1)}
            ]);
            this.animations.push(animation);

            this.getScene().beginAnimation(this, 0, 100, false, 3, function() {
                fps.Game.getInstance().unregister(this);
            }.bind(this));
        }
    });

    BonusRing.init = function() {
        BonusRing.lastPosition = new BABYLON.Vector3(0,0,100);
        BonusRing.maxDistance = fps.options.current.bonusRingDistances.slow;
        BonusRing.currentTimer = fps.options.current.newRingTimer;
        fps.Game.getInstance().register(BonusRing.onBeforeRender);
    };

    BonusRing.onBeforeRender = function(dt) {
        if(BonusRing.currentTimer >= 0) {
            BonusRing.currentTimer -= dt;
        }
        else {
            var bonusRing = new fps.BonusRing(
                fps.Player.getInstance().score >= 10 && Math.random() > 0.5
                    ? fps.BonusRing.TYPE.NORMAL
                    : fps.BonusRing.TYPE.SHIELDED
            );
            bonusRing.position = randomXYVector3(BonusRing.lastPosition, BonusRing.maxDistance, BonusRing.maxDistance);

            if(fps.Player.getInstance().score < 25) {
                BonusRing.currentTImer = fps.options.current.newRingTimer;
                BonusRing.maxDistance = 
            }
            else if(fps.Player.getInstance().score < 50) {
                BonusRing.currentTImer = fps.options.current.newRingTimer * 0.75;
            }
            else if(fps.Player.getInstance().score < 100) {
                BonusRing.currentTImer = fps.options.current.newRingTimer * 0.50;
            }
            else if(fps.Player.getInstance().score < 200) {
                BonusRing.currentTImer = fps.options.current.newRingTimer * 0.25;
            }
        }
    };

    fps.BonusRing = BonusRing;
})(fps);
