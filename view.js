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
            const renderables = resolveRenderables(unresolvedObj);
            renderables.forEach(obj => {
                ctx.save();

                const x = obj.x;
                const y = obj.y;
                const displayAs = obj.displayAs || 'image';
                ctx.globalAlpha = typeof obj.opacity == 'number'? obj.opacity : 1;

                if (obj.rotation) {
                    ctx.translate(x, y);
                    ctx.rotate(obj.rotation);
                    ctx.translate(-x, -y);
                }

                if (obj.render) {
                    obj.render(ctx);
                } else {
                    if (displayAs === 'text') {
                        if ('color' in obj) ctx.fillStyle = obj.color;
                        ctx.fillText(resolveText(obj), obj.x, obj.y);

                    } else if (displayAs === 'image') {
                        const scale = obj.scale || 1;
                        const w = obj.img.width * scale;
                        const h = obj.img.height * scale;
                        ctx.drawImage(obj.img, ~~obj.x, ~~obj.y, w, h);

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
