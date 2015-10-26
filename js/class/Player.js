(function(fps) {
    var instance = null;
    /**
     * @constructor
     */
    var Player = function() {
        BABYLON.FreeCamera.call(this, "Camera", BABYLON.Vector3.Zero(), fps.Game.getInstance().scene);
        this.fireRateBullet = fps.options.current.fireRateBullet;
        this.currentFireTimeBullet = 0;
        this.fireRateMissile = fps.options.current.fireRateMissile;
        this.currentFireTimeMissile = 0;
        this.score = 0;
        this.maxHealth = 10;
        this.health = this.maxHealth;
        this.bullets = [];
        this.missiles = [];
    };

    Player.prototype = fps.outils.extend(BABYLON.FreeCamera.prototype, {
        init: function() {
            this.mesh = fps.meshes['spaceship'].createInstance("PlayerShip");
            this.mesh.position.z = 5;
            this.mesh.position.y = -1;
            this.mesh.parent = this;
            this.mesh.checkCollisions = true;

            this.target = BABYLON.Mesh.CreateDisc("PlayerTarget", 0.25, 16, this.getScene());
            this.target.position.z = 25;
            this.target.visibility = false;
            this.target.parent = this;

            this.targetZone = BABYLON.Mesh.CreatePlane("PlayerTargetZone", 100, this.getScene());
            this.targetZone.position.z = 25;
            this.targetZone.visibility = false;
            this.targetZone.parent = this;

            var positions = [
                [
                    new BABYLON.Vector3(0, 0.175, 0.6),
                    new BABYLON.Vector3(0, 0.175, 0.6)
                ],
                [
                    new BABYLON.Vector3(0.075, 0.07, 0.6),
                    new BABYLON.Vector3(0.075, 0.07, 0.6)
                ],
                [
                    new BABYLON.Vector3(-0.075, 0.07, 0.6),
                    new BABYLON.Vector3(-0.075, 0.07, 0.6)
                ]
            ];
            this.particleSystems = [];
            for(var i = positions.length, p = null; i--, p = positions[i];)
            {
                var particleSystem = new BABYLON.ParticleSystem("PlayerParticles"+i, 2000, this.getScene());

                //Texture of each particle
                particleSystem.particleTexture = new BABYLON.Texture("particles/flame.png", this.getScene());

                particleSystem.emitter = this.mesh;
                particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
                particleSystem.minSize = 0.05;
                particleSystem.maxSize = 0.1;
                particleSystem.minLifeTime = 0.05;
                particleSystem.maxLifeTime = 0.2;
                particleSystem.minEmitBox = p[0]; // Starting all from
                particleSystem.maxEmitBox = p[1]; // To...
                particleSystem.emitRate = 100;
                particleSystem.direction1 = new BABYLON.Vector3(0,0,5);
                particleSystem.minAngularSpeed = 0;
                particleSystem.maxAngularSpeed = Math.PI;
                particleSystem.start();

                this.particleSystems.push(particleSystem);
            }


            fps.Game.getInstance().canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
            fps.Game.getInstance().register(this);
            fps.Game.getInstance().shadowGenerator.getShadowMap().renderList.push(this.mesh);
        },
        onMouseMove: function(event) {
            var pick = this.getScene().pick(event.clientX, event.clientY, function (mesh) {
                return mesh.name.toLowerCase().search("shield") >= 0;
            });

            if(!pick.hit) {
                pick = this.getScene().pick(event.clientX, event.clientY, function (mesh) {
                    return mesh.name.toLowerCase().search("targetzone") >= 0;
                });
            }

            if (pick.hit) {
                this.target.position = pick.pickedPoint;
                this.target.position.z -= 0.5;
            }
        },
        onBeforeRender: function(dt) {
            console.log("player loop");
            this.mesh.lookAt(this.target.position);

            this.checkMoves(dt);
            this.checkInputs(dt);
        },
        checkMoves: function(dt) {
            var meshScreenPositon = BABYLON.Vector3.Project(this.mesh.position,
                BABYLON.Matrix.Identity(),
                this.getScene().getTransformMatrix(),
                this.viewport.toGlobal(this.getEngine())
            );

            if(fps.inputs.getKey(fps.options.current.keys.Up)) {
                if(meshScreenPositon.y >= 75)
                    this.mesh.position.y += fps.options.current.playerSpeed * dt / 1000;
                //else
                //    this.position.y += fps.options.current.playerSpeed * dt / 1000 / 5;
            }

            if(fps.inputs.getKey(fps.options.current.keys.Down)) {
                if(meshScreenPositon.y <= window.innerHeight - 75)
                    this.mesh.position.y -= fps.options.current.playerSpeed * dt / 1000;
                //else
                //    this.position.y -= fps.options.current.playerSpeed * dt / 1000 / 5;
            }

            if(fps.inputs.getKey(fps.options.current.keys.Right))
            {
                if(meshScreenPositon.x <= window.innerWidth - 75)
                    this.mesh.position.x += fps.options.current.playerSpeed * dt / 1000;
                //else
                //    this.position.x += fps.options.current.playerSpeed * dt / 1000 / 5;
            }

            if(fps.inputs.getKey(fps.options.current.keys.Left)) {
                if(meshScreenPositon.x >= 75)
                    this.mesh.position.x -= fps.options.current.playerSpeed * dt / 1000;
                //else
                //    this.position.x -= fps.options.current.playerSpeed * dt / 1000 / 5;
            }

            for(var i = this.particleSystems.length; i--;) {
                this.particleSystems[i].emitRate = fps.inputs.anyRegisteredKey() ? 200 : 100;
                this.particleSystems[i].maxLifeTime = fps.inputs.anyRegisteredKey() ? 0.3 : 0.2;
            }
        },
        checkInputs: function(dt) {

            if(this.currentFireTimeBullet <= 0)
            {
                if(fps.inputs.leftMouseDown())
                {
                    this.currentFireTimeBullet = this.fireRateBullet;
                    this.onFireBullet();
                }
            }
            else
                this.currentFireTimeBullet -= dt / 1000;
            if(this.currentFireTimeMissile <= 0)
            {
                if(fps.inputs.rightMouseDown())
                {
                    this.currentFireTimeMissile = this.fireRateMissile;
                    this.onFireMissile();
                }
            }
            else
            {
                this.currentFireTimeMissile -= dt / 1000;
                $('#playerMissileCooldown .cd').css("height", (this.currentFireTimeMissile / this.fireRateMissile * 100) + "%");
            }
        },
        onFireBullet: function() {
            var direction = this.target.position.subtract(this.mesh.position).normalize();
            var bullet = new fps.Bullet(direction, 0.5, this.target.position);
            bullet.position = this.mesh.position.clone().add(new BABYLON.Vector3(0,-0.25,0));

            this.bullets.push(bullet);
        },
        onFireMissile: function() {
            var direction = this.target.position.subtract(this.mesh.position).normalize();
            var positions = [
                new BABYLON.Vector3(-0.125, 0.15, 0.25),
                new BABYLON.Vector3(0.125, 0.15, 0.25)
            ];
            for (var i = positions.length; i--;) {
                var missile = new fps.Missile(direction, 0.1, this.target.position);
                missile.position = this.mesh.position.clone().add(positions[i]);

                this.missiles.push(missile);
            }
        },
        changeHealth: function(value) {
            this.health += value;
            var $selector = $('#playerHealth .bar');
            $selector.css('height', (this.health / this.maxHealth * 100) + "%");
            if(this.health < 25)
                $selector.css('backgroundColor', "red");
            else if(this.health < 50)
                $selector.css('backgroundColor', "orange");
        },
        addScore: function(value) {
            this.score += value;
            $('#top #score .value').text(this.score);
        }
    });

    fps.Player = {
        getInstance: function() {
            if(instance == null) instance = new Player();
            return instance;
        },
        reset: function() {
            if(Player.init) {
                instance = null;
                fps.Game.getInstance().unregister(instance);
                fps.Game.getInstance().canvas.removeEventListener("mousemove", this.onMouseMove.bind(this));
            }
            return this.getInstance();
        }
    };
})(fps);
