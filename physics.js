const p2 = require('p2');
const createModel = require('./model');

const modifiers = require('./modifiers');

module.exports = function createPhysics(params) {
    window.p2 = window.p2 || p2;
    const engine = params.engine;
    const overlay = params.overlay;
    params = params || {};
    params.gravity = params.gravity || {x: 0, y: 0};
    const mouse = params.mouse;
    let hoveredObjects = [];
    const onHover = params.onHover;
    const world = new p2.World({
        gravity:[params.gravity.x, params.gravity.y]
    });
    const materials = [];
    for (let i = 0; i < 4; i++) {
        materials.push(new p2.Material());
    }
    world.addContactMaterial(
        new p2.ContactMaterial(materials[0], materials[0], {
            restitution: 0.9,
        })
    );
    const worldConstraints = [];
    function addConstraint(constraint) {
        console.log("addConstraint", constraint);
        console.log("addConstraint bodies", constraint.bodyA, constraint.bodyB);
        world.addConstraint(constraint);
        worldConstraints.push({
            constraint: constraint,
            bodyA: constraint.bodyA,
            bodyB: constraint.bodyB,
        });
    }
    function removeConstraintsForBody(body) {
        for (let i = worldConstraints.length - 1; i >= 0; i--) {
            const c = worldConstraints[i];
            const shouldRemove = c.bodyA === body || c.bodyB === body;
            if (shouldRemove) {
                world.removeConstraint(c.constraint);
                worldConstraints.splice(i, 1)
            }
        }
    }
    //world.defaultContactMaterial.restitution = 'restitution' in params? params.restitution : 0.5;
    //world.setGlobalStiffness(500);


    const model =  createModel(params);

    model.addConstraint = addConstraint;

    world.on("postStep", () =>{
        //if (this === engine.world && window.paused) return;
    });

    model.beforeUpdate = function () {

        model.objects.forEach(o => {
            const body = o._p2body;
            if (o._updates) {
                o._updates.forEach(u => {
                    for (let p in u) {
                        o[p] = u[p];
                    }
                    if ('x' in u) {
                        body.position[0] = u.x;
                    }
                    if ('y' in u) {
                        body.position[1] = u.y;
                    }
                    if ('rotation' in u) {
                        body.angle = u.rotation;
                    }
                    if ('vx' in u || 'vy' in u) {
                        body.velocity = [
                            u.vx || o.vx || 0,
                            u.vy || o.vy || 0
                        ];
                    }
                    if ('vr' in u) {
                        body.angularVelocity = u.vr;
                    }
                    if ('kinematic' in u) {
                        body.type = u.kinematic? p2.Body.KINEMATIC : p2.Body.DYNAMIC;
                        body.mass = o.mass;
                    }
                    if ('width' in u || 'height' in u) {
                        body.removeShape(body.shapes[0]);
                        const newShape = new p2.Box({
                            height: 'height' in u? u.height: o.height,
                            width: 'width' in u? u.width: o.width,
                        })
                        body.addShape(newShape);
                    }

                    // TODO is these lines needed?

                    body.updateAABB();
                    body.updateMassProperties();
                    body.aabbNeedsUpdate = true;
                })
                o.clean();
            }
        });

        if (!window.paused)
            //world.step(1/60, 1/60, 10);
            world.step(1/60);

        if (!window.paused)
            this.objects.forEach(o => {
                const body = o._p2body;
                o.x = body.position[0];
                o.y = body.position[1];
                o.vx = body.velocity[0];
                o.vy = body.velocity[1];
                o.rotation = body.angle;
            });


        const newHoveredObjects = [];//this.hitTest(mouse);
        //TODO lazy

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
        // bodies.forEach(b => {
        //     b.position = [10,10]
        // })
    }

    model.removeObject = function (obj) {
        if (obj._p2body) {
            const body = obj._p2body;
            removeConstraintsForBody(body);
            world.removeBody(body);
        }
    }

    model.afterCreateObject = function (obj) {
        let body = new p2.Body({
            position: [obj.x, obj.y],
            mass: 'mass' in obj? obj.mass : 1,
            angle: obj.rotation || 0,
            angularVelocity: obj.vr || 0,
            velocity: [obj.vx || 0, obj.vy || 0],
            angularDamping: 0.8,
            allowSleep: true,
            collisionResponse:true,
            gravityScale: 'gravityScale' in obj? obj.gravityScale : 1,
        });
        body.damping = 0;
        body.angularDamping = 0;
        if ('damping' in obj) {
            body.damping = obj.damping;
        }

        if ('angularDamping' in obj) {
            body.angularDamping = obj.angularDamping;
        }



        if (obj.kinematic) {
            body.type = p2.Body.KINEMATIC
        }

        let shape;
        const displayAs = obj.displayAs || 'box';

        if (obj.shape === 'heightfield') {
            console.log("HEIGHT");
//            const data = [100, 100, 200, 300, 0, 0, 100];
            //const data = [0, 300, 200,0, 200, 300,0, 300,0,300];
            const data = [0, 300, 200,0, 200, 300,0, 300,0,300];

            shape = new p2.Heightfield({
                heights: data,
                elementWidth: 10
            })
        }
        else if (obj.shape === 'polygon') {
            //console.log("POLY",body.fromPolygon(obj.points.map(p => [p.x, p.y]))  );
            shape = new p2.Convex({
                vertices: obj.points.map(p => [p.x, p.y])
            });
            //obj._p2body = body; // engine relies on this variable
        //    return;
        }
        else if (obj.shape === 'rope') {
            // TODO we can't do this way... engine must recognize bodies as bodies (not as invisible parts)
            // because of need of reassigning updates from p2...

            // maybe we need separate game objects (renderable, eventable etc.)
            // from bodies... (physicable but also reassignable)
            // but simpler solution would be just create object for each link in chain
            // and return some sort of parent object....
            // later we can do this lite-style
            // lean object without all shit (set, logic, etc.),
            const chain = [];
            let lastLink;
            for (let i = 1; i < obj.points.length; i++) {
                const curr = obj.points[i];
                const prev = obj.points[i - 1];

                let x = prev.x;
                let y = prev.y;
                let distX = curr.x - prev.x;
                let distY = curr.y - prev.y;
                const dist = Math.sqrt(distX * distX + distY * distY);
                const width = 16;
                const stepCount = dist / width;
                const dx = distX / stepCount;
                const dy = distY / stepCount;

                for (let j = 0; j < stepCount; x+= dx, y+= dy, j++) {
                    const link = this.createObject({
                        kind: 'rope',
                        shape: 'circle',
                        displayAs: 'shape',
                        isImmortal: obj.isImmortal,
                        r: width/2,
                        width: width,
                        height: width,
                        mass: 0.1, //0.09,
                        color:  'rgba(170,110,80,0.1)',//'rgba(100,100,100, 0.1)',
                        fill: 'rgb(170,110,80)',
                        x: obj.x + x,
                        y: obj.y + y,
                        constraints: {}
                    });

                    if (lastLink) {
                        const linkConstraint = new p2.LockConstraint(link._p2body, lastLink._p2body, {
                           collideConnected: false,
                        })
                        //linkConstraint.setStiffness(400);
                        addConstraint(linkConstraint);
                    }
                    lastLink = link;
                    chain.push(link);
                }

            }
            if (obj.jointA) {
                 addConstraint(new p2.DistanceConstraint(chain[0]._p2body, obj.jointA._p2body,{
                     distance:1,
                 }));
            }
            if (obj.jointB) {
                 addConstraint(new p2.DistanceConstraint(chain[chain.length - 1]._p2body, obj.jointB._p2body,{
                     distance:1,
                 }));
            }
            obj._p2body = chain[0]._p2body; // engine relies on this variable
            //obj.dead = true; // remove object, keep only objects that form a chain/rope
            obj.points = chain;
            //obj.shape = null; // temporary
            return;
        }
        else if (obj.fragmented) {
            modifiers.modExplode.patch(obj, this);
            return
        }
        else if (obj.shape === 'rect' || displayAs === 'box' || displayAs === 'rect' ||  displayAs === 'text') {
            shape = new p2.Box({
                width: 'width' in obj? obj.width : 100,
                height: 'height' in obj? obj.height : 100
            });
        } else {
            shape = new p2.Circle({
                radius: obj.r || 1
            });
        }
        if (shape) {
            if ('material' in obj) {
                shape.material = materials[obj.material];
            }
            body.addShape(shape);
        }

        obj._p2body = body;
        body._obj = obj;

        world.addBody(body);

        obj.removeConstraints =function () {
            removeConstraintsForBody(this._p2body);
        }

        if (obj.constraints) {
            let constraint;
            if (obj.constraints.distance) {
                constraint = new p2.DistanceConstraint(obj._p2body, obj.constraints.distance._p2body, {
                    localAnchorA: [0, -obj.height/3.1],
                });
            } else if (obj.constraints.lock) {
                constraint = new p2.LockConstraint(obj._p2body, obj.constraints.lock._p2body);
            }
            if (constraint) {
                addConstraint(constraint);
            }
        }

    };
    function contact(data) {
       const tmpA = data.bodyA._obj;
       const tmpB = data.bodyB._obj;

       let a = tmpA;
       let b = tmpB;

       a.onCollision && a.onCollision(b);
       b.onCollision && b.onCollision(a);
    //    if (tmpA.type == 'coin') {
    //        a = tmpA;
    //        b = tmpB;
    //    } else if (tmpB.type == 'coin') {
    //        a = tmpB;
    //        b = tmpA;
    //    }
    //    if (a/* && !a.constraints*/) {
    //        a.dead = true;
    //    }
    }
    world.on('beginContact', contact);
    world.on('postBroadphase', function (d) {
        const objects = d.pairs.map(p => p._obj);
        for (let i = 0; i < d.pairs.length/2; i++) {
            const a = d.pairs[i * 2]._obj;
            const b = d.pairs[i * 2 + 1]._obj;
            if (a.isDestroyer && !b.ignore /*&& !b.constraints */ && !b.isImmortal) {
                modifiers.modExplode.patch(b, 2000, {}, overlay) //o.d
                b.onExplosion && b.onExplosion();
                b.dead = true;
            }
            if (b.isDestroyer && !a.ignore /*&& !a.constraints */&& !a.isImmortal) {
                modifiers.modExplode.patch(a, 2000, {}, overlay) //o.d
                a.onExplosion && a.onExplosion();
                a.dead = true;
            }

        }
//        console.log(t);
    });

    model.clear = function () {
        worldConstraints.length = 0;
        this.objects.length = 0;
        world.clear();
        world.gravity = [params.gravity.x, params.gravity.y];
    };

    return model;
};
