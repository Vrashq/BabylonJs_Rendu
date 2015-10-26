var fps = {};
fps.options = {
    default: {
        keys: {
            Up: 90,
            Down: 83,
            Left: 81,
            Right: 68
        },
        angularSensibility: 1000,
        playerSpeed: 0.5,
        canvasID: null,
        gravity: new BABYLON.Vector3(0, -1, 0),
        fireRateBullet: 0.1,
        fireRateMissile: 3,
        deadLimitBullet: 50,
        worldSpeed: 10,
        backward: new BABYLON.Vector3(0,0,-1),
        groundSize: 50,
        groundsNumber: {x:11,y:10},
        shieldFactor: 1,
        newRingTimer: 3000,
        bonusRingDistances: {
            slow: 1,
            medium: 1.5,
            large: 2,
            heavy: 2.5
        }
    },
    current: {
        // Custom parameters
    }
};

// Used to prevent the right click context menu opening
document.addEventListener("contextmenu", function (e) { e.preventDefault();	});
