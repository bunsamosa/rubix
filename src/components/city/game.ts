import WEBGL from "three/examples/jsm/capabilities/WebGL";
import * as THREE from "three";

import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { JoyStick } from "./toon3d";

// game class
class Game {
    public container: HTMLElement;
    public player: Player;
    public animations: Map<string, any>;
    public camera: THREE.PerspectiveCamera;
    public scene: THREE.Scene;
    public renderer: THREE.WebGLRenderer;
    public clock: THREE.Clock;
    public sun: THREE.DirectionalLight;
    public joystick: JoyStick | any;

    constructor(container: HTMLElement) {

        // check if webgl is enabled
        if (WEBGL.isWebGLAvailable() === false) {
            alert(WEBGL.getWebGLErrorMessage());
        };

        // game variables
        const game = this;
        this.player = {} as Player;
        this.animations = new Map();
        this.container = container;
        const animFiles = ["walking", "running", "walkback", "turn", "idle"];

        // initialize threejs components
        // create game clock
        this.clock = new THREE.Clock();

        // setup camera
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
        this.camera.position.set(112, 100, 600);

        // create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xa0a0a0);
        this.scene.fog = new THREE.Fog(0xa0a0a0, 700, 4000);

        // setup ambient light
        const ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444);
        ambientLight.position.set(0, 200, 0);
        this.scene.add(ambientLight);

        // setup directional light and shadows
        const shadowSize = 200;
        const dicrectionalLight = new THREE.DirectionalLight(0xffffff);
        dicrectionalLight.position.set(0, 200, 100);
        dicrectionalLight.castShadow = true;
        dicrectionalLight.shadow.camera.top = shadowSize;
        dicrectionalLight.shadow.camera.bottom = -shadowSize;
        dicrectionalLight.shadow.camera.left = -shadowSize;
        dicrectionalLight.shadow.camera.right = shadowSize;
        this.sun = dicrectionalLight;
        this.scene.add(dicrectionalLight);

