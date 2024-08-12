import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';

export class EnvironmentManager
{
    constructor(scene)
    {
        this.scene = scene;
        this.water = null;

        this.initSkybox();
        this.initLights();
        this.initWater();
    }

    initSkybox()
    {
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        const textures = [
            '/img/skybox/Box_Back.png',
            '/img/skybox/Box_Front.png',
            '/img/skybox/Box_Top.png',
            '/img/skybox/Box_Bottom.png',
            '/img/skybox/Box_Right.png',
            '/img/skybox/Box_Left.png',
        ];
        this.scene.background = cubeTextureLoader.load(textures);
    }

    initLights()
    {
        const light = new THREE.AmbientLight(0xffffff);
        this.scene.add(light);

        // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        // directionalLight.position.set(100, 100, 100).normalize();
        // this.scene.add(directionalLight);
    }

    initWater()
    {
        const waterGeometry = new THREE.PlaneGeometry(25000, 25000);

        this.water = new Water(
            waterGeometry,
    {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('/img/waterNormals.jpg', (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: this.scene.fog !== undefined,
            }
        );

        this.water.rotation.x = -Math.PI / 2;

        this.scene.add(this.water);
    }

    updateWater(timeIncrement)
    {
        if (this.water) {
            this.water.material.uniforms['time'].value += timeIncrement;
        }
    }
}
