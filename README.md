# clone2d
Data-driven declarative game engine for HTML5

Note: this is a new project. But keep watching. I'm coding this intensively.

Online demo: [hex13.github.io/apps/clone2d/](hex13.github.io/apps/clone2d/)

First you must put `<canvas id="engine"></canvas>` in your HTML. Then:

```javascript
const engine = require('clone2d')();

engine.createTypesFromImages([
    '../img/coin.png', '../img/car.png', '../img/component.png', '../img/cat.png',
]);

engine.run(() => {

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

    engine.world.createObject({
        type: 'cat',
        x: 300,
        y: 300,
        onMouseOver() {
            this.opacity = 0.3
            this.scale = 2;
        },
        onMouseOut() {
            this.opacity = 1;
            this.scale = 1;
        }
    });

});
```
