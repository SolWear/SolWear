// One instanced quad, drawn N thousand times. Each instance is shaded to read
// as an extruded voxel rather than a flat square: bright top-left bevel, dark
// bottom-right bevel.

export const VERT = `#version 300 es
in vec2 aCorner;
in vec4 aInst;   // x, y, size, alpha
in float aShade;
uniform vec2 uRes;
out vec2 vUv;
out float vAlpha;
out float vShade;
void main() {
  vec2 p = aInst.xy + aCorner * aInst.z;
  vec2 clip = (p / uRes) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  vUv = aCorner;
  vAlpha = aInst.w;
  vShade = aShade;
}`;

export const FRAG = `#version 300 es
precision mediump float;
in vec2 vUv;
in float vAlpha;
in float vShade;
uniform vec3 uColor;
out vec4 outColor;
void main() {
  float bevel = 0.28;
  float hi = max(step(vUv.y, bevel), step(vUv.x, bevel));
  float lo = max(step(1.0 - bevel, vUv.y), step(1.0 - bevel, vUv.x));
  float light = 1.0 + 0.5 * hi - 0.42 * lo;
  vec3 c = uColor * vShade * light;
  outColor = vec4(c * vAlpha, vAlpha); // premultiplied
}`;

export function compile(gl: WebGL2RenderingContext): WebGLProgram | null {
  const make = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error("[cubes] shader:", gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  };
  const vs = make(gl.VERTEX_SHADER, VERT);
  const fs = make(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("[cubes] link:", gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}
