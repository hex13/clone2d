const startTime = +new Date;

const helpers = require('./helpers');
const createKeyFrames = helpers.createKeyFrames;

function resolvePrototype(obj) {
    const type = obj.type || obj.as;
    const proto = types[type];
    if (!proto) {
        console.error("couldn't find type: '" + type + "'");
        return;
    }
    return proto;

}

function resolveParams(data) {
    const params = data.from || data;
    const limitedParams = {};
    if (data.only) {
        data.only.forEach(p => limitedParams[p] = params[p]);
        return limitedParams;
    }
    return params;
}

const World = {
    t0: new Date,
    age:0,
    state: 'running',
    lapse(lapse) {
        if (this.state == 'running') {
            this.age += lapse;
        }
        this.state = 'running';
    },
    pause() {
        this.state = 'paused';
    },
    resume() {
        this.state = 'resuming';
    },

    createObject(data) {

        //const resolvedObject = resolveObject(params)
        // resolveData etc.
        const params = resolveParams(data);
        const proto = resolvePrototype(data);

        const obj = Object.create(proto);

        let aborted;
        if (obj.init) {
            aborted = obj.init(params)===false;
        }
        if (!aborted) {
            Object.assign(obj, params);///???? TODO this assigns only own properties :/

        }

        createKeyFrames(obj);

        if (!obj.hasOwnProperty('width') && obj.img) {
            obj.width = obj.img.width;
        }
        if (!obj.hasOwnProperty('height') && obj.img) {
            obj.height = obj.img.height;
        }

        obj.t0 = +new Date - startTime;
        obj.model = obj.world = this;//TODO remove obj.world
        obj.state = 'alive';
        obj.dead = false;


        this.objects.push(obj);
        if (this.afterCreateObject) {
            this.afterCreateObject(obj);
        }
        return obj;
    }

};

let types;
module.exports = function createModel(params) {
    params = params || {};
    types = params.types || {};
    const inst = Object.create(World);
    inst.objects = [];
    return inst;
}