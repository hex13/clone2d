exports.modOpacity = {
    name: 'opacity',
    patch(obj) {
        obj.opacity = 0.1;
        obj.keyframes = [];
    }
};

const EMPTY = {};

function resolveExplosionParticle(obj, params) {
    const {piecesX, piecesY, sx, sy, ttl} = params;
    let result;
    if (obj.resolveExplosionParticle) {
        result = obj.resolveExplosionParticle(params);
        result.ignore = true;
        return result;
    }
    return {
        type: obj.type,
        displayAs: obj.displayAs,
        shape: obj.shape,
        img: obj.img,
        r: obj.width/piecesX,
        width: obj.width / piecesX,
        height: obj.height / piecesY,
        mass: 0.01, //0.09,
        color: obj.color,
        fill: obj.fill,
        x: obj.x + sx,
        y: obj.y + sy,
        sx: sx,
        sy: sy,
        fill: obj.fill,
        color: obj.color,
        skinematic: true,
        points: obj.points,
        ttl: ttl,
        opacity: Math.max(0, ttl/100),
        ignore: true,
        isDestroyer: obj.isDestroyer,
        keyframes: [
            {t: 0, opacity: 1},
            {t: 3000, opacity: 0}
        ]
    };
}

exports.modExplode = {
    patch(obj, ttl = 2000, options, model) {
        model = model || obj.model;
        options = options || EMPTY;
       if (obj.exploded) return;
       if (ttl < 400) return;
        const allowed = ['box', 'image', 'rect', 'circle', 'shape'];
        if (obj.joinA || obj.joinB) return;
        //if (obj.constraints) return;
        if (obj.shape == 'rope' || obj.type == 'rope') return;

        //console.log('ooo', obj.displayAs, obj.type, obj.shape)
        if (obj.displayAs && allowed.indexOf(obj.displayAs)==-1) return;

        const piecesX = options.piecesX || obj.piecesX || 2;
        const piecesY = options.piecesY || obj.piecesY || 2;
        const width = obj.width;
        let last;
        for (let y = 0; y < piecesY; y++) {
            for (let x = 0; x < piecesX; x++) {
                const sx = x * obj.width / piecesX;
                const sy = y * obj.height / piecesY;
                const angle = Math.atan2(y-piecesY/2, x-piecesX/2);
                const curr = model.createObject(
                    resolveExplosionParticle(obj, {
                        piecesX, piecesY, sx, sy, ttl
                    })
                );
                if (obj.isDestroyer) {

                }
                last = curr;

                curr.set({
                    vx: Math.cos(angle) * (100 * Math.random() + 200),
                    vy:  Math.sin(angle) * (100 * Math.random() + 200) - 100,
                });
                // setTimeout(() => {
                //     exports.modExplode.patch(curr, ttl - 200)
                // }, 300)
            }

        }


        //obj._p2body = last._p2body; // engine relies on this variable
        //obj.displayAs = 'rect';
        //obj.set({kinematic:true})
        obj.exploded = true;
        obj.dead = true;
        //obj.state = 'dying'
    }
}
