import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';
import {Vectors} from "./Vectors";
import {Forces} from "./Forces";
import * as dat from "dat.gui";

export class ModelManager
{
    constructor(scene, camera, controls, land)
    {
        this.scene = scene; // مشهد 3D يتم إضافته من SceneManager
        this.camera = camera; // كاميرا 3D من SceneManager
        this.controls = controls; // إدارة المدخلات والتحكم من ControlsManager
        this.cameraOffset = new THREE.Vector3(300, 150, 0); // إزاحة الكاميرا بالنسبة للقارب

        this.land = land;
        this.forces = new Forces();
        this.vectors = new Vectors(this.scene);

        this.speed = 0; // السرعة الحالية للقارب
        this.maxSpeed = 12; // السرعة القصوى للقارب
        this.braking = 0.1; // التباطؤ عند الفرملة
        this.friction = 0.05; // معامل الاحتكاك الذي يؤثر على التباطؤ الطبيعي
        this.rotationSpeed = 0.03; // سرعة دوران القارب
        this.brakeForce = 8000;
        this.centrifugal = 0 ;
        this.rad = 0 ;
        this.isNSet = false;

        //wind vector (green)
        this.line1 = this.vectors.createVector({ color: 0x00ff00 });
        this.scene.add(this.line1);
        //water vector (blue)
        this.line2 = this.vectors.createVector({ color: 0x0000ff });
        this.scene.add(this.line2);
        //engine vector
        this.line3 = this.vectors.createVector({ color: 0x000000 });
        this.scene.add(this.line3);


        //a and v folder
        this.gui = new dat.GUI();
        this.params = {
            v: this.velocity(),
            a: this.acceleration()
        }
        this.gui.add(this.params, 'v').listen();
        this.gui.add(this.params, 'a').listen();


        this.forces.engineFolder.add(this.forces.engineParams, 'n', 2000, 3000, 100).name('n (rpm)').onChange((value) => {
            this.forces.engineParams.n = value;
            this.forces.intensityOfEnginePower(this.forces.engineParams);
        }).listen();



        this.loadModel(); // تحميل نموذج القارب
    }


    loadModel()
    {
        const fbxLoader = new FBXLoader();
        fbxLoader.load('/models/test4/source/yacht.fbx', (object) => {
            // object.rotation.y = -Math.PI * 0.5; // تدوير النموذج للحصول على التوجه الصحيح
            object.castShadow = true; // السماح للنموذج بإسقاط الظلال
            object.receiveShadow = true; // السماح للنموذج باستقبال الظلال
            this.scene.add(object); // إضافة النموذج إلى المشهد
            this.model = object; // حفظ مرجع النموذج في هذا المتغير

            // // this.line = this.vectors.createVector({ color: 0x000000 });
            // this.vectors.moveFirstPoint(0,15,0, this.line1);
            // // this.vectors.moveSecondPoint(-1000,15,0, this.line);
            // this.model.add(this.line1);
        });
    }


    modelDimensions()
    {
        return this.boundingBox = new THREE.Box3().setFromObject(this.model);
    }


    fixCamera()
    {
        // Update camera position relative to the boat
        const offset = this.cameraOffset.clone().applyMatrix4(this.model.matrixWorld);
        this.camera.position.copy(offset);
        this.camera.lookAt(this.model.position);
    }


