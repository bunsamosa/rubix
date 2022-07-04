<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { onMounted } from "vue";

// define input params
// container ID to attach the scene
const props = defineProps<{
  containerID: string
}>();

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
const ambientLight = new THREE.HemisphereLight(0xFFFFFF, 0xBBBBFF, 0.3);
scene.add(ambientLight);

// setup directional light
const directionalLight = new THREE.DirectionalLight();
directionalLight.position.set(0.2, 1, 1);
scene.add(directionalLight);

// create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// create a cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00FF00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// add user controls
const controls = new OrbitControls(camera, renderer.domElement);

// move camera away from cube
// camera.position.z = 5;

// render the scene
function renderScene() {
  cube.rotation.x += 0.01;
  cube.rotateX(0.01);
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
  const container = document.getElementById(props.containerID);
  container?.appendChild(renderer.domElement);
  renderer.setAnimationLoop(renderScene);
  window.addEventListener("resize", resizeScene)
});
</script>

<template>
</template>
