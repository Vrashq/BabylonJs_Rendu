(function(fps) {
    fps.CreateSkyBox = function() {
        var sMaterial = new BABYLON.StandardMaterial("skyboxMaterial", fps.Game.getInstance().scene);
        sMaterial.backFaceCulling = false;

        sMaterial.diffuseTexture
//        material.diffuseTexture = new BABYLON.Texture("./images/Space.jpg", fps.Game.getInstance().scene);
        sMaterial.reflectionTexture = new BABYLON.CubeTexture("images/skybox/skybox", fps.Game.getInstance().scene);
        sMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

        // Creation d'un cube avec la material adaptee
        var skybox = BABYLON.Mesh.CreateBox("skybox", 1000, fps.Game.getInstance().scene);
        skybox.material = sMaterial;
        skybox.position.z = 45;
        skybox.rotate(BABYLON.Axis.Z, Math.PI * 0.5, BABYLON.Space.WORLD);
        skybox.rotate(BABYLON.Axis.Y, Math.PI * 0.5, BABYLON.Space.WORLD);

        skybox.onBeforeRender = function(dt) {
            this.rotate(BABYLON.Axis.Z, 0.01 * dt / 1000, BABYLON.Space.WORLD);
        };

        return skybox;
    }
})(fps);