(function(fps) {
    var index = 0;

    var Bullet = function(direction, speed, target) {
        BABYLON.Mesh.call(this, "Bullet" + index++, fps.Game.getInstance().scene);
        this.direction = direction;
        this.speed = speed;
        this.target = target;

        this.mesh = BABYLON.Mesh.CreateSphere(this.name + "_Mesh", 16, 0.2, this.getScene());
        this.mesh.lookAt(this.target);
        this.mesh.parent = this;
        this.mesh.checkCollisions = true;

        fps.Game.getInstance().register(this);
        fps.Game.getInstance().shadowGenerator.getShadowMap().renderList.push(this.mesh);
    };

    Bullet.prototype = fps.outils.extend(BABYLON.Mesh.prototype, {
        onBeforeRender: function(dt) {
            this.translate(this.direction, this.speed, BABYLON.Space.LOCAL);

            if(this.position.z >= fps.options.current.deadLimitBullet)
                this.destroy();
        },
        destroy: function() {
            fps.Game.getInstance().unregister(this);
            fps.Player.getInstance().bullets.splice(fps.Player.getInstance().bullets.indexOf(this), 1);
        }
    });

    fps.Bullet = Bullet;
})(fps);