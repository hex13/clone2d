'use strict';

const resolvers = require('./resolvers');
const resolveRenderables = resolvers.resolveRenderables;
const resolveText = resolvers.resolveText;

const shaders = require('./shaders');

const {
    createShader,
    createTexture,
} = require('./webgl-helpers');

const DEFAULT_VIEWPORT = {
    x: 400, y: 300, width: 800, height: 600, scale: 1
};
exports.view = {
    emit(name, event) {

        const viewEvent = Object.create(event);
        const camera = this.camera;

        const cos = Math.cos(camera.rotation);
        const sin = Math.sin(camera.rotation);


        let {x, y} = viewEvent;

        x -= this.viewport.width / 2;
        y -= this.viewport.height / 2;

        x /= camera.scale;
        y /= camera.scale;



        const newX = x * cos - y * sin;
        const newY = x * sin + y * cos;

        x = x * cos - y * sin;
        y = x * sin + y * cos;

        x = newX;
        y = newY;

        // x += this.viewport.width / 2;
        // y += this.viewport.height / 2;
        //
        //
        x += camera.x;
        y += camera.y;



        // x += this.viewport.width / 2;
        // y += this.viewport.height / 2;





        viewEvent.x = x;
        viewEvent.y = y;
        if (this[name]) {

            this[name](viewEvent);
        }
    },
    getObjects() {
        return [];
    },
    get objects() {
        return this.getObjects();
    },
    init({viewport, antialiasing = true, el}) {
        this.id = ~~(Math.random()*10000) + 1;
        // if (window.viewId) {
        //     console.log("RET");
        //     return;
        // }
        window.viewId = this.id;
        console.log("ID:", this.id);
        this.viewport = this.viewport || DEFAULT_VIEWPORT;
        //console.log("VV", this.viewport);
        this.camera = this.camera || {x: 0, y: 0, rotation: 0, scale: 1};
        this.color = ['red', 'green','blue', 'white'][~~(Math.random()*4)];
        this.antialiasing = antialiasing;

        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        canvas.style.display = 'block';
        el.appendChild(canvas);

        const gl = this.gl = canvas.getContext('webgl', {
            premultipliedAlpha: false,//false,
            alpha: true,
            antialias: true,//true,
        });

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);


        this.t0 = +new Date;

        const program = this.program = gl.createProgram();
        gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, shaders.fragmentShader));
        gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, shaders.vertexShader));
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("createProgram:", gl.getProgramInfoLog(program));
        }

        gl.useProgram(program);


        var posAttribute = gl.getAttribLocation(this.program, "p1");
        gl.enableVertexAttribArray(posAttribute);

        const vertices = this.vertices =  [
            -1.0, 1.0, 0,
            -1.0, -1.0, 0,
            1.0, 1.0, 0,
            1.0, -1.0, 0,
        ];

        const buff = this.buff = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buff);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        gl.vertexAttribPointer(posAttribute, 3, gl.FLOAT, false, 0, 0); //!!!posAttribute

        this.textures = Object.create(null);

        this.uniforms = {
            opacity: gl.getUniformLocation(this.program, "opacity"),
            sampler: gl.getUniformLocation(this.program, "sampler"),
            isTextured: gl.getUniformLocation(this.program, "isTextured"),
            aspect: gl.getUniformLocation(this.program, "aspect"),
            pos: gl.getUniformLocation(this.program, "pos"),
            size: gl.getUniformLocation(this.program, "size"),
            color: gl.getUniformLocation(this.program, "color"),
            time: gl.getUniformLocation(this.program, "time"),
            isCircle: gl.getUniformLocation(this.program, "isCircle"),
            rotation: gl.getUniformLocation(this.program, "rotation"),
        };

    },
    _getTexture(img) {
        const key = img.src;
        if (this.textures[key])
            return this.textures[key];
        console.log("kreowanie", key);

        const texture = createTexture(this.gl, img);
        this.textures[key] = texture;
        return texture;
    },
    render() {
        //if (this.id !== window.viewId) return;
        //if (Math.random()<0.01) console.log("ILOSC", this.model.objects.length)
        const gl = this.gl;
        const age = new Date - this.t0;
        const fsin = age => Math.sin(age * 0.01) * 0.25 + 0.75;
        const fcos = age => Math.cos(age * 0.01) * 0.25 + 0.75;
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        this.objects.forEach(unresolvedObj => {

            let renderables = resolveRenderables(unresolvedObj);
            if (!renderables) {
                return;
            }
            if (!(renderables instanceof Array)) {
                renderables = [renderables];
            }
            if(!renderables.length) {
                return;
            }
            renderables.forEach(o => {
                const vw = 800;
                const vh = 600;
                const cx = this.camera.x / vw * 2;
                const cy = this.camera.y / vh * 2;

                let w, h;
                if (o.shape == 'circle') {
                    w = h = o.r * 2;// / 2;
                } else {
                    w = o.width;
                    h = o.height;
                }
                if (o.fill) {
                // TODO
                }

                let isTextured;
                if (o.img && (o.displayAs || 'image') == 'image') {
                    let texture = this._getTexture(o.img);
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.activeTexture(gl.TEXTURE0);
                    isTextured = true;
                } else {
                    gl.bindTexture(gl.TEXTURE_2D, null);
                    isTextured = false;
                }
                const rc = () => 1.0;//Math.random();

                let color;
                if (o.fill && o.fill.indexOf('rgb(') != -1) {
                    color = o.fill.match(/\((.*?)\)/)[1].split(',').map(v => parseFloat(v) / 256);
                    color.push(1.0);
                } else if (o.color && o.color.indexOf('rgb(') != -1) {
                    color = o.fill.match(/\((.*?)\)/)[1].split(',').map(v => parseFloat(v) / 256);
                    color.push(1.0);
                } else
                    color = [rc(), rc(), rc(), Math.max(0, o.opacity || 1)];

                gl.uniform1f(this.uniforms.opacity, 'opacity' in o? o.opacity : 1.0);
                gl.uniform1i(this.uniforms.sampler, 0);
                gl.uniform1i(this.uniforms.isCircle, o.shape == 'circle');
                gl.uniform1i(this.uniforms.isTextured, isTextured);
                gl.uniform1f(this.uniforms.aspect, 800/600);
                gl.uniform2f(this.uniforms.pos, o.x / vw * 2 - cx , - o.y / vh * 2 + cy);
                gl.uniform2f(this.uniforms.size, w / 800, h / 600);
                gl.uniform1f(this.uniforms.time, age / 2000);
                gl.uniform1f(this.uniforms.rotation, o.rotation || 0.0);





                gl.uniform4f.apply(gl, [this.uniforms.color].concat(color) );
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            });
        });
        //gl.bindBuffer(gl.ARRAY_BUFFER, this.buff);


        // gl.clearColor(fsin(age), fcos(age), fcos(age + 100), 0.1);
        // gl.clearColor(0.0, 0.0, 0.0, 0.1);

    },
    hide() {
        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
}
