const fragmentShader = `
uniform highp vec4 color;
void main(void) {
    gl_FragColor = color;//vec4(1.0, 1.0, 1.0, 1.0);
}
`;

const vertexShader = `
attribute vec3 p1;
uniform lowp float aspect;
uniform vec2 pos;
uniform vec2 size;
void main(void) {
    gl_Position = vec4(p1, 1.0);
    gl_Position[1] *= aspect / aspect;
    gl_Position[0] *= size[0];
    gl_Position[1] *= size[1];
    gl_Position[0] += pos[0];
    gl_Position[1] += pos[1];
        //vec4(p[0], p[1], 0.0, 1.0);
}
`;

module.exports = {
    fragmentShader,
    vertexShader
};
