import * as THREE from "three";
import * as dat from "dat.gui";

export class Vectors
{
    constructor(scene)
    {
        this.scene = scene;
        /**
         *
         * dat.GUI configuration
         *
         */

        const gui = new dat.GUI();

        //wind line
        this.windLineParams = {
            x: 500,
            y: 50,
            z: 500
        };
        this.windFolder = gui.addFolder('Wind Line');
        this.windFolder.add(this.windLineParams, 'x').onChange(value => {
            this.windLineParams.x = value;
        });
        this.windFolder.add(this.windLineParams, 'y').onChange(value => {
            this.windLineParams.y = value;
        });
        this.windFolder.add(this.windLineParams, 'z').onChange(value => {
            this.windLineParams.z = value;
        });
        // this.windFolder.open();



        //water line
        this.waterLineParams = {
            x: -500,
            y: 50,
            z: -500
        };
        this.waterFolder = gui.addFolder('Water Line');
        this.waterFolder.add(this.waterLineParams, 'x').onChange(value => {
            this.waterLineParams.x = value;
        });
        this.waterFolder.add(this.waterLineParams, 'y').onChange(value => {
            this.waterLineParams.y = value;
        });
        this.waterFolder.add(this.waterLineParams, 'z').onChange(value => {
            this.waterLineParams.z = value;
        });
        // this.waterFolder.open();


        //water vector (blue)
        this.line2 = this.createVector({ color: 0x0000ff });
        this.scene.add(this.line2);


        this.line3 = this.createVector({ color: 0xff0000 });
        this.scene.add(this.line3);
    }

    createVector(color)
    {
        let material = new THREE.LineBasicMaterial( color );
        const points = [];
        points.push( new THREE.Vector3(  0, 0, 0 ) );
        points.push( new THREE.Vector3( 0, 0, 0) );
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        return  new THREE.Line( geometry, material );
    }


    moveFirstPoint(newX, newY, newZ, line)
    {
        line.geometry.attributes.position.array[0] = newX;
        line.geometry.attributes.position.array[1] = newY;
        line.geometry.attributes.position.array[2] = newZ;

        line.geometry.attributes.position.needsUpdate = true;
    }


    moveSecondPoint(newX, newY, newZ, line)
    {
        line.geometry.attributes.position.array[3] = newX;
        line.geometry.attributes.position.array[4] = newY;
        line.geometry.attributes.position.array[5] = newZ;

        line.geometry.attributes.position.needsUpdate = true;
    }
}