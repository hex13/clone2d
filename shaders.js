const fragmentShader = `
uniform bool isCircle;
uniform highp vec4 color;
uniform sampler2D sampler;
uniform lowp float opacity;
uniform lowp float time;


varying highp vec2 texCoords;

uniform bool isTextured;

void main(void) {
    if (isTextured)
        gl_FragColor = texture2D(sampler, texCoords);
    else
        gl_FragColor = color;//vec4(1.0, 1.0, 1.0, 1.0);

    gl_FragColor[3] *= opacity;
    // 
    // if (isCircle) {
    //     lowp float distSq = ((texCoords[0] - 0.5) * (texCoords[0] - 0.5) +
    //                   (texCoords[1] - 0.5) * (texCoords[1] - 0.5));
    //
    //     if (distSq > 0.25)
    //         gl_FragColor[3] = 0.0;
    //     else if (distSq > 0.10)
    //         gl_FragColor[3] *= 0.9;
    // }

    if (isCircle)
        gl_FragColor[3] *=
            1.0 -
            3.0 * (
                (texCoords[0] - 0.5) * (texCoords[0] - 0.5) +
                (texCoords[1] - 0.5) * (texCoords[1] - 0.5)
            );

}
`;

const vertexShader = `
attribute vec3 p1;
uniform lowp float aspect;
uniform vec2 pos;
uniform vec2 size;

varying highp vec2 texCoords;
uniform lowp float time;
uniform lowp float rotation;

void main(void) {
    gl_Position = vec4(p1, 1.0);


    gl_Position[0] *= size[0];
    gl_Position[1] *= size[1] / aspect;

    //gl_Position[1] += sin((time + pos[0] + p1[0] * size[0])*8.0) * 0.1;

    vec4 tmp = gl_Position;
    highp float x = gl_Position[0];
    highp float y = gl_Position[1];
    highp float angle = rotation;
    tmp.x = x * cos(angle) - y * sin(angle);
    tmp.y = (x * sin(angle) + y * cos(angle)) * aspect;


    //tmp[0] /= 800.0/600.0;



    gl_Position = tmp;

    //gl_Position[1] *= aspect;



    gl_Position[0] += pos[0];
    gl_Position[1] += pos[1];

    //texCoords = vec2(p1[0] / 2.0 + 0.5, -p1[1] / 2.0 + 0.5);
    texCoords = vec2(p1) * -0.5 + 0.5;
        //vec4(p[0], p[1], 0.0, 1.0);
}
`;

module.exports = {
    fragmentShader,
    vertexShader
};
