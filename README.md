# clone2d
Data-driven declarative game engine for HTML5

Note: this is a new project. But keep watching. I'm coding this intensively.

Online demo: [https://hex13.github.io/apps/clone2d/](https://hex13.github.io/apps/clone2d/)

This engine is WIP. Documentation can be obsolete. When API and overall implementation will be ready for use, it will be announced (check my twitter: https://twitter.com/hex13code ).

The goals are:
====

* it should be simple and awesome.
* it should speed up rapid prototyping.
* it should be easy to tweak everything in a game.
* it should be easy to port games made in Clone2D.
* it should exist visual editor for making games in Clone2D.

it should be easy to port games made in Clone2D
====

Data driven approach can be helpful, if everything is data, then we just need find way to load this data in other environment and we have ported game).

So think about Clone2D more like platform, portable data format which describes game, levels and objects in game. Written once, could be ported everythere etc.

Although even in data driven approach it's hard to put everything as a data (think about event handlers. It's JavaScript runnable code), so porting will be easier if we port to other JavaScript framework, or at least if we have JavaScript engine on the platform we want to port to.


First you must put `<canvas id="engine"></canvas>` in your HTML (this is obsolete, check out HTML in demo). Then:

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
