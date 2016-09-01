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
    return [
        obj,
    ];
}

function resolveText(obj) {
    return obj.getText? obj.getText() : obj.text;
}

module.exports = {
    resolveRenderables,
    resolveText,
};
