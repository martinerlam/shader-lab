export default /* glsl */ `
vec3 stirVortex(vec3 p, vec3 center, vec3 vel, float radius, float strength){
  vec3 d = p - center;
  float dist = length(d);
  float s = exp(- (dist*dist) / max(1e-4, radius*radius));
  vec3 vdir = normalize(vel + vec3(0.0001));
  vec3 axis = normalize(vec3(-vdir.y, vdir.x, 0.35));
  vec3 swirl = cross(axis, normalize(d + 1e-6));
  float vmag = clamp(length(vel) * 0.12, 0.0, 2.5);
  return swirl * (strength * s * vmag);
}
`;
