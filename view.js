'use strict';

const resolvers = require('./resolvers');
const resolveRenderables = resolvers.resolveRenderables;
const resolveText = resolvers.resolveText;

const DEFAULT_VIEWPORT = {
    x: 400, y: 300, width: 800, height: 600, scale: 1
};
exports.view = {
    emit(name, event) {

        const viewEvent = Object.create(event);
        const camera = this.camera;

        const cos = Math.cos(camera.rotation);
        const sin = Math.sin(camera.rotation);


        let {x, y} = viewEvent;

        x -= this.viewport.width / 2;
        y -= this.viewport.height / 2;

        x /= camera.scale;
        y /= camera.scale;



        const newX = x * cos - y * sin;
        const newY = x * sin + y * cos;

        x = x * cos - y * sin;
        y = x * sin + y * cos;

        x = newX;
        y = newY;

        // x += this.viewport.width / 2;
        // y += this.viewport.height / 2;
        //
        //
        x += camera.x;
        y += camera.y;



        // x += this.viewport.width / 2;
        // y += this.viewport.height / 2;





        viewEvent.x = x;
        viewEvent.y = y;
        if (this[name]) {

            this[name](viewEvent);
        }
    },
    getObjects() {
        return [];
    },
    get objects() {
        return this.getObjects();
    },
    init({viewport, antialiasing = true}) {
        this.viewport = this.viewport || DEFAULT_VIEWPORT;
        //console.log("VV", this.viewport);
        this.camera = this.camera || {x: 0, y: 0, rotation: 0, scale: 1};
        this.color = ['red', 'green','blue', 'white'][~~(Math.random()*4)];
        this.antialiasing = antialiasing;

        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.offscreenCanvas = document.createElement('canvas');
            this.offscreenCanvas.width = this.canvas.width;
            this.offscreenCanvas.height = this.canvas.height;
            this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        }
    },
    render(outCtx) {

        const ctx = this.offscreenCtx;
        const viewport = this.viewport || {x: 400, y: 300, rotation: 0, width: 800, height: 600, scale: 1};
        const camera = this.camera;

        //const viewport = this.viewport || {x: 0, y: 0, rotation: 0};
        ctx.save();


//        ctx.beginPath()

        // ctx.fillStyle = 'green';
        // ctx.fillRect(400-10,300-10,20,20)

        ctx.imageSmoothingEnabled = this.antialiasing;

        // this.camera.rotation += 0.01;
        //  this.camera.y += 1;
        //
        // ctx.translate(-camera.x, -camera.y);
        // ctx.rotate(camera.rotation);
        // ctx.translate(camera.x, camera.y);


        ctx.translate(this.viewport.width / 2, this.viewport.height / 2);

        // TEST
        ctx.scale(camera.scale, camera.scale)
        //



        // ctx.fillStyle = 'orange';
        // ctx.fillRect(-5,-5,10,10)


        ctx.rotate(-camera.rotation);

        ctx.translate(-camera.x, -camera.y);


        const matrix = ctx.currentTransform;

        this.matrix = matrix;


        // ctx.fillStyle = 'red';
        // ctx.fillRect(-5,-5,10,10)


        const objects = this.objects;

        const len = objects.length;

        for (let i = 0; i < len; i++) {
            var unresolvedObj = objects[i];
            unresolvedObj._ctx = ctx;
            const isHovered = this.model.isHovered? this.model.isHovered(unresolvedObj) : false;
            let renderables = resolveRenderables(unresolvedObj);
            if (!renderables) {
                continue;
            }
            if (!(renderables instanceof Array)) {
                renderables = [renderables];
            }
            if(!renderables.length) {
                return;
            }
            renderables.forEach(obj => {
                ctx.save();
                if ('antialiasing' in obj) {
                    ctx.imageSmoothingEnabled = obj.antialiasing;
                }
                const x = obj.x;
                const y = obj.y;
                const displayAs = obj.displayAs || ('img' in obj? 'image' : 'shape');
                const scale = obj.scale || 1;
                //ctx.globalAlpha = typeof obj.opacity == 'number'? obj.opacity : 1;
                ctx.globalAlpha = typeof obj.opacity == 'number'? obj.opacity : 1;
                //ctx.globalAlpha = Math.max(0.3, ctx.globalAlpha)

                if ('color' in obj) {
                    ctx.fillStyle = obj.color;
                    ctx.strokeStyle = obj.color;
                }

                const axisX = x - (obj.width || 0) / 2;
                const axisY = y - (obj.height || 0)/ 2;

                const rotation = (obj.rotation || 0);// + (isHovered? 0.5: 0);

                //ctx.translate(-axisX, -axisY);
                //const center =  {x: obj.x + obj.width / 2, y: obj.y + obj.height / 2}
                const center =  obj.center || {x: obj.x, y: obj.y}
                //const center =  {x: 100, y: 100}
                ctx.translate(center.x, center.y);
                ctx.rotate(rotation);
                ctx.translate(-center.x + obj.x, -center.y + obj.y);
                //ctx.translate(obj.x, obj.y);
                if (scale != 1) ctx.scale(scale, scale);

                // ctx.translate(-center.x, -center.y);
                // ctx.translate(center.x, center.y);
                if ('fill' in obj) {
                    ctx.fillStyle = obj.fill;
                }

                if (obj.displayAs == 'pattern') {
                    const pattern = ctx.createPattern(obj.img, 'repeat');
                    ctx.fillStyle = pattern;
                }


                if (obj.render) {
                    obj.render(ctx);
                } else {
                    if (displayAs === 'text') {
                        const text = resolveText(obj);
                        ctx.save();
                        ctx.textBaseline = 'top'
                        if (obj.fontSize)
                            ctx.font = obj.fontSize + 'px sans-serif';


                        ctx.fillText(text, -obj.width/2, -obj.height/2);

                        const padding = 4;
                        ctx.fillStyle = 'rgba(10,80,120,0.4)';
                        //ctx.globalCompositeOperation = 'hue';
                        //ctx.fillRect(-obj.width/2-padding, -obj.height/2-padding, obj.width + 2 * padding, obj.height + 2 * padding);
                        ctx.restore();

                    } else if (displayAs === 'image') {
                        const w = obj.width * scale; // TODO!!!! we're scaling globally now!!!
                        const h = obj.height * scale;
                        // if (obj.showBoundingRect) {
                        //     ctx.save();
                        //     ctx.fillStyle = 'rgba(0,100,100,0.6)';
                        //     ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
                        //     ctx.restore();
                        // }
                        ctx.beginPath();
                        if ('sx' in obj || 'sy' in obj) {
                            ctx.drawImage(obj.img, ~~(obj.sx || 0), ~~(obj.sy || 0), obj.width, obj.height, ~~(-w/2), ~(-h/2), w, h);
                        } else {
                            ctx.drawImage(obj.img, ~~(-w/2), ~~(-h/2), w, h);
                        }
                    } else if (obj.shape === 'circle') {
                        ctx.beginPath();
                        ctx.arc(0, 0, obj.r, 0, Math.PI * 2, false);
                        ctx.closePath();
                        if ('color' in obj)
                            ctx.stroke();
                        ctx.fill();

                    } else if (obj.shape === 'rect' || displayAs === 'rect') {
                        //ctx.fillRect(~~obj.x, ~~obj.y, obj.width, obj.height);
                        //ctx.setLineDash([10, 10]);


                        //ctx.lineWidth = 2;
                        ctx.beginPath();
                        if ('color' in obj)
                            ctx.strokeRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
                        ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
                    } else if (displayAs === 'path' || obj.shape === 'polygon') {
                        ctx.lineCap = 'round';
                        if ('color' in obj) ctx.strokeStyle = obj.color;
                        if (obj.shape === 'polygon') {
                            ctx.lineWidth = 1;
                            // if (obj.img) {
                            //     const pattern = ctx.createPattern(obj.img, 'repeat');
                            //     ctx.fillStyle = pattern;
                            // }
                        } else {
                            if ('width' in obj) ctx.lineWidth = obj.width;
                        }
                        ctx.beginPath();
                        const points = obj.points;
                        ctx.moveTo( points[0].x,  points[0].y);

                        for (let i = 1; i < points.length; i++) {
                            ctx.lineTo(points[i].x, points[i].y);
                        }
                        ctx.closePath();

                        ctx.stroke();
                        if (obj.shape === 'polygon') ctx.fill();

                    }
                }

                ctx.restore();
            });
        }

        ctx.restore();
        //outCtx.fillStyle = 'rgba(0,0,0,0.6)';
        //outCtx.clearRect(0, 0, 800, 600);
        //ctx.beginPath();
        //outCtx.globalCompositeOperation = 'hue';





        this.ctx.drawImage(this.offscreenCanvas, 0, 0);

        // ctx.endPath();
        ctx.closePath();
        ctx.clearRect(0, 0, 800, 600);

        ctx.fillStyle = 'rgba(255,0,0,255)';


    }
}
