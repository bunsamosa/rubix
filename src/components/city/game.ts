import WEBGL from "three/examples/jsm/capabilities/WebGL";
import * as THREE from "three";

import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { JoyStick, SFX, Preloader } from "./toon3d";

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
    public colliders: Array<THREE.Mesh>;
    public modes: any;
    public mode: any;
    public assetsPath: string;
    public messages: any;
    public animationFiles: Array<string>;
    public loadingManager: THREE.LoadingManager;

    constructor(container: HTMLElement) {

        // check if webgl is enabled
        if (WEBGL.isWebGLAvailable() === false) alert(WEBGL.getWebGLErrorMessage());

        // game modes for preloader
        this.modes = Object.freeze({
            NONE: Symbol("none"),
            PRELOAD: Symbol("preload"),
            INITIALISING: Symbol("initialising"),
            CREATING_LEVEL: Symbol("creating_level"),
            ACTIVE: Symbol("active"),
            GAMEOVER: Symbol("gameover")
        });
        this.mode = this.modes.NONE;

        // game variables
        this.player = {} as Player;
        this.animations = new Map();
        this.container = container;
        this.colliders = [];
        this.clock = new THREE.Clock();

        this.messages = {
            text: [
                "Welcome to Rubix",
                "GOOD LUCK!"
            ],
            index: 0
        }

        // asset preloading
        this.assetsPath = "/assets/city";
        this.animationFiles = ["walking", "running", "walkback", "turn", "idle"];
        const game = this;
        const options = {
            assets: [
                `${this.assetsPath}/city.fbx`,
                `${this.assetsPath}/Volumes/Vault/Dropbox/BITGEM_Products/_smashy_craft_series/city/city/construction/city_tex.tga`
            ],
            oncomplete: function () {
                game.init();
                game.animate();
            }
        };
        this.animationFiles.forEach(filename => {
            options.assets.push(`assets/animations/${filename}.fbx`)
        });
        this.mode = this.modes.PRELOAD;
        const preloader = new Preloader(options);

        // const sfxExt = SFX.supportsAudioType('mp3') ? 'mp3' : 'ogg';

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
        game.createColliders();

        // create Joystick for player control
        game.joystick = new JoyStick({
            onMove: game.playerControl,
            game: game
        });

        // set action and start rendering
        game.action = "idle";
        game.animate();
    };

    // create obstacles on the map
    createColliders() {
        // create boxes
        const geometry = new THREE.BoxGeometry(500, 400, 500);
        const material = new THREE.MeshBasicMaterial({ color: 0x222222, wireframe: true });

        // add boxes on the map
        for (let x = -5000; x < 5000; x += 1000) {
            for (let z = -5000; z < 5000; z += 1000) {
                if (x == 0 && z == 0) continue;
                const box = new THREE.Mesh(geometry, material);
                box.position.set(x, 250, z);
                this.scene.add(box);
                this.colliders.push(box);
            }
        }

        // create a stage to start from
        const geometry2 = new THREE.BoxGeometry(1000, 40, 1000);
        const stage = new THREE.Mesh(geometry2, material);
        stage.position.set(0, 20, 0);
        this.colliders.push(stage);
        this.scene.add(stage);
    }

    // move the player on canvas
    movePlayer(dt) {
        // fetch current position of player
        const currentPosition = this.player.object.position.clone();
        currentPosition.y += 60; // above the ground

        // fetch current direction - object's Z axis
        let direction = new THREE.Vector3();
        this.player.object.getWorldDirection(direction);

        // backward direction based on joystick
        const forward = this.player.move.forward > 0 ? true : false;
        if (!forward) direction.negate();

        // raycaster to identify collision
        let raycaster = new THREE.Raycaster(currentPosition, direction);
        let blocked = false;
        const colliders = this.colliders;

        // cast rays towards obstacles and find intersections
        if (colliders !== undefined) {
            const intersect = raycaster.intersectObjects(colliders);

            if (intersect.length > 0) {
                for (let collision of intersect) {
                    // forward collision
                    if (collision.distance < 10 && forward) blocked = true;

                    // collision in other directions
                    if (collision.distance < 100 && !forward) blocked = true;
                }
            }
        }

        // move the player if not blocked
        if (!blocked) {
            // move the player forward
            if (forward) {
                const speed = (this.player.action == "running") ? 400 : 150;
                this.player.object.translateZ(dt * speed);
            }
            else {
                // move player backwards
                this.player.object.translateZ(-dt * 30);
            }
        }

        // collision in other directions
        if (colliders !== undefined) {
            // cast left
            direction.set(-1, 0, 0);
            direction.applyMatrix4(this.player.object.matrix);
            direction.normalize();
            raycaster = new THREE.Raycaster(currentPosition, direction);

            let intersect = raycaster.intersectObjects(colliders);
            if (intersect.length > 0) {
                if (intersect[0].distance < 50) this.player.object.translateX(100 - intersect[0].distance);
            }

            // cast right
            direction.set(1, 0, 0);
            direction.applyMatrix4(this.player.object.matrix);
            direction.normalize();
            raycaster = new THREE.Raycaster(currentPosition, direction);

            intersect = raycaster.intersectObjects(colliders);
            if (intersect.length > 0) {
                if (intersect[0].distance < 50) this.player.object.translateX(intersect[0].distance - 100);
            }

            // cast down
            direction.set(0, -1, 0);
            direction.y += 200;
            raycaster = new THREE.Raycaster(currentPosition, direction);
            const gravity = 30;

            intersect = raycaster.intersectObjects(colliders);
            if (intersect.length > 0) {
                const targetY = direction.y - intersect[0].distance;
                if (targetY > this.player.object.position.y) {
                    //Going up
                    this.player.object.position.y = 0.8 * this.player.object.position.y + 0.2 * targetY;
                    this.player.velocityY = 0;
                }
                else if (targetY < this.player.object.position.y) {
                    //Falling
                    if (this.player.velocityY == undefined) this.player.velocityY = 0;

                    this.player.velocityY += dt * gravity;
                    this.player.object.position.y -= this.player.velocityY;

                    if (this.player.object.position.y < targetY) {
                        this.player.velocityY = 0;
                        this.player.object.position.y = targetY;
                    }
                }
            }
            else if (this.player.object.position.y > 0) {
                if (this.player.velocityY == undefined) this.player.velocityY = 0;

                this.player.velocityY += dt * gravity;
                this.player.object.position.y -= this.player.velocityY;

                if (this.player.object.position.y < 0) {
                    this.player.velocityY = 0;
                    this.player.object.position.y = 0;
                }
            }
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
            // fetch current active position of the player camera
            // and move game camera to that position smoothly
            let worldPosition = this.player.cameras.active.getWorldPosition(new THREE.Vector3());
            this.camera.position.lerp(worldPosition, 0.05);

            // set cameras target object to look at
            const pos = this.player.object.position.clone();
            pos.y += 200;
            this.camera.lookAt(pos);
        }

        // move the directional light to focus the player
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
