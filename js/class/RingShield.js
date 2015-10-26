(function(fps) {
    var RingShield = function(params) {
        BABYLON.Mesh.call(this, "Shield", fps.Game.getInstance().scene);
        this.maxHealth = params.h * fps.options.current.shieldFactor;
        this.health = this.maxHealth;
        this.color = params.c;

        this.init();
    };

    RingShield.prototype = fps.outils.extend(BABYLON.Mesh.prototype, {
        init: function() {
            this.mesh = fps.meshes['shield'].clone('Shield');
            this.mesh.parent = this;
            this.mesh.scaling = new BABYLON.Vector3(0.75,0.75,0.75);
            this.mesh.material = new BABYLON.StandardMaterial("shieldMat", fps.Game.getInstance().scene);
            this.mesh.material.diffuseColor = this.color;
            this.mesh.material.specularPower = 50;
            this.mesh.rotation.x = -Math.PI * 0.5;

            fps.Game.getInstance().register(this);
        },
        onBeforeRender: function() {
            var bullets = fps.Player.getInstance().bullets;
            for(var bullet = bullets.length; bullet--;) {
                if(this.mesh.intersectsMesh(bullets[bullet].mesh, false)) {
                    bullets[bullet].destroy();
                    this.health--;
                }
            }
            var missiles = fps.Player.getInstance().missiles;
            for(var missile = missiles.length; missile--;) {
                if(this.mesh.intersectsMesh(missiles[missile].mesh, false)) {
                    missiles[missile].destroy();
                    this.health -= 5;
                }
            }

            if(this.mesh.intersectsMesh(fps.Player.getInstance().mesh)) {
                fps.Player.getInstance().addScore(this.maxHealth * 0.5);
                fps.Player.getInstance().changeHealth(-this.health);
                this.destroy();
            }

            if(this.health <= 0) {
                fps.Player.getInstance().addScore(this.maxHealth);
                this.destroy();
            }
        },
        destroy: function() {
            fps.Game.getInstance().unregister(this);
        }
    });

    RingShield.TYPE = {
        WEAK: {h:5,c:BABYLON.Color3.Green()},
        MEDIUM: {h:10,c:BABYLON.Color3.Blue()},
        LARGE: {h:15,c:BABYLON.Color3.Purple()},
        HEAVY: {h:20,c:BABYLON.Color3.Red()}
    };

    RingShield.CreateShield = function(params) {
        return new RingShield(params);
    };


    fps.RingShield = RingShield;
})(fps);