const Path = require('path');

const _ = require('lodash');

const view = require('./view').view;
const createPhysics = require('./physics');
const createModel = require('./model');
const modifiers = require('./modifiers')


const canvas = document.getElementById('world');
const overlayCanvas = document.getElementById('overlay');

const ctx = canvas.getContext('2d');
ctx.font = '28px sans-serif';


let fps = 0;
let last = 0;
let lastFps = 0;


const helpers = require('./helpers');
const createKeyFrames = helpers.createKeyFrames;


function createEngine(params) {
    const engine = {};
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

    const world = createPhysics(
        Object.assign({types, mouse, onHover, overlay}, params.physics)
    );

    const overlay = createPhysics({types, mouse});
    const hud = createPhysics({types, mouse});


    const models = [world, menu, hud, overlay];//!!!TODO automatic adding


    function createView(getObjects, model, methods) {
        const inst = Object.create(view);
        Object.assign(inst, methods);
        inst.getObjects = getObjects;

        inst.init({antialiasing: params.antialiasing});
        inst.model = model;
        return inst;
    }
    const worldViewport = menu.createObject({
        displayAs: 'rect',
        width: 800,
        height: 600,
        color: 'rgba(255,0,0,0.0)',
        x: 0,
        y: 0,
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

    const camera = {x: 400, y: 200, rotation: 0, scale: 0.5};//TODO zero
    const views = [
        createView(() => world.objects.concat(overlay.objects), world, {
            viewport: worldViewport,
            camera,
            canvas: canvas
        }),
        // createView(() => menu.objects, menu, {
        // }),
        createView(() => ([{
            shape: 'circle', r:100, fill:'red', displayAs: 'shape'
        }]), hud, {
            viewport: worldViewport,
            canvas: overlayCanvas,
        }),
        // createView(() => hud.objects, hud, {
        //     //viewport: worldViewport
        // }),
        // createView(() => overlay.objects, overlay, {
        //     viewport: worldViewport,
        //     camera,
        //     canvas: overlayCanvas
        // }),

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
        x: e.pageX - canvas.parentNode.offsetLeft,
        y: e.pageY - canvas.parentNode.offsetTop
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

    document.addEventListener('mousedown', e => {
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
    const activeViews = [
        views[0],views[1]
    ];

    function renderLoop() {
        const now = new Date;
        fps++;
        if (now - last >= (1000/8)) {
            lastFps = ~~(fps * 1000 / (now - last));
            fps = 0;
            last = now;

        }

        // ctx.fillStyle = 'red';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
        //views[3].render(ctx);

        //views.forEach(v=> v.render(ctx));
        ctx.clearRect(0,0,800,600);
        overlayCanvas.getContext('2d').clearRect(0,0,800,600);
        activeViews.forEach(v=> v.render(ctx));


        //views.forEach(v => v.render(ctx))
        ctx.fillStyle = lastFps > 50? 'green' : (lastFps > 25? '#ea0' : 'red');
        ctx.fillText('fps:' + lastFps, 10, 100);
        requestAnimationFrame(renderLoop);
    }

    function modelLoop() {


        const systemTime = +new Date;
        models.forEach(model => {
            if (model.state == 'running' || model.state == 'resuming') {
                model.update({
                    systemTime, lastSystemTime
                });
            }
        });
        lastSystemTime = systemTime;


    }

    requestAnimationFrame(renderLoop);

    setInterval(() => {
        modelLoop();
    }, 16);


    let lastSystemTime;


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


    return Object.assign(engine, {
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
        modifiers: modifiers,
        activeViews
    });

}

module.exports = createEngine;
