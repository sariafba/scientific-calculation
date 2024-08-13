import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';
import {Vectors} from "./Vectors";

export class ModelManager
{
    constructor(scene, camera, controls, land, forces)
    {
        this.scene = scene; // مشهد 3D يتم إضافته من SceneManager
        this.camera = camera; // كاميرا 3D من SceneManager
        this.controls = controls; // إدارة المدخلات والتحكم من ControlsManager
        this.cameraOffset = new THREE.Vector3(300, 150, 0); // إزاحة الكاميرا بالنسبة للقارب


        this.model = null; // متغير للاحتفاظ بنموذج القارب
        this.land = land;
        this.forces = forces;
        this.vectors = new Vectors(this.scene);


        this.speed = 0; // السرعة الحالية للقارب
        this.maxSpeed = 100; // السرعة القصوى للقارب
        this.acceleration = 5; // التسارع عند التسارع
        this.braking = 0.1; // التباطؤ عند الفرملة
        this.friction = 0.05; // معامل الاحتكاك الذي يؤثر على التباطؤ الطبيعي
        this.rotationSpeed = 0.03; // سرعة دوران القارب


        //wind vector (green)
        this.line1 = this.vectors.createVector({ color: 0x00ff00 });
        this.scene.add(this.line1);

        //water vector (blue)
        this.line2 = this.vectors.createVector({ color: 0x0000ff });
        this.scene.add(this.line2);

        this.line3 = this.vectors.createVector({ color: 0x000000 });
        this.scene.add(this.line3);

        this.loadModel(); // تحميل نموذج القارب
    }

    loadModel()
    {
        const fbxLoader = new FBXLoader();
        fbxLoader.load('/models/test4/source/yacht.fbx', (object) => {
            object.rotation.y = -Math.PI * 0.5; // تدوير النموذج للحصول على التوجه الصحيح
            object.castShadow = true; // السماح للنموذج بإسقاط الظلال
            object.receiveShadow = true; // السماح للنموذج باستقبال الظلال
            this.scene.add(object); // إضافة النموذج إلى المشهد
            this.model = object; // حفظ مرجع النموذج في هذا المتغير

            // this.line = this.vectors.createVector({ color: 0x000000 });
            // this.vectors.moveFirstPoint(0,15,0, this.line);
            // this.vectors.moveSecondPoint(-1000,15,0, this.line);
            // this.model.add(this.line);
        });
    }


    modelDimensions()
    {
        return this.boundingBox = new THREE.Box3().setFromObject(this.model);
    }


    update()
    {
        if (this.model)
        {
            // تحديث السرعة بناءً على المدخلات
            if (this.controls.isAccelerating)
            {
                this.speed += this.acceleration;
                if (this.speed > this.maxSpeed) this.speed = this.maxSpeed; // قصر السرعة على الحد الأقصى
            }
            if (this.controls.isBraking)
            {
                this.speed -= this.braking;
                if (this.speed < -this.maxSpeed) this.speed = -this.maxSpeed; // قصر السرعة على الحد الأدنى
            }

            // تطبيق الاحتكاك إذا لم يكن هناك تسارع أو فرملة
            if (!this.controls.isAccelerating && !this.controls.isBraking)
            {
                this.speed *= 1 - this.friction;
                if (Math.abs(this.speed) < 0.01) this.speed = 0; // إيقاف السرعة إذا كانت صغيرة جداً
            }

            // دوران النموذج بناءً على المدخلات
            if (this.controls.isTurningLeft)
            {
                this.model.rotation.y += this.rotationSpeed * (this.speed / this.maxSpeed);
            }
            if (this.controls.isTurningRight)
            {
                this.model.rotation.y -= this.rotationSpeed * (this.speed / this.maxSpeed);
            }


            // if(!this.checkCollision())
                this.model.translateX(-this.speed);// تحريك النموذج بناءً على السرعة الحالية


            //تحديث موقع الكاميرا بالنسبة لموقع القارب
            const offset = this.cameraOffset.clone().applyMatrix4(this.model.matrixWorld);
            this.camera.position.copy(offset);
            this.camera.lookAt(this.model.position);

            //apply forces
            this.forces.intensityOfWeightPower();
            this.forces.intensityOfWaterResistance();
            this.forces.intensityOfWindResistance();
            this.forces.intensityOfEnginePower();
            this.applyBuoyancy(); // تطبيق الطفو


            let x = this.model.position.x;
            let y = this.model.position.y;
            let z = this.model.position.z;


            //wind arrow
            this.vectors.moveFirstPoint(x, y + 60, z, this.line1);
            this.vectors.moveSecondPoint(
                x +  this.vectors.windLineParams.x,
                this.vectors.windLineParams.y,
                z +  this.vectors.windLineParams.z,
                this.line1
            );

            //water arrow
            this.vectors.moveFirstPoint(x, y + 60, z, this.line2);
            this.vectors.moveSecondPoint(
                x +  this.vectors.waterLineParams.x,
                this.vectors.waterLineParams.y,
                z +  this.vectors.waterLineParams.z,
                this.line2
            );

            //engine arrow
            this.vectors.moveFirstPoint(x, 50, z, this.line3);
            this.updateLinePosition(); //moveSecondPoint

            this.angle(this.line3,this.line1);

        }
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


    angle( line1 , line2 )
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
        const angleInDegrees = THREE.MathUtils.radToDeg(angle);

        console.log(`The angle between the lines is ${angleInDegrees} degrees.`);
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


