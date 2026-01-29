export default /* glsl */ `
vec3 styleColor(vec3 basePos, float seedMix, float heightT){
  vec3 base = paletteGradient(uColorA, uColorB, heightT) * (uBrightness * 0.85);
  float f = pow(1.0 - clamp(dot(normalize(vViewDir), normalize(vNormalW)), 0.0, 1.0), 2.0);
  return base + f * 0.8 * uBrightness;
}
`;