    update()
    {
        if (this.model)
        {
            // this.fixCamera();
            this.applyBuoyancy();
            this.updatedVectors();
            this.relativeVelocityWater();
            this.relativeVelocityWind();


            this.params.v = this.speed;
            this.params.a = this.acceleration();



            // Start the timer if accelerating from a standstill
            if (this.controls.isAccelerating && this.speed === 0)
            {
                this.controls.startTimer();
                this.controls.timer += 0.000001
            }


            // Update speed based on input
            if (this.controls.isAccelerating)
            {
                if(!this.isNSet)
                {
                    this.forces.engineParams.n = 3000;
                    this.isNSet = true;
                }

                this.speed = this.velocity() ; // Increase speed based on acceleration

                if (this.speed > this.maxSpeed)
                {
                    this.speed = this.maxSpeed; // Cap speed at the maximum value
                }
            }
            else if (this.controls.isBraking)
            {
                this.forces.engineParams.n = 0;
                this.isNSet = false;

                this.speed -= this.braking; // Decrease speed due to braking

                if (this.speed <= 0)
                {
                    this.speed = 0; // Ensure speed does not go negative
                }
            }
            // Apply friction when neither accelerating nor braking
            else
            {
                this.forces.engineParams.n = 0;
                this.isNSet = false;

                this.speed -= this.friction;
                // if(this.acceleration() < 0)
                //     this.speed = this.acceleration() * -1;
                // else
                // this.speed -= this.acceleration();

                if (this.speed <= 0.01)
                    this.speed = 0; // Stop the boat if the speed is very low

            }


            // Stop the timer if speed exceeds 0
            if (this.speed === 0)
            {
                this.controls.stopTimer();
                this.controls.timer = 0;
            }


            // Rotate the model based on input
            if (this.controls.isTurningLeft)
            {
                this.rad = this.radius();
                this.centrifugal = this.centrifugalForce();
                this.model.rotation.y += this.rotationSpeed * (this.speed / this.maxSpeed);
            }
            if (this.controls.isTurningRight)
            {
                this.rad = this.radius();
                this.centrifugal = this.centrifugalForce();
                this.model.rotation.y -= this.rotationSpeed * (this.speed / this.maxSpeed);
            }
            if (!this.controls.isTurningLeft && !this.controls.isTurningRight)
            {
                this.rad = 0;
                this.centrifugal = 0;

            }


            if(this.checkCollision())
                this.speed = 0;


            // Move the model based on current speed
            // if(this.acceleration()<0)
            // {
            //     this.speed -= this.friction
            //     this.model.translateX(-this.speed);
            // }
            // else
            this.model.translateX(-this.speed);



            console.log(
                ` speed ${this.speed}\n`,
                `velocity ${this.velocity()}\n`,
                // `timer ${this.controls.timer}\n`,
                // `netForce ${this.netForce()}\n`,
                // `relative water V ${this.forces.waterV}\n`,
                // `relative wind V ${this.forces.windV}\n`,
                `radius ${this.rad}\n`,
                `centrifugalForce ${this.centrifugal}\n`,
            );

        }
    }


    netForce()
    {
        return this.forces.intensityOfEnginePower()
            + (this.forces.intensityOfWaterResistance() * Math.cos(this.angle(this.line2, this.line3)))
            + (this.forces.intensityOfWindResistance() * Math.cos(this.angle(this.line1, this.line3)))
            -this.brakeForce
            ;
    }


    acceleration()
    {
        let netForce = this.netForce() / (this.forces.params.Boat_Mass * 1000)

        return netForce < 0 ? 0 : netForce;
    }


    velocity()
    {
        let v = (this.acceleration()) * (this.controls.timer/1000);

        return v //= v > 12 ? this.speed : v;
    }


    relativeVelocityWind()
    {
        let angle = this.angle(this.line3,this.line1);
        if(Math.cos(angle) > 0)
        {
            this.forces.setWindV(this.speed + this.forces.windParams.v);
        }
        else if(Math.cos(angle) < 0)
        {
            this.forces.setWindV(this.speed - this.forces.windParams.v);
        }
    }


    relativeVelocityWater()
    {
        let angle = this.angle(this.line3,this.line2);
        if(Math.cos(angle) > 0)
        {
            this.forces.setWaterV(this.speed + this.forces.waterParams.v);
        }
        else if(Math.cos(angle) < 0)
        {
            this.forces.setWaterV(this.speed - this.forces.waterParams.v);
        }
    }


    centrifugalForce()
    {
        return (this.forces.boatMass * Math.pow(this.velocity(),2)) / this.radius() ;
    }


    radius()
    {
        return this.velocity() / this.rotationSpeed ;
    }


