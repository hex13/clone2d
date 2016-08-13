exports.modOpacity = {
    name: 'opacity',
    patch(obj) {
        obj.opacity = 0.1;
        obj.keyframes = [];
    }
};