        // create ground material
        const ground = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(10000, 10000),
            new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
        );
        ground.rotation.x = - Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // setup grid on the ground
        const grid = new THREE.GridHelper(5000, 40, 0x000000, 0x000000);
        let material = grid.material as THREE.Material
        material.opacity = 0.2;
        material.transparent = true;
        this.scene.add(grid);

        // load player model
        const loader = new FBXLoader();
        loader.load("assets/players/boy.fbx", (object) => {
            // animations
            const mixer = new THREE.AnimationMixer(object);
            game.player.mixer = mixer;
            game.player.root = mixer.getRoot();

            // name for the object
            object.name = "player";

            // traverse children and update attributes
            object.traverse(function (child) {
                let isMesh = (child as THREE.Mesh).isMesh;
                if (isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = false;
                }
            });

            // load textures
            // const tLoader = new THREE.TextureLoader();
            // tLoader.load("assets/city/Boy01_normal.jpg", (texture) => {
            //     object.traverse(function (child) {
            //         if (child.isMesh) {
            //             child.material.map = texture;
            //         }
            //     });
            // });

            // wrap player in a 3D object
            game.player.object = new THREE.Object3D();
            game.scene.add(game.player.object);
            game.player.object.add(object);
            game.animations["idle"] = object.animations[0];
            game.loadAnimations(loader, animFiles);
        });

        // create renderer and attach to DOM
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // add event listener to resize canvas on window resize
        window.addEventListener("resize", game.onWindowResize, false);

        // generic error handler
        window.addEventListener("error", (error) => { console.error(JSON.stringify(error)); });
    };

    // load all animations
    loadAnimations(loader: FBXLoader, animFiles: string[]) {
        const game = this;
        for (let filename of animFiles) {
            loader.load(`assets/animations/${filename}.fbx`, (object) => {
                game.animations[filename] = object.animations[0];
            });
        }

        // create cameras
        game.createCameras();

        // create Joystick for player control
        game.joystick = new JoyStick({
            onMove: game.playerControl,
            game: game
        });

        // set action and start rendering
        game.action = "idle";
        game.animate();
    };

    // move player
    movePlayer(dt) {
        // move the player forward
        if (this.player.move.forward > 0) {
            const speed = (this.player.action == "running") ? 400 : 150;
            this.player.object.translateZ(dt * speed);
        }
        else {
            // move player backwards
            this.player.object.translateZ(-dt * 30);
        }

        // turn
        this.player.object.rotateY(this.player.move.turn * dt);
    };

    // window resize callback
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // set animation action
    set action(name: string) {
        // stop all current animations and load new ones
        const action = this.player.mixer.clipAction(this.animations[name]);
        action.time = 0;
        this.player.mixer.stopAllAction();
        this.player.action = name;
        this.player.actionTime = Date.now();

        // action.fadeIn(0.05);
        action.play();
    }

    // read current action
    get action() {
        if (this.player === undefined || this.player.action === undefined) return "";
        return this.player.action;
    }

    // player control states - callback for joystick
    playerControl(forward, turn) {
        turn = -turn;

        if (forward > 0.3) {
            // walking forward
            if (this.player.action != "walking" && this.player.action != "running") this.action = "walking";
        }
        else if (forward < -0.3) {
            // walking backward
            if (this.player.action != "walkback") this.action = "walkback";
        }
        else {
            // turn
            forward = 0;
            if (Math.abs(turn) > 0.1) {
                if (this.player.action != "turn") this.action = "turn";
            }
            else if (this.player.action != "idle") {
                this.action = "idle";
            }
        };

        // stop moving
        if (forward == 0 && turn == 0) {
            delete this.player.move;
        }
        else {
            // set movement speed
            this.player.move = { forward, turn };
        }
    }

    // set current active camera
    set activeCamera(object) {
        this.player.cameras.active = object;
    }

    // create cameras for different views of the player
    createCameras() {
        const game = this;
        const offset = new THREE.Vector3(0, 80, 0);

        const front = new THREE.Object3D();
        front.position.set(112, 100, 600);
        front.parent = this.player.object;

        const back = new THREE.Object3D();
        back.position.set(0, 300, -600);
        back.parent = this.player.object;

        const wide = new THREE.Object3D();
        wide.position.set(178, 139, 1665);
        wide.parent = this.player.object;

        const overhead = new THREE.Object3D();
        overhead.position.set(0, 400, 0);
        overhead.parent = this.player.object;

        const collect = new THREE.Object3D();
        collect.position.set(40, 82, 94);
        collect.parent = this.player.object;

        // store cameras in player
        this.player.cameras = { front, back, wide, overhead, collect };
        game.activeCamera = this.player.cameras.back;
    }

    // render game
    animate() {
        const game = this;
        const dt = this.clock.getDelta();

        // set render loop
        requestAnimationFrame(function () { game.animate(); });

        // update animations
        if (this.player.mixer !== undefined) {
            this.player.mixer.update(dt);
        }

        // update player control state
        if (this.player.action == "walking") {
            const elapsedTime = Date.now() - this.player.actionTime;

            if (elapsedTime > 1000 && this.player.move.forward > 0) {
                this.action = "running";
            }
        }

        // update player position
        if (this.player.move !== undefined) {
            this.movePlayer(dt);
        }

        // move the camera
        if (this.player.cameras != undefined && this.player.cameras.active != undefined) {
            let worldPosition = this.player.cameras.active.getWorldPosition(new THREE.Vector3());
            this.camera.position.lerp(worldPosition, 0.05);

            const pos = this.player.object.position.clone();
            pos.y += 200;
            this.camera.lookAt(pos);
        }

        // move the directionall light to focus the player
        if (this.sun != undefined) {
            this.sun.position.x = this.player.object.position.x;
            this.sun.position.y = this.player.object.position.y + 200;
            this.sun.position.z = this.player.object.position.z + 100;
            this.sun.target = this.player.object;
        }

        // render scene
        this.renderer.render(this.scene, this.camera);

    }
}

export { Game };