    updatedVectors()
    {
        // Update vector positions
        let x = this.model.position.x;
        let y = this.model.position.y;
        let z = this.model.position.z;

        // Wind arrow
        this.vectors.moveFirstPoint(x, y + 60, z, this.line1);
        this.vectors.moveSecondPoint(
            x + this.vectors.windLineParams.x,
            this.vectors.windLineParams.y,
            z + this.vectors.windLineParams.z,
            this.line1
        );

        // Water arrow
        this.vectors.moveFirstPoint(x, y + 60, z, this.line2);
        this.vectors.moveSecondPoint(
            x + this.vectors.waterLineParams.x,
            this.vectors.waterLineParams.y,
            z + this.vectors.waterLineParams.z,
            this.line2
        );

        // Engine arrow
        this.vectors.moveFirstPoint(x, 50, z, this.line3);
        this.updateLinePosition(); // Move the second point of the line
    }


    updateLinePosition()
    {
        const modelPosition = this.model.position;

        // Convert the Euler rotation to a Quaternion
        const modelQuaternion = new THREE.Quaternion();
        this.model.getWorldQuaternion(modelQuaternion); // Get the model's world rotation as a quaternion

        // Calculate the forward direction vector
        const forwardDirection = new THREE.Vector3(-1, 0, 0); // Assuming -Z is forward in Three.js
        forwardDirection.applyQuaternion(modelQuaternion);

        // Calculate the point in front of the model
        const pointInFront = modelPosition.clone().add(forwardDirection.multiplyScalar(1000)); // Adjust the distance as needed

        // Move the second point of the line to the calculated position
        this.vectors.moveSecondPoint(pointInFront.x, pointInFront.y + 50, pointInFront.z, this.line3);
    }


    angle(line1 , line2)
    {
        // استخراج النُّقَط من الخط الأول
        const positions1 = line1.geometry.attributes.position.array;
        const pointA1 = new THREE.Vector3(positions1[0], positions1[1], positions1[2]);
        const pointA2 = new THREE.Vector3(positions1[3], positions1[4], positions1[5]);

        // استخراج النُّقَط من الخط الثاني
        const positions2 = line2.geometry.attributes.position.array;
        const pointB1 = new THREE.Vector3(positions2[0], positions2[1], positions2[2]);
        const pointB2 = new THREE.Vector3(positions2[3], positions2[4], positions2[5]);

        // حساب الاتجاه لكل خط
        const vectorA = new THREE.Vector3().subVectors(pointA2, pointA1);
        const vectorB = new THREE.Vector3().subVectors(pointB2, pointB1);

        // حساب الزاوية بين الاتجاهين
        const angle = vectorA.angleTo(vectorB);
        // const angleInDegrees = THREE.MathUtils.radToDeg(angle);

        return angle;
    }


    checkCollision()
    {
    // Update the bounding box of the movable model
    this.modelDimensions().setFromObject(this.model);

    // Check if the boxes intersect
    if (this.boundingBox.intersectsBox(this.land.modelDimensions()))
    {
        console.log('-------Collision detected!-------');
        return true;
    }
        return false;
    }


    applyBuoyancy()
    {
            // تعديل موضع القارب بناءً على الفرق بين قوة الطفو والثقل
            if (this.forces.intensityOfWeightPower() > this.forces.intensityOfBuoyancyPower())
            {
                // إذا كانت قوة الثقل أكبر من الطفو، يغرق القارب
                this.model.position.y -= (this.forces.intensityOfWeightPower() - this.forces.intensityOfBuoyancyPower()) / this.forces.boatMass * 0.1; // غرق القارب

                if(this.model.position.y <= -60)
                    this.model.position.y = -60;
            }

            else if (this.forces.intensityOfWeightPower() <= this.forces.intensityOfBuoyancyPower())
            {
                // إذا كانت قوة الطفو أكبر من الثقل، يطفو القارب
                this.model.position.y += (this.forces.intensityOfWeightPower() + this.forces.intensityOfBuoyancyPower()) / this.forces.boatMass * 0.1; // غرق القارب

                if(this.model.position.y >= -10)
                    this.model.position.y = -10;
            }
        }


}


