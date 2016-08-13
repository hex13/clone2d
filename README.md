# clone2d
Data-driven declarative game engine for HTML5

Don't install for now.

```javascript

const createEngine = require('clone2d');

const engine = createEngine();

const img = new Image;
img.src = 'img/cat.png';

engine.createType('cat', {
    displayAs: 'image',
    img: img,
});


engine.world.createObject({
    type: 'cat',
    x: 100,
    y: 100,
    scale: 1,
    rotation: Math.PI,
    ttl: 4000, // time to live
    keyframes: [
        {t:1000, scale:1.2, opacity:1, x: 100, y: 200},
        {t:1000, scale:1.3, opacity: 0.3, x: 150, y: 300}
    ],
});


```
