(function(fps) {
    var inputs = {
        onKeyDown: function(event) {
            this.keys[event.keyCode] = true;
        },
        onKeyUp: function(event) {
            this.keys[event.keyCode] = false;
        },
        onMouseDown: function(event) {
            if(event.which == 1)
                this.mouse.left = true;
            else if(event.which == 2)
                this.mouse.middle = true;
            else if(event.which == 3)
                this.mouse.right = true;
        },
        onMouseUp: function(event) {
            if(event.which == 1)
                this.mouse.left = false;
            else if(event.which == 2)
                this.mouse.middle = false;
            else if(event.which == 3)
                this.mouse.right = false;
        },
        keys: {},
        mouse: {
            left: false,
            middle: false,
            right: false
        },
        mousePosition: {x:0,y:0}
    };

    window.addEventListener("keydown", inputs.onKeyDown.bind(inputs));
    window.addEventListener("keyup", inputs.onKeyUp.bind(inputs));
    window.addEventListener("mousedown", inputs.onMouseDown.bind(inputs));
    window.addEventListener("mouseup", inputs.onMouseUp.bind(inputs));

    fps.inputs = {
        getKey: function(keyCode) {
            return inputs.keys[keyCode];
        },
        anyRegisteredKey: function() {
            var keys = fps.options.current.keys;
            for(var key in inputs.keys) {
                if(inputs.keys.hasOwnProperty(key) && inputs.keys[key]) {
                    for(var registeredKey in keys) {
                        if(keys.hasOwnProperty(registeredKey) && keys[registeredKey] == key)
                            return true;
                    }
                }
            }
            return false;
        },
        anyKey: function() {
            for(var key in inputs.keys) {
                if(inputs.keys.hasOwnProperty(key) && inputs.keys[key])
                    return true;
            }
            return false;
        },
        leftMouseDown: function() {
            return inputs.mouse.left;
        },
        middleMouseDown: function() {
            return inputs.mouse.middle;
        },
        rightMouseDown: function() {
            return inputs.mouse.right;
        },
        anyMouse: function() {
            return inputs.mouse.left || inputs.mouse.middle || inputs.mouse.right;
        },
        reset: function() {
            window.removeEventListener("keydown", inputs.onKeyDown.bind(inputs));
            window.removeEventListener("keyup", inputs.onKeyUp.bind(inputs));
            window.removeEventListener("mousedown", inputs.onMouseDown.bind(inputs));
            window.removeEventListener("mouseup", inputs.onMouseUp.bind(inputs));
        }
    };
})(fps);