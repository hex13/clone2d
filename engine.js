const Path = require('path');

const _ = require('lodash');

const view = require('./view').view;
const createPhysics = require('./physics');
const createModel = require('./model');
const modifiers = require('./modifiers')


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
    types.default = {

    };
    const mouse = {
        x: 0,
        y: 0,
        down: false,
        start: {
            x: 0,
            y: 0
        }
    }

    const menu = createModel({types, mouse});

    function onHover(hoveredObjects, newHoveredObjects) {
        newHoveredObjects.forEach(o => {
            const idx = hoveredObjects.indexOf(o);
            const isNew = idx == -1;
            if (isNew) {
                o.onMouseOver && o.onMouseOver();
            } else {
                hoveredObjects.splice(idx, 1)
            }
        });
        hoveredObjects.forEach(o => {
            o.onMouseOut && o.onMouseOut();
        })
    }

    const world = createPhysics({types, mouse, onHover});

    const overlay = createPhysics({types, mouse});
    const hud = createPhysics({types, mouse});


    const models = [world, menu, hud, overlay];//!!!TODO automatic adding


    function createView(getObjects, model, methods) {
        const inst = Object.create(view);
        Object.assign(inst, methods);
        inst.getObjects = getObjects;

        inst.init({canvas, ctx});
        inst.model = model;
        return inst;
    }
    const worldViewport = menu.createObject({
        displayAs: 'rect',
        width: 800,
        height: 600,
        color: 'rgba(255,0,0,0.4)',
        x: 400,
        y: 300 + 100,
        scale: 1,
        rotation: 0,
        opacity: 0,
        aaaakeyframes: [
            {t: 4000, x: 600, rotation: Math.PI/2},
            {t: 8000, x: 600, rotation: Math.PI},
            {t: 12000, x: 700, rotation: Math.PI + Math.PI/2},
            {t: 16000, x: 600, rotation: Math.PI * 2},
            {t: 17000, x:400, rotation: Math.PI * 2},
        ]
    });
    let a = 0;
    //setInterval(() => {worldViewport.scale = 0.04*Math.cos(a+=0.1)+1}, 200);


    const views = [
        createView(() => world.objects, world, {
            viewport: worldViewport,
        }),
        createView(() => menu.objects, menu, {
        }),
        createView(() => hud.objects, hud, {
            //viewport: worldViewport
        }),
        createView(() => overlay.objects, overlay, {
            viewport: worldViewport
        }),

//         createView(() => world.objects, world, {
//             viewport: menu.createObject({
//                 displayAs: 'rect',
//                 width: 15,
//                 height: 15,
//                 color: 'blue',
//                 x: 100,
//                 y: 100,
//                 rotation: 0,
//                 keyframes: [
//                     {t: 1000, rotation: 1},
//                     {t: 2000, rotation: 2},
//                     {t: 3000, rotation: 3},
//                     {t: 4000, rotation: 3.14},
//                     {t: 5000, rotation: 4.14},
//                     {t: 6000, rotation: 6.14},
//                     {t: 7000, rotation: 6.28},
//                 ]
//             }),
//             render() {
//                 const el = document.getElementById('html');
//                 let s = '';
//                 this.objects.forEach(o => {
//                     if (!o.img) {
//                         return;
//                     }
//                     s += `<img src="${o.img.src}" style="transform:rotate(${~~o.rotation}rad);position:absolute;left:${~~o.x}px;top:${~~o.y}px"/>
//                     `
// //                    s += `<div>${o.type} - ${o.x}, ${o.y}</div>`
//                 })
//                 el.innerHTML = s;
//             }
//         }),
    ];

    const e2xy = e => ({
        x: e.pageX - canvas.offsetLeft,
        y: e.pageY - canvas.offsetTop
    });

    canvas.addEventListener('mousemove', e => {
        const {x,y} = e2xy(e);
        e.viewX = x;//TODO remove
        e.viewY = y;
        mouse.x = x;
        mouse.y = y;


        const engineEvent = {
            x,
            y,
            originalEvent: e
        };
        views.forEach(v => v.emit('onMouseMove', engineEvent));


    });

    canvas.addEventListener('click', e => {
        const {x,y} = e2xy(e);

        //TODO remove these variables
        e.viewX = x;
        e.viewY = y;

        views.forEach(v => v.click && v.click(e));
    });

    canvas.addEventListener('mousedown', e => {
        mouse.start = e2xy(e);
        mouse.down = true;

        const {x, y} = e2xy(e);
        const engineEvent = {
            x,
            y,
            originalEvent: e
        };
        views.forEach(v => v.emit('onMouseDown', engineEvent));
        //views.forEach(v => v.mouseDown && v.mouseDown(e));
    });

    canvas.addEventListener('mouseup', e => {
        //const {x,y} = e2xy(e);
        mouse.down = false;
        views.forEach(v => v.mouseUp && v.mouseUp(e));
    });
    // TODO views --

    // rectangles/handles for scaling

    // model for viewports
    // and in view: reference to viewport (which can be animated etc.)

    // autochanging coordinates, paths etc.



    function loop() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        views.forEach(v => v.render(ctx))
        ctx.fillStyle = 'green'
        ctx.fillText('fps:' + lastFps, 10, 100);

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
            obj.onUpdate && obj.onUpdate();
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
                    if (obj.die)
                        obj.die({now});
                    else
                        obj.dead = true;
                }
            }
        });
        objects.forEach(o => {
            if (o.dead) {
                o.model.removeObject && o.model.removeObject(o);
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
        onUpdate() {
            if (this._ctx) {
                this._ctx.save();
                if (this.fontSize) {
                    this._ctx.font = this.fontSize + 'px sans-serif';
                    this.height = this.fontSize;
                }
                this.set({
                    width: this._ctx.measureText(this.getText()).width,
                });
                this._ctx.restore();
            }
        }
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

    function run(cb) {
        // TODO run cb when images etc. are ready
        setTimeout(cb, 500);
    }

    return {
        getType,
        createType,
        world,
        menu,
        createKeyFrames,
        createTypesFromImages,
        views,
        run,
        mouse,
        hud,
        overlay,
        worldView: views[0],
        hudView: views[2],
        modifiers: modifiers,
    };

}

module.exports = createEngine;
