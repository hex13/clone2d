const p2 = require('p2');
const createModel = require('./model');

module.exports = function createPhysics(params) {
    const world = new p2.World({
        gravity:[0, 10]
    });

    const model =  createModel(params);
    model.beforeUpdate = function () {
        world.step(1/60, 1/60, 10);
        this.objects.forEach(o => {
            const body = o._p2body;
            o.x = body.position[0];
            o.y = body.position[1];
            o.rotation = body.angle;
        })
    };
    model.afterCreateObject = function (obj) {
        const body = new p2.Body({
            position: [obj.x, obj.y],
            mass: 1
        });

        let shape;
        const displayAs = obj.displayAs || 'box';
        if (displayAs === 'box') {
            shape = new p2.Box({
                width: obj.width,
                height: obj.height
            });

        } else {
            shape = new p2.Circle({
                radius: 1
            });
        }
        body.addShape(shape);

        obj._p2body = body;

        world.addBody(body);
    };
    return model;
};
