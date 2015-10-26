(function(fps) {
    function clone(from, to) {
        for(var key in from) {
            if(from.hasOwnProperty(key))
            {
                if (!to.hasOwnProperty(key))
                    to[key] = from[key];
                if (typeof from[key] == "object")
                    fps.outils.clone(from[key], to[key]);
            }
        }
    }

    function extend(from, fields) {
        function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
        for (var name in fields) proto[name] = fields[name];
        if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
        return proto;
    }


    fps.outils = {
        clone: clone,
        extend: extend
    };
})(fps);
