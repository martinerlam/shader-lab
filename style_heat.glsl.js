export default /* glsl */ `
vec3 styleColor(vec3 basePos, float seedMix, float heightT){
  float h = clamp(vHeat, 0.0, 1.0);
  vec3 cold = vec3(0.10, 0.35, 1.00);
  vec3 hot  = vec3(1.00, 0.10, 0.55);
  return mix(cold, hot, h) * uBrightness;
}
`;
