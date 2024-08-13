import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';
import * as dat from "dat.gui";

export class ModelManager
{
    constructor(scene, camera, controls, land, forces)
    {
        this.scene = scene; // مشهد 3D يتم إضافته من SceneManager
        this.camera = camera; // كاميرا 3D من SceneManager
        this.controls = controls; // إدارة المدخلات والتحكم من ControlsManager

        this.model = null; // متغير للاحتفاظ بنموذج القارب
        this.land = land;
        this.forces = forces;


        this.speed = 0; // السرعة الحالية للقارب
        this.maxSpeed = 30; // السرعة القصوى للقارب
        this.acceleration = 0.5; // التسارع عند التسارع
        this.braking = 0.1; // التباطؤ عند الفرملة
        this.friction = 0.05; // معامل الاحتكاك الذي يؤثر على التباطؤ الطبيعي
        this.rotationSpeed = 0.03; // سرعة دوران القارب
        this.cameraOffset = new THREE.Vector3(300, 150, 0); // إزاحة الكاميرا بالنسبة للقارب

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
        this.windFolder.open();



        //water line
        this.waterLineParams = {
            x: -500,
            y: 20,
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
        this.waterFolder.open();


        //wind vector (green)
        const material1 = new THREE.LineBasicMaterial( { color: 0x00ff00 } );
        const points1 = [];
        points1.push( new THREE.Vector3(  0, 0, 0 ) );
        points1.push( new THREE.Vector3( 0, 0, 0 ) );
        const geometry1 = new THREE.BufferGeometry().setFromPoints( points1 );
        this.line1 = new THREE.Line( geometry1, material1 );
        this.scene.add(this.line1);

        //water vector (blue)
        const material2 = new THREE.LineBasicMaterial( { color: 0x0000ff } );
        const points2 = [];
        points2.push( new THREE.Vector3(  0, 0, 0 ) );
        points2.push( new THREE.Vector3( 0, 0, 0 ) );
        const geometry2 = new THREE.BufferGeometry().setFromPoints( points2 );
        this.line2 = new THREE.Line( geometry2, material2 );
        this.scene.add(this.line2);

        //engine vector (red)
        const material3 = new THREE.LineBasicMaterial( { color: 0xff0000 } );
        const points3 = [];
        points3.push( new THREE.Vector3(  0, 0, 0 ) );
        points3.push( new THREE.Vector3( 500, 15, 500 ) );
        const geometry3 = new THREE.BufferGeometry().setFromPoints( points3 );
        this.line3 = new THREE.Line( geometry3, material3 );
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

            const material = new THREE.LineBasicMaterial( { color: 0x000000 } );
            const points = [];
            points.push( new THREE.Vector3(  0, 15, 0 ) );
            points.push( new THREE.Vector3( -500, 15, 0) );
            const geometry = new THREE.BufferGeometry().setFromPoints( points );
            this.line = new THREE.Line( geometry, material );

            this.model.add(this.line);



        });
    }


    modelDimensions()
    {
        return this.boundingBox = new THREE.Box3().setFromObject(this.model);
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





    update()
    {

        if (this.model) { // التحقق من أن النموذج موجود

            // تحديث السرعة بناءً على المدخلات
            if (this.controls.isAccelerating) {
                this.speed += this.acceleration;
                if (this.speed > this.maxSpeed) this.speed = this.maxSpeed; // قصر السرعة على الحد الأقصى
            }
            if (this.controls.isBraking) {
                this.speed -= this.braking;
                if (this.speed < -this.maxSpeed) this.speed = -this.maxSpeed; // قصر السرعة على الحد الأدنى
            }

            // تطبيق الاحتكاك إذا لم يكن هناك تسارع أو فرملة
            if (!this.controls.isAccelerating && !this.controls.isBraking) {
                this.speed *= 1 - this.friction;
                if (Math.abs(this.speed) < 0.01) this.speed = 0; // إيقاف السرعة إذا كانت صغيرة جداً
            }

            // دوران النموذج بناءً على المدخلات
            if (this.controls.isTurningLeft) {
                this.model.rotation.y += this.rotationSpeed * (this.speed / this.maxSpeed);
                this.line3.rotation.y += this.rotationSpeed * (this.speed / this.maxSpeed);
            }
            if (this.controls.isTurningRight) {
                this.model.rotation.y -= this.rotationSpeed * (this.speed / this.maxSpeed);
                this.line3.rotation.y -= this.rotationSpeed * (this.speed / this.maxSpeed);

            }


            // if(!this.checkCollision())
                this.model.translateX(-this.speed);// تحريك النموذج بناءً على السرعة الحالية
                this.line3.geometry.attributes.position.array[3].translateX((-this.speed));


            //تحديث موقع الكاميرا بالنسبة لموقع القارب
            // const offset = this.cameraOffset.clone().applyMatrix4(this.model.matrixWorld);
            // this.camera.position.copy(offset);
            // this.camera.lookAt(this.model.position);

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
            this.moveFirstPoint(x, y, z, this.line1);
            this.moveSecondPoint(
                x + this.windLineParams.x,
                y + this.windLineParams.y,
                z + this.windLineParams.z,
                this.line1
            );

            //water arrow
            this.moveFirstPoint(x, y, z, this.line2);
            this.moveSecondPoint(
                x + this.waterLineParams.x,
                y + this.waterLineParams.y,
                z + this.waterLineParams.z,
                this.line2
            );

            //engine arrow
            this.moveFirstPoint(x, y + 15, z, this.line3);
            // if(x>=0 && z>=0)
            //     this.moveSecondPoint(x + (500), y + 15, z + (500), this.line3);
            // if(x>=0 && z<0)
            //     this.moveSecondPoint(x + (500), y + 15, z - (500), this.line3);
            // if(x<0 && z<0)
            //     this.moveSecondPoint(x - (500), y + 15, z - (500), this.line3);
            // if(x<0 && z>0)
            //     this.moveSecondPoint(x - (500), y + 15, z + (500), this.line3);

            // console.log(this.model.position);
            // this.angle(this.line1, this.line2);
        }
    }



    angle( line , line2 )
    {
        const positions1 = line.geometry.attributes.position.array;
        const pointA1 = new THREE.Vector3(positions1[0], positions1[1], positions1[2]);
        const pointA2 = new THREE.Vector3(positions1[3], positions1[4], positions1[5]);

        // استخراج النقاط من الخط الثاني
        const positions2 = line2.geometry.attributes.position.array;
        const pointB1 = new THREE.Vector3(positions2[0], positions2[1], positions2[2]);
        const pointB2 = new THREE.Vector3(positions2[3], positions2[4], positions2[5]);

        // حساب الاتجاه لكل خط
        const vectorA = new THREE.Vector3().subVectors(pointA2, pointA1);
        const vectorB = new THREE.Vector3().subVectors(pointB2, pointB1);

        // حساب الزاوية بين الاتجاهين
        const angle = vectorA.angleTo(vectorB);
        const angleInDegrees = THREE.MathUtils.radToDeg(angle);

        console.log(`The angle between the lines is ${angleInDegrees } degrees.`);

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
