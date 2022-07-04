<script setup lang="ts">
import * as THREE from "three";
import { onMounted } from "vue";

// define input params
// container ID to attach the scene
const props = defineProps<{
  containerID: string
}>();

// create scene
const scene = new THREE.Scene();

// setup camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

// create a cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// move camera away from cube
camera.position.z = 5;

// render with animation
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}

// attach renderer to dom
onMounted(() => {
  const container = document.getElementById(props.containerID);
  container?.appendChild(renderer.domElement);
  animate();
});
</script>

<template>
</template>
