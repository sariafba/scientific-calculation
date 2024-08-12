import * as THREE from 'three';
// import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';


export class Land{

    constructor(scene) {

        this.scene = scene;
        this.model = null;

        this.loadModel()
    }

    loadModel()
    {

        const fbxLoader = new FBXLoader();
        fbxLoader.load('public/models/Mount_Hood.fbx475CB4E6-94CC-49DE-9529-495E5E5F2B9D.fbx', (object) => {
            object.scale.set(0.005, 0.005, 0.005); // Adjust these values to fit your scene
            object.position.y = -100;
            object.position.z = -3000;

            this.scene.add(object); // إضافة النموذج إلى المشهد
            this.model = object; // حفظ مرجع النموذج في هذا المتغير
        });


        // const loader = new GLTFLoader();
        // loader.load( 'public/models/tropical_island.glb', function ( gltf ) {
        //
        //     const model = gltf.scene;
        //
        //     this.scene.add( model );
        //
        // }, undefined, function ( error ) {
        //
        //     console.error( error );
        //
        // } );


        // const mtlLoader = new MTLLoader();
        // mtlLoader.load('public/models/land/palm_island_OBJ.mtl', (materials) => {
        //     materials.preload(); // Preload textures
        //
        //     const objLoader = new OBJLoader();
        //     objLoader.setMaterials(materials);
        //     objLoader.load('public/models/land/palm_island_OBJ.obj', (object) => {
        //         // Debugging: check materials
        //             // object.traverse((child) => {
        //             //     if (child.isMesh) {
        //             //         console.log(child.material); // Output material properties to console
        //             //         child.material.needsUpdate = true; // Ensure the material updates
        //             //     }
        //             // });
        //         this.scene.add(object);
        //     });
        // });
    }

}