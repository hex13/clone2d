const Path = require('path');

const _ = require('lodash');

const view = require('./view').view;
const createPhysics = require('./physics');
const createModel = require('./model');

const canvas = document.getElementById('engine');

const ctx = canvas.getContext('2d');
ctx.font = '28px sans-serif';


let fps = 0;
let last = 0;
let lastFps = 0;


const helpers = require('./helpers');
const createKeyFrames = helpers.createKeyFrames;


function createEngine() {
    const types = Object.create(null);

    const menu = createModel({types});
    const world = createPhysics({types});


    const models = [world, menu];


    function createView(getObjects, model) {
        const inst = Object.create(view);
        inst.getObjects = getObjects;
        inst.init({canvas, ctx});
        inst.model = model;
        return inst;
    }


    const views = [
        createView(() => world.objects, world),
        createView(() => menu.objects, menu),
    ];

    canvas.addEventListener('click', e => {
        const x = e.pageX - canvas.offsetLeft;
        const y = e.pageY - canvas.offsetTop;
        e.viewX = x;
        e.viewY = y;
        views.forEach(v => v.click && v.click(e));
    });


    function loop() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        views.forEach(v => v.render(ctx))
        ctx.fillText(lastFps, 10, 100);

        const now = new Date;
        fps++;
        if (now - last > (1000/4)) {
            lastFps = fps * 4;
            fps = 0;
            last = now;

        }

        const systemTime = +new Date;
        models.forEach(model => {
            if (model.state == 'running' || model.state == 'resuming') {
                update(model, {
                    systemTime, lastSystemTime
                });
            }
        });
        lastSystemTime = systemTime;

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);



    let lastSystemTime;
    function update(world, {systemTime, lastSystemTime}) {
        if (world.beforeUpdate) {
            world.beforeUpdate();
        }
        const objects = world.objects;

        const lapse = systemTime - (lastSystemTime || world.t0);



        world.lapse(lapse);
        if (1||!window.abc) {

            window.abc =1;
        }

        objects.forEach((obj, i) => {
            const age = world.age - obj.t0;

            const now = age;

            const keyframes = obj.resolveKeyFrames? obj.resolveKeyFrames({now}) : obj.keyframes || [];

            if (keyframes) {

                let from, to;
                for (let i = keyframes.length - 1; i >= 0; i--) {
                    if (keyframes[i].t <= now) {
                        from = keyframes[i];

                        // set boolean properties on frame start
                        // because program can't never go to the `to` frame
                        // because there will be next frame...
                        // TODO maybe flushFrame(previous), startFrame(current) or something?
                        if (typeof from.dead == 'boolean') {
                            obj.dead = from.dead;
                        }

                        to = keyframes[i + 1];
                        break;
                    }
                }


                if (from && to) {
                    const duration = to.t - from.t;
                    const relT = (now - from.t) / duration;
                    ['x', 'y', 'scale', 'opacity', 'rotation'].forEach(
                        prop => {
                            if (typeof from[prop] == 'number' && typeof to[prop] == 'number') {
                                obj[prop] = from[prop] * (1 - relT) +  to[prop] * relT;
                            }
                        }
                    );
                }
                if (obj.ttl && age > obj.ttl && obj.state != 'dying') {
                    obj.die && obj.die({now});
                }
            }
        });
        objects.forEach(o => {
            if (o.dead) {
                if (o.afterDeath)
                    o.afterDeath();
            }
        });
        world.objects = objects.filter(o => !o.dead);

    }

    function createType(name, proto) {
        const typeObj = _.cloneDeep(proto);//Object.create(proto);

        typeObj.type = name;
        types[name] = typeObj;
        return typeObj;
    }
    createType('text', {
        displayAs: 'text',
    })

    function createTypesFromImages(images) {

        images.forEach(path => {
            const img = new Image;
            img.src = path;
            const basename = Path.basename(path, Path.extname(path));

            createType(basename,{
                img
            });
        })
    }

    function getType(name) {
        return types[name];
    }

    return {
        getType,
        createType,
        world,
        menu,
        createKeyFrames,
        createTypesFromImages,
        views,
    };

}

module.exports = createEngine;
