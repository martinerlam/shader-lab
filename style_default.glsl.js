export default /* glsl */ `
vec3 styleColor(vec3 basePos, float seedMix, float heightT){
  return paletteGradient(uColorA, uColorB, heightT) * uBrightness;
}
`;
