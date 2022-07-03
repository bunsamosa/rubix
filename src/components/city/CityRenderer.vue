<script setup lang="ts">
import { ref, onMounted } from "vue";

import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import WEBGL from "three/examples/jsm/capabilities/WebGL";

// check if WebGL is supported
if (WEBGL.isWebGLAvailable() === false) {
    alert(WEBGL.getWebGLErrorMessage());
}

// define variables
const mycanvas = ref<HTMLInputElement | null>(null);
const player = {};
const clock = new THREE.Clock();

// setup camera
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    2000
);
camera.position.set(112, 100, 400);

// create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);
scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);

// setup ambient light
const ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444);
ambientLight.position.set(0, 200, 0);
scene.add(ambientLight);

// setup directional light and shadows
const directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(0, 200, 100);
directionalLight.castShadow = true;
directionalLight.shadow.camera.top = 180;
directionalLight.shadow.camera.bottom = -180;
directionalLight.shadow.camera.left = -120;
directionalLight.shadow.camera.right = 120;
scene.add(directionalLight);

// ground
const ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2000, 2000),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
);
ground.rotation.x = - Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// setup grid on the ground
const grid = new THREE.GridHelper(2000, 40, 0x000000, 0x000000);
grid.material.opacity = 0.2;
grid.material.transparent = true;
scene.add(grid);

// create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// add user controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 150, 0);
controls.update();

// load the assets
const loader = new FBXLoader();
loader.load("assets/city/fbx/FireFighter.fbx", function (object) {
    // animations
    object.mixer = new THREE.AnimationMixer(object);
    player.mixer = object.mixer;
    player.root = object.mixer.getRoot();

    // name for the object
    object.name = "FireFighter";

    // traverse children and update attributes
    object.traverse(function (child) {
        if (child.isMesh) {
            child.material.map = null;
            child.castShadow = true;
            child.receiveShadow = false;
        }
    });

    // add object to scene
    scene.add(object);
    player.object = object;
    player.mixer.clipAction(object.animations[0]).play();

    // render the scene
    renderScene();
});

// render the scene
function renderScene() {
    const dt = clock.getDelta();
    requestAnimationFrame(function () { renderScene(); });

    if (player.mixer !== undefined) player.mixer.update(dt);
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
        // renderer.setAnimationLoop(renderScene);
        window.addEventListener("resize", resizeScene);
    }
});
</script>

<template>
    <div ref="mycanvas" class="h-screen"></div>
</template>
