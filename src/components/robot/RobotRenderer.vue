<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ref, onMounted } from "vue";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { LoadingBar } from "./LoadingBar.js";

// define ref for division
const mycanvas = ref<HTMLInputElement | null>(null);

// setup camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(0, 0, 1);

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

// set encoding and environment for asset to be loaded
renderer.outputEncoding = THREE.sRGBEncoding;
setEnvironment();

// show progress bar for loader
const loadingBar = new (LoadingBar as any)();
loadGLTF();

// add user controls
const controls = new OrbitControls(camera, renderer.domElement);
let robot: any = null;

// load gltf asset
function loadGLTF() {
    // ste assets path
    const loader = new GLTFLoader().setPath("assets/robot/");

    loader.load(
        "robot.glb",

        (gltf) => {
            scene.add(gltf.scene);

            // scale the object
            const bbox = new THREE.Box3().setFromObject(gltf.scene);

            loadingBar.visible = false;
            robot = gltf.scene;
            renderer.setAnimationLoop(renderScene);
        },

        (xhr) => {
            loadingBar.progress = xhr.loaded / xhr.total;
        },

        (err) => {
            console.log(err);
        }
    );
}

// set environemnt
function setEnvironment() {
    const loader = new RGBELoader();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    loader.load(
        "assets/robot/venice_sunset_1k.hdr",
        (texture) => {
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;
            pmremGenerator.dispose();
            scene.environment = envMap;
        },
        undefined,
        (err) => {
            console.log("An error occurred setting the environment");
        }
    );
}

// render the scene
function renderScene() {
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
    <div ref="mycanvas"></div>
</template>
