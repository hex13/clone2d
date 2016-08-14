'use strict';

function resolveRenderables(obj) {
    return obj.resolveRenderables? obj.resolveRenderables() : [obj];
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
    init({canvas, ctx}) {
    },
    render(ctx) {
        const objects = this.objects;

        const len = objects.length;

        for (let i = 0; i < len; i++) {
            var unresolvedObj = objects[i];
            const isHovered = this.model.isHovered? this.model.isHovered(unresolvedObj) : false;
            const renderables = resolveRenderables(unresolvedObj);
            renderables.forEach(obj => {
                ctx.save();

                const x = obj.x;
                const y = obj.y;
                const displayAs = obj.displayAs || 'image';
                //ctx.globalAlpha = typeof obj.opacity == 'number'? obj.opacity : 1;
                ctx.globalAlpha = typeof obj.opacity == 'number'? obj.opacity : 1;

                if ('color' in obj) ctx.fillStyle = obj.color;

                const axisX = x - (obj.width || 0) / 2;
                const axisY = y - (obj.height || 0)/ 2;

                const rotation = (obj.rotation || 0);// + (isHovered? 0.5: 0);

                //ctx.translate(-axisX, -axisY);
                //const center =  {x: obj.x + obj.width / 2, y: obj.y + obj.height / 2}
                const center =  {x: obj.x, y: obj.y}
                //const center =  {x: 100, y: 100}
                ctx.translate(center.x, center.y);
                ctx.rotate(rotation);
                // ctx.translate(-center.x, -center.y);
                // ctx.translate(center.x, center.y);


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

                    } else if (displayAs === 'rect') {
                        ctx.fillRect(~~obj.x, ~~obj.y, obj.width, obj.height);
                    } else if (displayAs === 'path') {

                        if ('color' in obj) ctx.strokeStyle = obj.color;
                        if ('width' in obj) ctx.lineWidth = obj.width;

                        ctx.beginPath();
                        const points = obj.points;
                        ctx.moveTo(x + points[0].x, y + points[0].y);

                        for (let i = 1; i < points.length; i++) {
                            ctx.lineTo(x + points[i].x, y + points[i].y);
                        }

                        ctx.stroke();

                    }
                }

                ctx.restore();
            });
        }
    }
}
