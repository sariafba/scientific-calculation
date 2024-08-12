import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

export class SceneManager {

    constructor(container) {

        // Initialize scene
        this.scene = new THREE.Scene();

        // Initialize renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // this.renderer.shadowMap.enabled = true; // Enable shadow maps
        container.appendChild(this.renderer.domElement);

        // Initialize camera
        this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 200000);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Optional: Add helpers
        const axesHelper = new THREE.AxesHelper(100);
        this.scene.add(axesHelper);

        /**
         * orbit
         * */
        const orbit = new OrbitControls(this.camera, this.renderer.domElement)
        orbit.enableZoom = true;
        orbit.campingFactor = 0.25;
        orbit.enableDamping = true;
        this.camera.position.set(100,100,350);

    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
