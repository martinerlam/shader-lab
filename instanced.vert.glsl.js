export default /* glsl */ `
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform vec3 cameraPosition;

attribute vec3 position;
attribute vec3 normal;
attribute mat4 instanceMatrix;

uniform float uTime;
uniform float uAmp;
uniform float uSpeed;
uniform float uSpin;
uniform float uCubeScale;

uniform float uStirOn;
uniform float uStirStrength;
uniform float uStirRadius;
uniform vec3  uPointerPos;
uniform vec3  uPointerVel;

uniform float uHeightMin;
uniform float uHeightMax;

varying float vSeedMix;
varying float vHeightT;
varying float vHeat;
varying vec3  vNormalW;
varying vec3  vViewDir;

const float FLOW_SCALE = 0.95;

void main(){
  vec3 transformed = position;
  vec3 base = instanceMatrix[3].xyz;

  float r1 = hash11(dot(base, vec3(12.9898, 78.233, 37.719)));
  float r2 = hash11(dot(base, vec3(39.3468, 11.135, 83.155)));

  float t = uTime * uSpeed + r1 * 10.0;

  vec3 p = base * FLOW_SCALE + vec3(r2, r1, r2) * 2.0;
  vec3 v1 = vortexField(p, t * 0.9);
  vec3 v2 = vortexField(p + v1 * 0.35, t * 0.9);
  vec3 flow = normalize(v1 + v2);

  vec3 stir = vec3(0.0);
  if (uStirOn > 0.5) {
    stir += stirVortex(base, uPointerPos, uPointerVel, uStirRadius, uStirStrength);
  }

  vec3 combined = normalize(flow + stir);

  transformed *= uCubeScale;
  transformed += combined * uAmp;

  float angY = t * uSpin + r2 * 6.2831853;
  float cy = cos(angY), sy = sin(angY);
  mat2 rotY = mat2(cy, -sy, sy, cy);
  transformed.xz = rotY * transformed.xz;

  float angX = t * (uSpin * 0.55) + r1 * 6.2831853;
  float cx = cos(angX), sx = sin(angX);
  mat2 rotX = mat2(cx, -sx, sx, cx);
  transformed.yz = rotX * transformed.yz;

  vSeedMix = r2;
  vHeightT = clamp((base.y - uHeightMin) / max(1e-3, (uHeightMax - uHeightMin)), 0.0, 1.0);
  vHeat = clamp(length(flow) * 0.65 + length(stir) * 0.25, 0.0, 1.0);

  vec3 nW = normalize(mat3(modelMatrix) * normal);
  vec4 wpos = modelMatrix * vec4(base + transformed, 1.0);
  vNormalW = nW;
  vViewDir = normalize(cameraPosition - wpos.xyz);

  gl_Position = projectionMatrix * viewMatrix * wpos;
}
`;
