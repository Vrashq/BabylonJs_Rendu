(function(fps) {
    var instance = null;

    var Game = function() {
        this.updateList = [];

        this.canvas = this.getCanvas(fps.options.current.canvasID);
        this.addCanvasToBody();
    };

    Game.prototype.getCanvas = function(canvasID) {
        return document.getElementById(canvasID) || this.createCanvas(canvasID);
    };

    Game.prototype.createCanvas = function(canvasID) {
        var canvas = document.createElement("canvas");
        canvas.id = canvasID;
        document.body.appendChild(canvas);
        return canvas;
    };

    Game.prototype.startGame = function() {
        if(this.scene != null) {
            this.scene.dispose();
        }

        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.collisionsEnabled = true;

        fps.meshes = {};
        fps.time = 0;

        var loader = new BABYLON.AssetsManager(fps.Game.getInstance().scene);
        var meshesToLoad = [
            {name: "spaceship", url: "assets/", urlMesh: "spaceship.obj"},
            {name: "asteroid", url: "assets/", urlMesh: "asteroid.babylon"},
            {name: "porte", url: "assets/", urlMesh: "porte.obj"},
            {name: "shield", url: "assets/", urlMesh: "shield.obj"}
        ];
        for(var i = meshesToLoad.length; i--;)
        {
            var meshTask = loader.addMeshTask(meshesToLoad[i].name, "", meshesToLoad[i].url, meshesToLoad[i].urlMesh);
            meshTask.onSuccess = this.onSuccess.bind(this);
        }
        loader.onFinish = this.onComplete.bind(this);
        loader.load();
    };

    Game.prototype.onSuccess = function(task)
    {
        fps.meshes[task.name] = task.loadedMeshes[0];
        fps.meshes[task.name].setEnabled(false);
        for(var i = 1; i < task.loadedMeshes.length; i++)
        {
            task.loadedMeshes[i].parent = fps.meshes[task.name];
            task.loadedMeshes[i].setEnabled(false);
        }
    };

    Game.prototype.onComplete = function()
    {
        this.init();
        this.scene.clearColor = new BABYLON.Color3(0.13,0.13,0.13);
        this.scene.ambientColor = new BABYLON.Color3(0.3, 0.3, 1.0);
        fps.shaders.init(this.scene, [
            {name: "cellShading", options: {}},
            {name: "interstellar", options: {}}
        ]);

        // TODO : Looks how fog works in detail
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        this.scene.fogColor = new BABYLON.Color3(0,0,0.13);
        this.scene.fogDensity = 0.003;
        this.scene.fogStart = 50.0;
        this.scene.fogEnd = 1000.0;

        fps.grounds = [];
        for(var y = 0; y < fps.options.current.groundsNumber.y; y++) {
            for(var x = 0; x < fps.options.current.groundsNumber.x; x++) {
                var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "./images/heightMap0.png",
                    fps.options.current.groundSize, fps.options.current.groundSize, 16, -2, Math.random() * 7, this.scene, false);
                ground.material = new BABYLON.StandardMaterial("material", this.scene);
                var texture = new BABYLON.Texture("./images/ground.png", this.scene);
                ground.material.diffuseTexture = texture;
                ground.material.emissiveTexture = texture;
                ground.material.ambientTexture = texture;
                ground.position.y = -6;
                ground.position.z = x * fps.options.current.groundSize - fps.options.current.groundSize * 0.5;
                ground.position.x = (y - 5) * fps.options.current.groundSize;
                ground.speed = fps.options.current.worldSpeed;
                ground.direction = fps.options.current.backward;
                ground.receiveShadows = true;

                ground.onBeforeRender = function(dt) {
                    this.translate(this.direction, this.speed * dt / 1000, BABYLON.Space.LOCAL);

                    if(this.position.z <= -fps.options.current.groundSize * 0.5) {
                        this.position.z = fps.options.current.groundsNumber.y * fps.options.current.groundSize * 0.5 + this.position.z - fps.options.current.groundSize * 0.5;
                    }
                };

                this.register(ground);
                fps.grounds.push(ground);
            }
        }

        fps.skybox = fps.CreateSkyBox();
        this.register(fps.skybox);


        /*
         * TODO : Revoir la génération des anneaux et faire une progression par niveau de difficulté.
         * Chaque niveau a une durée, un nombre d'anneaux, de météorites et de drones défini
         */
        var lastPosition = new BABYLON.Vector3(0,0,100);
        window.maxX = 1;
        window.maxY = 1;
    };

    Game.prototype.init = function() {

        fps.outils.clone(fps.options.default, fps.options.current);

        this.scene.enablePhysics();

        this.engine.isPointerLock = true;
        this.scene.enablePhysics(new BABYLON.Vector3(0,-1,0), new BABYLON.OimoJSPlugin());

        this.light = new BABYLON.DirectionalLight("DirLight", new BABYLON.Vector3(-1,-2,6), this.scene);
        this.light.diffuse = new BABYLON.Color3(1, 1, 1);
        this.light.specular = new BABYLON.Color3(0.6, 0.6, 0.6);
        this.light.intensity = 2.5;

        this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.light);
        this.shadowGenerator.useVarianceShadowMap = true;

        this.player = fps.Player.reset();
        this.player.init();

        this.engine.runRenderLoop(this.gameloop.bind(this));
        this.scene.registerBeforeRender(this.beforeRenderer.bind(this));

        window.addEventListener("resize", this.onResize.bind(this));
    };

    Game.prototype.addCanvasToBody = function() {
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.style.display = "block";
        this.canvas.style.position = "absolute";
        this.canvas.style.backgroundColor = "#000000";
    };

    Game.prototype.gameloop = function() {
        this.scene.render();
        var dt = this.engine.getDeltaTime();
        fps.time += dt;
        for(var i = 0; i < this.updateList.length; i++)
        {
            if(this.updateList[i].onAfterRender != undefined)
                this.updateList[i].onAfterRender(dt);
        }
    };

    Game.prototype.beforeRenderer = function() {
        var dt = this.engine.getDeltaTime();
        for(var i = 0; i < this.updateList.length; i++)
        {
            if(this.updateList[i].onBeforeRender != undefined)
                this.updateList[i].onBeforeRender(dt);
        }
    };

    Game.prototype.register = function(element) {
        this.updateList.push(element);
    };

    Game.prototype.unregister = function(element) {
        element.dispose();
        this.updateList.splice(this.updateList.indexOf(element), 1);
    };

    Game.prototype.onResize = function() {
        this.engine.resize();
    };

    Game.prototype.startScreenShake = function() {
        var self = this;
        this.screenShakeDuration = 2000;
        this.register({
            onBeforeRenderer: function(dt) {
                self.screenShakeDuration = 0;
            }
        });
    };

    fps.Game = {
        getInstance: function() {
            if(instance == null) instance = new Game();
            return instance;
        }
    };
})(fps);
