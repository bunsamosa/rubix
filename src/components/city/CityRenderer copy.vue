<script setup lang="ts">
import { ref, onMounted, createApp } from "vue";

import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import WEBGL from "three/examples/jsm/capabilities/WebGL";
import { JoyStick } from "./toon3d.js";

// check if WebGL is supported
if (WEBGL.isWebGLAvailable() === false) {
    alert(WEBGL.getWebGLErrorMessage());
}

// define variables
const mycanvas = ref<HTMLElement | null>(null);
const player = {
    "action": "idle"
};
const animations = {};
const animFiles = ["walking", "running", "walkback", "turn"];
const clock = new THREE.Clock();
let joystick;

// setup camera
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    5000
);
camera.position.set(112, 100, 600);

// create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);
scene.fog = new THREE.Fog(0xa0a0a0, 700, 4000);

// setup ambient light
const ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444);
ambientLight.position.set(0, 200, 0);
scene.add(ambientLight);

// setup directional light and shadows
const shadowSize = 200;
const sun = new THREE.DirectionalLight(0xffffff);
sun.position.set(0, 200, 100);
sun.castShadow = true;
sun.shadow.camera.top = shadowSize;
sun.shadow.camera.bottom = -shadowSize;
sun.shadow.camera.left = -shadowSize;
sun.shadow.camera.right = shadowSize;
scene.add(sun);

// ground
const ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10000, 10000),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
);
ground.rotation.x = - Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// setup grid on the ground
const grid = new THREE.GridHelper(5000, 40, 0x000000, 0x000000);
grid.material.opacity = 0.2;
grid.material.transparent = true;
scene.add(grid);

// create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// add user controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.target.set(0, 150, 0);
// controls.update();

// load the assets
const loader = new FBXLoader();
loader.load("assets/players/boy.fbx", (object) => {
    // animations
    object.mixer = new THREE.AnimationMixer(object);
    player.mixer = object.mixer;
    player.root = object.mixer.getRoot();

    // name for the object
    object.name = "player";

    // traverse children and update attributes
    object.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = false;
        }
    });

    // load textures
    // const textureLoader = new THREE.TextureLoader();
    // textureLoader.load("assets/city/Boy01_normal.jpg", function (texture) {
    //     object.traverse(function (child) {
    //         if (child.isMesh) {
    //             child.material.map = texture;
    //         }
    //     });
    // });

    // wrap player into a 3d object
    player.body = new THREE.Object3D();
    scene.add(player.body);
    player.body.add(object);
    animations.idle = object.animations[0];
    console.log("loaded player");

    // load animations
    loadAnimations(loader);
    // render the scene
});

// load all animations into the game
function loadAnimations(loader: FBXLoader) {
    // let filename: string = animFiles.pop() as string;
    for (let filename of animFiles) {
        loader.load(`assets/animations/${filename}.fbx`, (object) => {
            animations[filename] = object.animations[0];
        });

        createCameras();
        joystick = new JoyStick({
            onMove: playerControl
        })
        loadAction("idle");
        console.log("loaded animations");
        renderScene();
    };
};

// create cameras for different views
function createCameras() {
    const offset = new THREE.Vector3(0, 80, 0);

    const front = new THREE.Object3D();
    front.position.set(112, 100, 600);
    front.parent = player.body;

    const back = new THREE.Object3D();
    back.position.set(0, 300, -600);
    back.parent = player.body;

    const wide = new THREE.Object3D();
    wide.position.set(178, 139, 1665);
    wide.parent = player.body;

    const overhead = new THREE.Object3D();
    overhead.position.set(0, 400, 0);
    overhead.parent = player.body;

    const collect = new THREE.Object3D();
    collect.position.set(40, 82, 94);
    collect.parent = player.body;

    player.cameras = { front, back, wide, overhead, collect };
    loadCamera(player.cameras.back);
};

// render the scene
function renderScene() {
    const dt = clock.getDelta();
    requestAnimationFrame(renderScene);

    if (player.mixer !== undefined) player.mixer.update(dt);

    // walking and running
    if (player.action == "walking") {
        const elapsedTime = Date.now() - player.actionTime;
        if (elapsedTime > 1000 && player.move.forward > 0) {
            loadAction("running");
        }
    };

    // move the player
    if (player.move !== undefined) movePlayer(dt);

    // update camera view
    if (player.cameras != undefined && player.cameras.active != undefined) {

        camera.position.lerp(player.cameras.active.getWorldPosition(new THREE.Vector3()), 0.05);
        const pos = player.body.position.clone();
        pos.y += 200;
        camera.lookAt(pos);
    }

    // update sun - directional light on current player
    if (sun != undefined) {
        sun.position.x = player.body.position.x;
        sun.position.y = player.body.position.y + 200;
        sun.position.z = player.body.position.z + 100;
        sun.target = player.body;
    }

    renderer.render(scene, camera);
}

// load action
function loadAction(name: string) {
    const action = player.mixer.clipAction(animations[name]);
    action.time = 0;

    player.mixer.stopAllAction();
    player.action = name;
    player.actionTime = Date.now();
    player.actionName = name;

    console.log("Loading ", name);
    action.fadeIn(0.5);
    action.play();
};

// load camera
function loadCamera(object) {
    player.cameras.active = object;
};

// player control
function playerControl(forward, turn) {
    turn = -turn;
    console.log(player.action, forward, turn);

    if (forward > 0.3) {
        if (player.action != "walking" && player.action != "running") loadAction("walking");
    }
    else if (forward < -0.3) {
        if (player.action != "walkback") loadAction("walkback");
    }
    else {
        forward = 0;
        if (Math.abs(turn) > 0.1) {
            if (player.action != "turn") loadAction("turn");
        }
        else if (player.action != "idle") loadAction("idle");
    }

    if (forward == 0 && turn == 0) {
        delete player.move;
    } else {
        player.move = { forward, turn };
    }
}

// move player - translate to co-ordinates
function movePlayer(dt) {
    if (player.move.forward > 0) {
        const speed = (player.action == "running") ? 400 : 150;
        player.body.translateZ(dt * speed);
    } else {
        player.body.translateZ(-dt * 30);
    }
    player.body.rotateY(player.move.turn * dt);
};

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
</template>
