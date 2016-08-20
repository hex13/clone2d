exports.modOpacity = {
    name: 'opacity',
    patch(obj) {
        obj.opacity = 0.1;
        obj.keyframes = [];
    }
};

exports.modExplode = {
    patch(obj, ttl = 3000) {
        if (ttl < 1000) return;
        const allowed = ['box', 'image', 'rect', 'circle'];
        if (obj.joinA || obj.joinB) return;
        if (obj.constraints) return;
        if (obj.shape == 'rope') return;
        console.log(obj.type, obj.shape, obj.displayAs, obj)
        //console.log('ooo', obj.displayAs, obj.type, obj.shape)
        if (obj.displayAs && allowed.indexOf(obj.displayAs)==-1) return;

        let y = 0;
        const piecesX = 4;
        const piecesY = 4;
        const width = obj.width;
        let last;
        for (let y = 0; y < piecesY; y++) {
            for (let x = 0; x < piecesX; x++) {
                const sx = x * obj.width / piecesX;
                const sy = y * obj.height / piecesY;
                const angle = Math.atan2(y-piecesY/2, x-piecesX/2);
                const curr = obj.model.createObject({
                    type: obj.type,
                    displayAs: obj.displayAs,
                    img: obj.img,
                    r: width/piecesX,
                    width: obj.width / piecesX,
                    height: obj.height / piecesY,
                    mass: 0.01, //0.09,
                    color: obj.color,
                    fill: obj.fill,
                    x: obj.x + sx,
                    y: obj.y + sy,
                    sx: sx,
                    sy: sy,
                    skinematic: true,
                    points: obj.points,
                    ttl: ttl + Math.random() * ttl
                });
                last = curr;

                curr.set({
                    vx: Math.cos(angle) * (100 * Math.random() + 200),
                    vy:  Math.sin(angle) * (100 * Math.random() + 200) - 100,
                });
            }

        }


        //obj._p2body = last._p2body; // engine relies on this variable
        //obj.displayAs = 'rect';
        //obj.set({kinematic:true})
        obj.dead = true;
        //obj.state = 'dying'
    }
}
