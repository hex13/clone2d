exports.createKeyFrames = function createKeyFrames(obj, now = 0) {
    if (obj.keyframes) {
        obj.keyframes.forEach(
            (frame, i) => {
                const prevFrame = obj.keyframes[i - 1];
                const newFrame = Object.create(prevFrame || null);
                for (let prop in frame) {
                    newFrame[prop] = frame[prop];
                    // TODO interpolation of missing x, y etc.!
                }
                if (prevFrame && !('t' in frame)) {
                    newFrame.t = prevFrame.t + (obj.step || 1000);
                }
                obj.keyframes[i] = newFrame;
            }
        );
    }
    if (obj.keyframes && obj.keyframes.length && obj.keyframes[0].t != now) {
        // TODO DRY
        obj.keyframes.unshift({t:now, x: obj.x, y: obj.y, scale: obj.scale, opacity: obj.opacity, 'rotation': obj.rotation});
    }
}
