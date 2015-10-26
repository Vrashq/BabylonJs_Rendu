(function(fps) {
    var Event = function(type, params) {
        this.type = type;
        this.parameters = params;
    };

    Event.prototype = {
        toString: function() {
            var str = "[ Event " + this.type + " ";
            for(var p in this.parameters)
                str += "\n" + p + " : " + this.parameters[p];
        }
    };


    var EventDispatcher = function() {
        this.listeners = {};
    };

    EventDispatcher.prototype = {
        on: function(event, callback, once) {
            if(!this.listeners[event] == null)
                this.listeners[event] = [];
            this.listeners[event].push({
                callback: callback,
                once: once
            });
        },
        off: function(event, callback) {
            if(this.listeners[event] != null) {
                for (var i = 0; i < this.listeners[event].length; i++) {
                    if(this.listeners[event].callback == i) {
                        this.listeners[event].splice(i, 1);
                        return true;
                    }
                }
            }
            return false;
        },
        emit: function(event) {
            if(this.listeners[event] != null) {
                for(var i = 0; i < this.listeners[event.type].length; i++)
                    this.listeners[event.type].apply(this, event);
            }
        }
    };

})(fps);