import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const out = document.getElementById("out");
const canvas = document.getElementById("c");

function line(s){ out.innerHTML += s + "<br/>"; }
function ok(label, value){ line(`<span class="ok">✅ ${label}</span> <span class="small">${value ?? ""}</span>`); }
function bad(label, value){ line(`<span class="bad">❌ ${label}</span> <span class="small">${value ?? ""}</span>`); }

out.innerHTML = "";

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
  ok("WebGL renderer", "created");
} catch (e) {
  bad("WebGL renderer", e.message || String(e));
  throw e;
}

renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x06070a, 1);

const gl = renderer.getContext();
const webgl2 = (gl instanceof WebGL2RenderingContext);
ok("WebGL version", webgl2 ? "WebGL2" : "WebGL1");
ok("Three.js revision", THREE.REVISION);

const dbgInfo = gl.getExtension("WEBGL_debug_renderer_info");
if (dbgInfo) {
  ok("GPU vendor", gl.getParameter(dbgInfo.UNMASKED_VENDOR_WEBGL));
  ok("GPU renderer", gl.getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL));
} else {
  ok("GPU info", "WEBGL_debug_renderer_info not available");
}

ok("MAX_TEXTURE_SIZE", gl.getParameter(gl.MAX_TEXTURE_SIZE));
ok("MAX_VERTEX_UNIFORM_VECTORS", gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS));
ok("Float textures", gl.getExtension("OES_texture_float") ? "yes" : "no");
ok("Float linear", gl.getExtension("OES_texture_float_linear") ? "yes" : "no");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.01, 200);
camera.position.set(4,3,5);
camera.lookAt(0,0,0);

scene.add(new THREE.DirectionalLight(0xffffff, 1.0));

const geo = new THREE.BoxGeometry(0.03,0.03,0.03);
const mat = new THREE.MeshStandardMaterial({ color:0x7CFFA6 });
const count = 5000;
const mesh = new THREE.InstancedMesh(geo, mat, count);
mesh.frustumCulled = false;
scene.add(mesh);

const dummy = new THREE.Object3D();
for (let i=0;i<count;i++){
  dummy.position.set((Math.random()*2-1)*2.3, (Math.random()*2-1)*1.5, (Math.random()*2-1)*2.3);
  dummy.updateMatrix();
  mesh.setMatrixAt(i, dummy.matrix);
}
mesh.instanceMatrix.needsUpdate = true;

ok("InstancedMesh", `created (${count} instances)`);
renderer.render(scene, camera);
ok("Render", "frame rendered");

line("<br/><span class='small'>If you see green cubes on black, instancing + GPU path is good.</span>");
line("<span class='small'>Back to app: <a href='./index.html'>index.html</a></span>");

addEventListener("resize", () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
});
