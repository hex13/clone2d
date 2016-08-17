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
};

exports.toCSSObject = function (obj) {
    // TODO returns CSS representation. maybe not text but object w/ css properties
    // it can be transformed to text later
}
    // when recording - maybe to use bezier's paths for make it more smooth?
// TODO coord units
/*
{
    type: 'cat',
    coordUnit: 'px' // default
    coordUnit: '%', //
    x: 100,
    y: 200
}
*/
/*
input:
{x: 0, y: 10, img: img, keyframes: [{t:100, x:100}]}

output:
[
'.${prefix}-${obj.type}',
{
position: 'absolute'
left: 0,
top: 10,
background: `url(${img.src})`
animation-name: 'foo1'
},

'@keyframes foo1',
{
   100: {
     left: 100,
  }
}



]
*/
