export default /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uBrightness;

varying float vSeedMix;
varying float vHeightT;
varying float vHeat;
varying vec3  vNormalW;
varying vec3  vViewDir;

void main(){
  vec3 col = styleColor(vec3(0.0), vSeedMix, vHeightT);

  vec3 N = normalize(vNormalW);
  vec3 V = normalize(vViewDir);

  vec3 L = normalize(vec3(0.45, 0.85, 0.35));
  float ndl = max(dot(N, L), 0.0);

  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 64.0) * 0.20;

  vec3 lit = col * (0.25 + 0.85 * ndl) + spec;

  float d = gl_FragCoord.z;
  lit *= (1.0 - 0.15 * smoothstep(0.2, 1.0, d));

  gl_FragColor = vec4(lit, 1.0);
}
`;
