import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { DEFAULTS, VOLUME, CUBE_SIZE } from "./params.js";
import { safeAddGlobalErrorHandler } from "./util.js";
import { createOrbitAndStirControls } from "./controls.js";

import COMMON from "../shaders/lib/common.glsl.js";
import HASH from "../shaders/lib/hash.glsl.js";
import FLOW from "../shaders/lib/flow.glsl.js";
import INTERACTION from "../shaders/lib/interaction.glsl.js";
import COLOR from "../shaders/lib/color.glsl.js";

import VERT from "../shaders/passes/instanced.vert.glsl.js";
import FRAG from "../shaders/passes/instanced.frag.glsl.js";

import STYLE_DEFAULT from "../shaders/variants/style_default.glsl.js";
import STYLE_FRESNEL from "../shaders/variants/style_fresnel.glsl.js";
import STYLE_HEAT from "../shaders/variants/style_heat.glsl.js";

const canvas = document.getElementById("c");
const errEl = document.getElementById("err");
safeAddGlobalErrorHandler(errEl);

const logoEl = document.getElementById("logo");
logoEl?.addEventListener("error", () => logoEl.classList.add("hidden"));

const ui = {
  fps: document.getElementById("fps"),
  gpu: document.getElementById("gpu"),
  variant: document.getElementById("variant"),
  count: document.getElementById("count"),
  countV: document.getElementById("countV"),
  amp: document.getElementById("amp"),
  ampV: document.getElementById("ampV"),
  speed: document.getElementById("speed"),
  speedV: document.getElementById("speedV"),
  cubeScale: document.getElementById("cubeScale"),
  cubeScaleV: document.getElementById("cubeScaleV"),
  spin: document.getElementById("spin"),
  spinV: document.getElementById("spinV"),
  stirOn: document.getElementById("stirOn"),
  stirStrength: document.getElementById("stirStrength"),
  stirStrengthV: document.getElementById("stirStrengthV"),
  stirRadius: document.getElementById("stirRadius"),
  stirRadiusV: document.getElementById("stirRadiusV"),
  containerOn: document.getElementById("containerOn"),
  reset: document.getElementById("reset"),
  pause: document.getElementById("pause"),
  diag: document.getElementById("diag"),
};

const state = structuredClone(DEFAULTS);

function setText(el, v){ if (el) el.textContent = v; }

let rebuildNeeded = true;
let uniformsDirty = true;

function bindRange(el, out, key, fmt=2){
  const apply = () => {
    state[key] = parseFloat(el.value);
    setText(out, (fmt === 0) ? String(Math.round(state[key])) : state[key].toFixed(fmt));
  };
  el.addEventListener("input", () => { apply(); uniformsDirty = true; });
  apply();
}
function bindIntRange(el, out, key){
  const apply = () => {
    state[key] = parseInt(el.value, 10);
    setText(out, String(state[key]));
  };
  el.addEventListener("input", () => { apply(); rebuildNeeded = true; });
  apply();
}
function bindToggle(el, key){
  const apply = () => state[key] = !!el.checked;
  el.addEventListener("change", () => { apply(); uniformsDirty = true; });
  apply();
}
function bindSelect(el, key){
  const apply = () => state[key] = el.value;
  el.addEventListener("change", () => { apply(); rebuildNeeded = true; });
  apply();
}

bindSelect(ui.variant, "variant");
bindIntRange(ui.count, ui.countV, "count");
bindRange(ui.amp, ui.ampV, "amp");
bindRange(ui.speed, ui.speedV, "speed");
bindRange(ui.cubeScale, ui.cubeScaleV, "cubeScale");
bindRange(ui.spin, ui.spinV, "spin");
bindToggle(ui.stirOn, "stirOn");
bindRange(ui.stirStrength, ui.stirStrengthV, "stirStrength");
bindRange(ui.stirRadius, ui.stirRadiusV, "stirRadius");
bindToggle(ui.containerOn, "containerOn");

ui.reset.addEventListener("click", () => randomizeInstances());
ui.diag.addEventListener("click", () => window.open("./diagnostic.html", "_blank"));

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x06070a, 1);
renderer.debug.checkShaderErrors = true;

const gl = renderer.getContext();
const dbgInfo = gl.getExtension("WEBGL_debug_renderer_info");
let gpuStr = "unknown";
if (dbgInfo) gpuStr = gl.getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL) || gpuStr;
setText(ui.gpu, "GPU: " + gpuStr);

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x06070a, 0.10);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.01, 200);
const target = new THREE.Vector3(0,0,0);
const controls = createOrbitAndStirControls({ canvas, camera, target });

scene.add(new THREE.AmbientLight(0xffffff, 0.35));

