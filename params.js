import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export const DEFAULTS = {
  count: 8000,
  amp: 0.55,
  speed: 0.55,
  cubeScale: 1.0,
  spin: 0.85,
  stirOn: true,
  stirStrength: 1.2,
  stirRadius: 0.8,
  containerOn: true,
  variant: "default",
};

export const VOLUME = new THREE.Vector3(2.3, 1.5, 2.3);
export const CUBE_SIZE = 0.03;
