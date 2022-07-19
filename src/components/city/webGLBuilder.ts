import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export function initWebGLOverlay(map: google.maps.Map, mapOptions: MapOptions) {
    let scene: THREE.Scene,
        renderer: THREE.WebGLRenderer,
        camera: THREE.Camera,
        loader: GLTFLoader;

    // create overlay
    const webGLOverlayView = new google.maps.WebGLOverlayView();

    webGLOverlayView.onAdd = () => {
        //setup threejs
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera();

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
        directionalLight.position.set(0.5, -1, 0.5);
        scene.add(directionalLight);

        loader = new GLTFLoader().setPath("assets/robot/");
        loader.load("robot.glb", (gltf) => {
            gltf.scene.scale.set(25, 25, 25);
            gltf.scene.rotation.x = (90 * Math.PI) / 180;
            scene.add(gltf.scene);
        });
    };

    webGLOverlayView.onContextRestored = ({ gl }) => {
        renderer = new THREE.WebGLRenderer({
            canvas: gl.canvas,
            context: gl,
            ...gl.getContextAttributes(),
        });
        renderer.autoClear = false;

        loader.manager.onLoad = () => {
            renderer.setAnimationLoop(() => {
                map.moveCamera({
                    tilt: mapOptions.tilt,
                    heading: mapOptions.heading,
                    zoom: mapOptions.zoom,
                });

                if (mapOptions.tilt < 67.5) {
                    mapOptions.tilt += 0.5;
                } else if (mapOptions.heading <= 360) {
                    mapOptions.heading += 0.2;
                } else {
                    renderer.setAnimationLoop(null);
                }
            });
        };
    };

    webGLOverlayView.onDraw = ({ gl, transformer }) => {
        const latLngAltitudeLiteral: google.maps.LatLngAltitudeLiteral = {
            lat: mapOptions.center.lat,
            lng: mapOptions.center.lng,
            altitude: 10,
        };

        const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
        camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);

        webGLOverlayView.requestRedraw();
        renderer.render(scene, camera);
        renderer.resetState();
    };

    // add map to overlay
    webGLOverlayView.setMap(map);
}
