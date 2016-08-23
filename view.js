'use strict';

function resolveRenderables(obj) {
    const handle = {
        color: 'rgba(255,255,0,0.5)',
        width: 20,
        height: 20,
    };
    if (obj.resolveRenderables)
        return obj.resolveRenderables();

    if (obj.shape == 'rope') {
        return {
            displayAs: 'path',
            color: obj.color,
            fill: obj.fill,
            width: obj.width,
            x: 0,
            y: 0,//this.y,
            points: obj.points,
        }
    }
    // if (obj.displayAs == 'rope') {
    //     const res = [];
    //     for (let i = 1; i < obj.points.length; i++) {
    //         const curr = obj.points[i];
    //         const prev = obj.points[i -1];
    //         const dx = curr.x - prev.x;
    //         const dy = curr.y - prev.y;
    //         //for (let x = prev.x, y = prev.y; x < curr.x || y < curr.y; ) {
    //         for (let j = 0; j < 10; j++) {
    //             res.push({
    //                 displayAs: 'rect',
    //                 width: 4,
    //                 height: 4,
    //                 color: 'rgba(100,200,100,0.7)',
    //                 // rotation: obj.rotation,
    //                 // center: obj,
    //                 x: obj.x + prev.x + j * dx / 10,
    //                 y: obj.y + prev.y + j * dy / 10
    //             });
    //         }
    //     }
    //     return res;
    //     return obj.points.map(p => ({
    //         displayAs: 'rect',
    //         width: 5,
    //         height: 5,
    //         color: 'red',
    //         x: obj.x + p.x,
    //         y: obj.y + p.y
    //     }))
    // }
    return [
        obj,
        // {
        //     displayAs: 'rect',
        //     color: 'rgba(100,200,100,0.6)',
        //     fill: 'rgb(0,0,0,0)',
        //     x: obj.x ,
        //     y: obj.y,
        //     opacity: obj.opacity,
        //     width: obj.width,
        //     height: obj.height,
        //     center: obj,
        //     rotation: obj.rotation,
        // },
        //
        // {
        //     displayAs: 'rect',
        //     x: obj.x - obj.width/2,
        //     y: obj.y - obj.height/2,
        //     width: handle.width,
        //     height: handle.height,
        //     center: obj,
        //     rotation: obj.rotation,
        //     color: handle.color,
        // },
        // {
        //     displayAs: 'rect',
        //     x: obj.x + obj.width/2,
        //     y: obj.y - obj.height/2,
        //     width: handle.width,
        //     height: handle.height,
        //     center: obj,
        //     rotation: obj.rotation,
        //     color: handle.color,
        // },
        // {
        //     displayAs: 'rect',
        //     x: obj.x + obj.width/2,
        //     y: obj.y + obj.height/2,
        //     width: handle.width,
        //     height: handle.height,
        //     center: obj,
        //     rotation: obj.rotation,
        //     color: handle.color,
        // },
        // {
        //     displayAs: 'rect',
        //     x: obj.x - obj.width/2,
        //     y: obj.y + obj.height/2,
        //     width: handle.width,
        //     height: handle.height,
        //     center: obj,
        //     rotation: obj.rotation,
        //     color: handle.color,
        // },

    ];
}

function resolveText(obj) {
    return obj.getText? obj.getText() : obj.text;
}

const DEFAULT_VIEWPORT = {
    x: 400, y: 300, width: 800, height: 600, scale: 1
};
exports.view = {
    emit(name, event) {
        const viewport = this.viewport || DEFAULT_VIEWPORT;

        const viewEvent = Object.create(event);

        viewEvent.x = (event.x - (viewport.x - viewport.width/2)) / viewport.scale;
        viewEvent.y = (event.y - (viewport.y - viewport.height/2)) / viewport.scale;

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
    init({canvas, ctx, viewport, antialiasing = true}) {
        this.viewport = this.viewport || DEFAULT_VIEWPORT;
        //console.log("VV", this.viewport);
        this.camera = {x: 0, y: 0, rotation: 0};
        this.color = ['red', 'green','blue', 'white'][~~(Math.random()*4)];
        this.antialiasing = antialiasing;

    },
    render(ctx) {
        const viewport = this.viewport || {x: 400, y: 300, rotation: 0, width: 800, height: 600, scale: 1};
        const camera = this.camera;
        //const viewport = this.viewport || {x: 0, y: 0, rotation: 0};
        ctx.save();
        ctx.imageSmoothingEnabled = this.antialiasing;

        //ctx.translate(viewport.x + viewport.width / 2, viewport.y + viewport.height / 2)
        ctx.translate(viewport.x, viewport.y)
        ctx.rotate(viewport.rotation);
        ctx.translate(-viewport.x, -viewport.y)

        ctx.translate(viewport.x - viewport.width/2, viewport.y - viewport.height/2);


        ctx.scale(viewport.scale, viewport.scale);

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
                const displayAs = obj.displayAs || 'image';
                const scale = obj.scale || 1;
                //ctx.globalAlpha = typeof obj.opacity == 'number'? obj.opacity : 1;
                ctx.globalAlpha = typeof obj.opacity == 'number'? obj.opacity : 1;

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
                ctx.translate(-center.x, -center.y);
                ctx.translate(obj.x, obj.y);
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
                        ctx.globalCompositeOperation = 'hue';
                        ctx.fillRect(-obj.width/2-padding, -obj.height/2-padding, obj.width + 2 * padding, obj.height + 2 * padding);
                        ctx.restore();

                    } else if (displayAs === 'image') {
                        const w = obj.width * scale; // TODO!!!! we're scaling globally now!!!
                        const h = obj.height * scale;
                        if (obj.showBoundingRect) {
                            ctx.save();
                            ctx.fillStyle = 'rgba(0,100,100,0.6)';
                            ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
                            ctx.restore();
                        }
                        if ('sx' in obj || 'sy' in obj) {
                            ctx.drawImage(obj.img, obj.sx || 0, obj.sy || 0, obj.width, obj.height, -w/2, -h/2, w, h);
                        } else {
                            ctx.drawImage(obj.img, -w/2, -h/2, w, h);
                        }
                    } else if (obj.shape === 'circle') {
                        ctx.beginPath();
                        ctx.arc(0, 0, obj.r, 0, Math.PI * 2, false);
                        ctx.stroke();
                        ctx.fill();
                    } else if (obj.shape === 'rect' || displayAs === 'rect') {
                        //ctx.fillRect(~~obj.x, ~~obj.y, obj.width, obj.height);
                        //ctx.setLineDash([10, 10]);


                        ctx.lineWidth = 2;

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

                        ctx.stroke();
                        if (obj.shape === 'polygon') ctx.fill();
                    }
                }

                ctx.restore();
            });
        }
        ctx.restore();
    }
}
