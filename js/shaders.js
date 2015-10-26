(function(fps) {
    fps.shaders = {
        init: function(scene, shadersToLoad)
        {
            for(var i = shadersToLoad.length; i--;)
            {
                var name = shadersToLoad[i].name;
                this[name] = new BABYLON.ShaderMaterial("amiga", scene, {
                        vertexElement: name,
                        fragmentElement: name
                    },
                    shadersToLoad[i].options
                );
            }
        }
    };
})(fps);
