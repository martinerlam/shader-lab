export default /* glsl */ `
vec3 paletteGradient(vec3 a, vec3 b, float t){
  return mix(a, b, clamp(t, 0.0, 1.0));
}
`;
