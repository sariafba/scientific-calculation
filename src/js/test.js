import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {Water} from "three/examples/jsm/objects/water.js";
import * as dat from 'dat.gui'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
// import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';




import Box_Front from '../../public/img/skybox/Box_Front.png';
import Box_Back from '../../public/img/skybox/Box_Back.png';
import Box_Top from '../../public/img/skybox/Box_Top.png';
import Box_Bottom from '../../public/img/skybox/Box_Bottom.png';
import Box_Right from '../../public/img/skybox/Box_Right.png';
import Box_Left from '../../public/img/skybox/Box_Left.png';

/**
 * scene
 * */
const scene = new THREE.Scene();
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    Box_Back,
    Box_Front,
    Box_Top,
    Box_Bottom,
    Box_Right,
    Box_Left
]);

/**
 * camera
 * */
const camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
camera.position.set( 180, 150,  300);
camera.lookAt( 0, 0, 0 );

/**
 * renderer
 * */
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

/**
 * light
 * */
var light = new THREE.AmbientLight(0xffffff);
scene.add(light);

/**
 * orbit
 * */
const orbit = new OrbitControls(camera, renderer.domElement)
orbit.enableZoom = true;
orbit.campingFactor = 0.25;
orbit.enableDamping = true;

/**
 * helper
 * */
const axesHelper = new THREE.AxesHelper(100)
scene.add( axesHelper );
// const gridHelper = new THREE.GridHelper(10000, 5000)
// scene.add( gridHelper );

/**
 * gui
 * */
const gui = new dat.GUI();

/**
 * water
 * */
const waterGeometry = new THREE.PlaneGeometry( 20000, 20000 );

let water = new Water(
    waterGeometry,
    {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load( "img/waterNormals.jpg", function ( texture ) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        } ),
        waterColor: 0x001e0f,
        // waterColor: 0x00ffff,
        distortionScale: 3.7,
        fog: scene.fog !== undefined,
    }
);
water.rotation.x = - Math.PI / 2;
scene.add( water );

/**
 * box
 * */
// const boxGeometry = new THREE.BoxGeometry(10,10, 10);
// const boxMaterial = new THREE.MeshBasicMaterial({
//     color: 0x008800,
//     side: THREE.DoubleSide
// } );
// const box = new THREE.Mesh(boxGeometry, boxMaterial);
// scene.add( box );

/**
 * boat
 * */
let speed = 10;
let rotationSpeed = 0.02;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;let model;
// Define an offset for the camera relative to the model
const cameraOffset = new THREE.Vector3(800, 150,  -100);

const fbxLoader = new FBXLoader();
fbxLoader.load('../../public/models/test4/source/yacht.fbx', (object) => {
    object.rotation.y = - Math.PI * 0.5;
    scene.add(object);
    model = object;
});

// Set up controls
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

function onKeyDown(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
}



/**
 *
 * */
function render() {
    water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
    orbit.update();

    if (model) {

        if (moveForward) model.position.z -= speed;
        if (moveBackward) model.position.z += speed;
        if (moveLeft) model.rotation.y += rotationSpeed;
        if (moveRight) model.rotation.y -= rotationSpeed;
    }

    // Update camera position to follow the model
    const offset = cameraOffset.clone().applyMatrix4(model.matrixWorld);
    camera.position.copy(offset);

    // Make the camera look at the model
    camera.lookAt(model.position);

    renderer.render( scene, camera );
}

function animate() {
    requestAnimationFrame( animate );

    render();
}

animate();
