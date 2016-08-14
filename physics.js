const p2 = require('p2');
const createModel = require('./model');

module.exports = function createPhysics(params) {
    const mouse = params.mouse;
    let hoveredObjects = [];
    const onHover = params.onHover;
    const world = new p2.World({
        gravity:[0, 0]
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

        const newHoveredObjects = this.hitTest(mouse);

        onHover && onHover(hoveredObjects, newHoveredObjects);
        hoveredObjects = newHoveredObjects;

    };

    model.isHovered = function (obj) {
        return hoveredObjects.indexOf(obj) != -1;
    }

    model.hitTest = function (pos) {
        const bodies = world.hitTest([pos.x, pos.y], world.bodies);
        return bodies.map(b => b._obj);

    }

    model.click = function (e) {
        const bodies = world.hitTest([e.viewX, e.viewY], world.bodies);
        document.title = bodies.length;
        // bodies.forEach(b => {
        //     b.position = [10,10]
        // })
    }

    model.afterCreateObject = function (obj) {
        const body = new p2.Body({
            position: [obj.x, obj.y],
            mass: 1,
            angle: obj.rotation || 0,
            //angularVelocity: 2,
        });

        let shape;
        const displayAs = obj.displayAs || 'box';
        console.log(obj.type, obj.width, obj.height)
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
        body._obj = obj;

        world.addBody(body);
    };
    return model;
};
