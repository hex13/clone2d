exports.createShader = function createShader(gl, type, code) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("createShader:", gl.getShaderInfoLog(shader));
    }

    return shader;

};

exports.createTexture = function createTexture(gl, img) {
    const tex = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    //gl.generateMipmap(gl.TEXTURE_2D); // non power-of-two textures can't do this.

    gl.bindTexture(gl.TEXTURE_2D, null);
    return tex;
}
