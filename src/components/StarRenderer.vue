<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ref, onMounted } from "vue";

// define ref for division
const mycanvas = ref<HTMLInputElement | null>(null);

// setup camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 4);

// create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// setup ambient light
const ambientLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
scene.add(ambientLight);

// setup directional light
const directionalLight = new THREE.DirectionalLight();
directionalLight.position.set(0.2, 1, 1);
scene.add(directionalLight);

// create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// create a geometry
const star = createStarGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const mesh = new THREE.Mesh(star, material);
scene.add(mesh);

// add user controls
new OrbitControls(camera, renderer.domElement);

// create star
function createStarGeometry(innerRadius = 0.4, outerRadius = 0.8, points = 5) {
  const shape = new THREE.Shape();
  const pi2 = Math.PI * 2;
  const inc = pi2 / (points * 2); // angle between each lines

  // draw lines starting from outer
  shape.moveTo(outerRadius, 0);
  let inner = true;

  for (let theta = inc; theta < pi2; theta += inc) {
    const radius = inner ? innerRadius : outerRadius;
    shape.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
    inner = !inner;
  }

  // settings for geometry
  const extrudeSettings = {
    steps: 1,
    depth: 1,
    bevelEnabled: false,
  };
  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

// render the scene
function renderScene() {
  star.rotateX(0.01);
  renderer.render(scene, camera);
}

// resize the scene
function resizeScene() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// attach renderer to dom
onMounted(() => {
  if (mycanvas.value) {
    mycanvas.value.appendChild(renderer.domElement);
    renderer.setAnimationLoop(renderScene);
    window.addEventListener("resize", resizeScene);
  }
});
</script>

<template>
  <div ref="mycanvas"></div>
</template>
