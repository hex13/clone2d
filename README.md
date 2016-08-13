# clone2d
Data-driven declarative game engine for HTML5

Note: this is a new project. But keep watching. I'm coding this intensively.

```javascript

const engine = require('clone2d')();

engine.createTypesFromImages([
    '../img/coin.png', '../img/car.png', '../img/component.png', '../img/cat.png',
]);

engine.world.createObject({
    type: 'coin',
    x: 400,
    y: 500
});

engine.world.createObject({
    type: 'coin',
    x: 400,
    y: 200,
    keyframes: [
        {t: 0, opacity: 0, scale: 1},
        {t: 2000, opacity: 1, scale: 2},
        {t: 4000, opacity: 0.5, scale: 1.3},
    ]
});


```
