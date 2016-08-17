'use strict';

function resolveRenderables(obj) {
    const handle = {
        color: 'rgba(255,255,0,0.5)',
        width: 20,
        height: 20,
    };
    return obj.resolveRenderables? obj.resolveRenderables() : [
        obj,
        {
            displayAs: 'rect',
            color: 'rgba(100,200,100,0.6)',
            fill: 'rgb(0,0,0,0)',
            x: obj.x ,
            y: obj.y,
            opacity: obj.opacity,
            width: obj.width,
            height: obj.height,
            center: obj,
            rotation: obj.rotation,
        },
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


exports.view = {
    getObjects() {
        return [];
    },
    get objects() {
        return this.getObjects();
    },
    init({canvas, ctx, viewport}) {
        //this.viewport = viewport;
        console.log("VV", this.viewport)
    },
    render(ctx) {
        const viewport = this.viewport || {x: 500, y: 500, rotation: 0, width: 1000, height: 1000};
        //const viewport = this.viewport || {x: 0, y: 0, rotation: 0};
        ctx.save();
        //ctx.translate(viewport.x + viewport.width / 2, viewport.y + viewport.height / 2)
        ctx.translate(viewport.x, viewport.y)
        ctx.rotate(viewport.rotation);
        ctx.translate(-viewport.x, -viewport.y)

        ctx.translate(viewport.x - viewport.width/2, viewport.y - viewport.height/2);

        const objects = this.objects;

        const len = objects.length;

        for (let i = 0; i < len; i++) {
            var unresolvedObj = objects[i];
            const isHovered = this.model.isHovered? this.model.isHovered(unresolvedObj) : false;
            const renderables = resolveRenderables(unresolvedObj);
            if (!renderables || !renderables.length) {
                continue;
            }
            renderables.forEach(obj => {
                ctx.save();

                const x = obj.x;
                const y = obj.y;
                const displayAs = obj.displayAs || 'image';
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
                
                // ctx.translate(-center.x, -center.y);
                // ctx.translate(center.x, center.y);
                if ('fill' in obj) {
                    ctx.fillStyle = obj.fill;
                }


                if (obj.render) {
                    obj.render(ctx);
                } else {
                    if (displayAs === 'text') {
                        ctx.fillText(resolveText(obj), 0, 0);

                    } else if (displayAs === 'image') {
                        const scale = obj.scale || 1;
                        const w = obj.width * scale;
                        const h = obj.height * scale;
                        if (obj.showBoundingRect) {
                            ctx.save();
                            ctx.fillStyle = 'rgba(0,100,100,0.6)';
                            ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, obj.height);
                            ctx.restore();
                        }
                        ctx.drawImage(obj.img, -w/2, -h/2, w, h);
                    } else if (displayAs === 'circle') {
                        ctx.beginPath();
                        ctx.arc(0, 0, obj.r, 0, Math.PI * 2, false);
                        ctx.stroke();
                        ctx.fill();
                    } else if (displayAs === 'rect') {
                        //ctx.fillRect(~~obj.x, ~~obj.y, obj.width, obj.height);
                        ctx.setLineDash([10, 10]);

                        ctx.lineWidth = 2;

                        ctx.strokeRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
                        ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
                    } else if (displayAs === 'path') {
                        ctx.lineCap = 'round';
                        if ('color' in obj) ctx.strokeStyle = obj.color;
                        if ('width' in obj) ctx.lineWidth = obj.width;

                        ctx.beginPath();
                        const points = obj.points;
                        ctx.moveTo( points[0].x,  points[0].y);

                        for (let i = 1; i < points.length; i++) {
                            console.log('PATH', x,y, points[i].x, points[i].y)
                            ctx.lineTo(points[i].x, points[i].y);
                        }

                        ctx.stroke();

                    }
                }

                ctx.restore();
            });
        }
        ctx.restore();
    }
}