// Container
const containerGroup = new THREE.Group();
scene.add(containerGroup);
function buildContainer(){
  containerGroup.clear();
  const g = new THREE.BoxGeometry(VOLUME.x*2, VOLUME.y*2, VOLUME.z*2);
  const m = new THREE.MeshBasicMaterial({ color:0xffffff, wireframe:true, transparent:true, opacity:0.35 });
  containerGroup.add(new THREE.Mesh(g, m));
}
buildContainer();

// Instanced cubes
const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
let mesh = null;
let material = null;

function selectStyle(){
  if (state.variant === "fresnel") return STYLE_FRESNEL;
  if (state.variant === "heat") return STYLE_HEAT;
  return STYLE_DEFAULT;
}

function composeShaders(){
  const style = selectStyle();
  const vertexShader = COMMON + HASH + FLOW + INTERACTION + COLOR + VERT;
  const fragmentShader = COMMON + COLOR + style + FRAG;
  return { vertexShader, fragmentShader };
}

function makeMaterial(){
  const { vertexShader, fragmentShader } = composeShaders();

  return new THREE.RawShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0.0 },
      uAmp: { value: state.amp },
      uSpeed: { value: state.speed },
      uSpin: { value: state.spin },
      uCubeScale: { value: state.cubeScale },

      uStirOn: { value: state.stirOn ? 1.0 : 0.0 },
      uStirStrength: { value: state.stirStrength },
      uStirRadius: { value: state.stirRadius },
      uPointerPos: { value: new THREE.Vector3() },
      uPointerVel: { value: new THREE.Vector3() },

      uHeightMin: { value: -VOLUME.y },
      uHeightMax: { value:  VOLUME.y },

      uColorA: { value: new THREE.Color("#3aa0ff") },
      uColorB: { value: new THREE.Color("#ff3a8a") },
      uBrightness: { value: 1.0 },
    },
  });
}

function rebuild(){
  if (mesh) scene.remove(mesh);
  if (material) material.dispose();

  material = makeMaterial();
  mesh = new THREE.InstancedMesh(geometry, material, state.count);
  mesh.frustumCulled = false;
  scene.add(mesh);

  randomizeInstances();
  rebuildNeeded = false;
  uniformsDirty = true;
}

function randomizeInstances(){
  if (!mesh) return;
  const dummy = new THREE.Object3D();
  for (let i=0; i<state.count; i++){
    dummy.position.set(
      (Math.random()*2 - 1) * VOLUME.x,
      (Math.random()*2 - 1) * VOLUME.y,
      (Math.random()*2 - 1) * VOLUME.z
    );
    dummy.rotation.set(0,0,0);
    dummy.scale.set(1,1,1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}

// Pause
let paused = false;
let frozenT = 0;
function setPauseLabel(){ ui.pause.textContent = paused ? "Resume (Space)" : "Pause (Space)"; }
ui.pause.addEventListener("click", () => { paused = !paused; setPauseLabel(); });
setPauseLabel();

addEventListener("keydown", (e) => {
  if (e.repeat) return;
  const k = e.key.toLowerCase();
  if (k === " ") { e.preventDefault(); paused = !paused; setPauseLabel(); }
  else if (k === "r") { randomizeInstances(); }
});

// Resize
function resize(){
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();

// FPS
let frames = 0;
let fpsLast = performance.now();
function tickFPS(){
  frames++;
  const now = performance.now();
  const dt = now - fpsLast;
  if (dt >= 400) {
    setText(ui.fps, "FPS: " + (frames * 1000 / dt).toFixed(0));
    frames = 0;
    fpsLast = now;
  }
}

// Loop
const clock = new THREE.Clock();

function animate(){
  requestAnimationFrame(animate);

  if (rebuildNeeded) rebuild();

  containerGroup.visible = !!state.containerOn;

  const t = paused ? frozenT : clock.getElapsedTime();
  if (!paused) frozenT = t;

  if (uniformsDirty && material) {
    material.uniforms.uAmp.value = state.amp;
    material.uniforms.uSpeed.value = state.speed;
    material.uniforms.uSpin.value = state.spin;
    material.uniforms.uCubeScale.value = state.cubeScale;
    material.uniforms.uStirOn.value = state.stirOn ? 1.0 : 0.0;
    material.uniforms.uStirStrength.value = state.stirStrength;
    material.uniforms.uStirRadius.value = state.stirRadius;
    uniformsDirty = false;
  }

  const { isStir, pointerWorld, pointerVel } = controls.getStirState();
  if (material) {
    material.uniforms.uTime.value = t;
    material.uniforms.uPointerPos.value.copy(pointerWorld);
    material.uniforms.uPointerVel.value.copy(pointerVel);
    if (!isStir) material.uniforms.uPointerVel.value.multiplyScalar(0.85);
  }

  renderer.render(scene, camera);
  tickFPS();
}
animate();
