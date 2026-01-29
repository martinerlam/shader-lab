export default /* glsl */ `
vec3 vortexField(vec3 p, float t){
  float a = sin(p.y + t) + cos(p.z * 1.3 - t * 0.7);
  float b = sin(p.z + t * 0.9) + cos(p.x * 1.1 + t * 0.6);
  float c = sin(p.x - t * 0.8) + cos(p.y * 1.2 + t * 0.5);
  vec3 v = vec3(a - b, b - c, c - a);
  return normalize(v + 1e-6);
}
`;
