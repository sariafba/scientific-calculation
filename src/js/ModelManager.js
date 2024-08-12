import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';
import * as dat from "dat.gui";

export class ModelManager
{
    constructor(scene, camera, controls)
    {
        this.scene = scene; // مشهد 3D يتم إضافته من SceneManager
        this.camera = camera; // كاميرا 3D من SceneManager
        this.controls = controls; // إدارة المدخلات والتحكم من ControlsManager

        this.model = null; // متغير للاحتفاظ بنموذج القارب

        this.waterReplacedVolume =  (15) * (1.5) * (1); // حساب الحجم بوحدة المتر المكعب
        this.boatMass = this.setBoatMass(22); // كتلة القارب بالافتراضي
        this.rho = 1000;

        this.densityOfWater = 1000; // كثافة الماء بالكيلوغرام لكل متر مكعب (ثابت)
        this.gravity = 9.81; // تسارع الجاذبية بالمتر لكل ثانية مربعة (ثابت)


        this.speed = 0; // السرعة الحالية للقارب
        this.maxSpeed = 30; // السرعة القصوى للقارب
        this.acceleration = 0.5; // التسارع عند التسارع
        this.braking = 0.1; // التباطؤ عند الفرملة
        this.friction = 0.05; // معامل الاحتكاك الذي يؤثر على التباطؤ الطبيعي
        this.rotationSpeed = 0.03; // سرعة دوران القارب
        this.cameraOffset = new THREE.Vector3(300, 150, 0); // إزاحة الكاميرا بالنسبة للقارب

        /**
         * line
         * */
        const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
        const points = [];
        points.push( new THREE.Vector3(  0, 0, -500 ) );
        points.push( new THREE.Vector3( 0, 100, -500 ) );
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        this.line = new THREE.Line( geometry, material );



        this.scene.add(this.line);


        /**
         *
         * dat.GUI configuration
         *
         */
        const gui = new dat.GUI();

        //general params
        const params = {
            boatMass: 22,
            v: this.waterReplacedVolume
        };
        gui.add(params, 'boatMass', 20, 30).name('Boat Mass (ton)').onChange((value) => {
            this.setBoatMass(value);
        });
        // gui.add(params, 'v').name('V (m^3)');


        //Forces Folder
        this.forcesFolder = gui.addFolder('Forces');
        this.forcesData = {
            Weight: 0,
            Buoyant_Force: 0,
            Engine_Force: 0,
            Water_Resistance: 0,
            Wind_Resistance: 0
        };

        this.forcesFolder.add(this.forcesData, 'Weight').listen();
        this.forcesFolder.add(this.forcesData, 'Buoyant_Force').listen();
        this.forcesFolder.add(this.forcesData, 'Engine_Force').listen();
        this.forcesFolder.add(this.forcesData, 'Water_Resistance').listen();
        this.forcesFolder.add(this.forcesData, 'Wind_Resistance').listen();

        this.forcesFolder.open();

        //engine params
        this.engineFolder = gui.addFolder('Engine Parameters'); // Create a folder
        this.engineParams = {
            kt:0.2,
            rho: this.rho,
            n:1200,
            d:0.5
        }
        this.engineFolder.add(this.engineParams, 'kt').name('Kt');
        this.engineFolder.add(this.engineParams, 'rho').name('Rho (kg.m^-3)');
        this.engineFolder.add(this.engineParams, 'n', 1000, 1500, 100).name('n (rpm)').onChange((value) => {
            this.engineParams.n = value;
            this.intensityOfEnginePower(this.engineParams);
        });
        this.engineFolder.add(this.engineParams, 'd', 0, 1, 0.1).name('d (m)').onChange((value) => {
            this.engineParams.d = value;
            this.intensityOfEnginePower(this.engineParams);

        });
        this.engineFolder.open();

        //water params
        this.waterFolder = gui.addFolder('Water Parameters'); // Create a folder
        this.waterParams = {
            rho: this.rho,
            a: (((15+16)*1.5*0.5) * 2) + (((1+1.2)*1.5*0.5) * 2),
            v: 1,
            cd:0.5,
        }
        this.waterFolder.add(this.waterParams, 'rho').name('Rho (kg.m^-3)');
        this.waterFolder.add(this.waterParams, 'a').name('A (m^2)');
        this.waterFolder.add(this.waterParams, 'cd').name('Cd');
        this.waterFolder.add(this.waterParams, 'v').name('v^2 (m.s^-1)');

        this.waterFolder.open();

        //wind params
        this.windFolder = gui.addFolder('Wind Parameters');
        this.windParams = {
            rho: this.rho,
            a: (((15+16)* 3 * 0.5) * 2) + (((1+1.2) * 3 * 0.5) * 2),
            v: 1,
            cd:0.5,
        }
        this.windFolder.add(this.windParams, 'rho').name('Rho (kg.m^-3)');
        this.windFolder.add(this.windParams, 'a').name('A (m^2)');
        this.windFolder.add(this.windParams, 'cd').name('Cd');
        this.windFolder.add(this.windParams, 'v').name('v^2 (m.s^-1)');

        this.windFolder.open();



        this.loadModel(); // تحميل نموذج القارب
    }

    moveFirstPoint(newX, newY, newZ) {
    this.line.geometry.attributes.position.array[0] = newX;
    this.line.geometry.attributes.position.array[1] = newY;
    this.line.geometry.attributes.position.array[2] = newZ;

    this.line.geometry.attributes.position.needsUpdate = true;
}
    moveSecondPoint(newX, newY, newZ) {
        this.line.geometry.attributes.position.array[3] = newX;
        this.line.geometry.attributes.position.array[4] = newY;
        this.line.geometry.attributes.position.array[5] = newZ;

        this.line.geometry.attributes.position.needsUpdate = true;
    }

    setBoatMass(mass)
    {
        return this.boatMass = mass * 1000; // تعيين الوزن الجديد للقارب
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
            // this.volumeUnderWater();
        });

    }


    // volumeUnderWater()
    // {
    //     //حساب حجم السائل الذي يزيحه الجسم المغمور في الماء
    //     const boundingBox = new THREE.Box3().setFromObject(this.model);//z=-180 to 180 y=0 to 127 x=-50 to 50
    //     const size = new THREE.Vector3();
    //     boundingBox.getSize(size);
    //     console.log(size);
    //     //size.y = 12.7 of the boat so 1.27 is part under sea
    //     this.waterReplacedVolume =  (size.x/10) * (1.27) * (size.z/10); // حساب الحجم بوحدة المتر المكعب
    // }


    update()
    {
        if (this.model) { // التحقق من أن النموذج موجود
            // تحديث السرعة بناءً على المدخلات
            if (this.controls.isAccelerating) {

                // this.acceleration = this.intensityOfEnginePower(this.engineParams.kt, this.densityOfWater, this.engineParams.n, this.engineParams.d) / (this.boatMass * 1000)
                // console.log('acceleration:' + this.acceleration, 'speed: ' + this.speed)

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
            }
            if (this.controls.isTurningRight) {
                this.model.rotation.y -= this.rotationSpeed * (this.speed / this.maxSpeed);
            }

            this.model.translateX(-this.speed); // تحريك النموذج بناءً على السرعة الحالية


            //تحديث موقع الكاميرا بالنسبة لموقع القارب
            const offset = this.cameraOffset.clone().applyMatrix4(this.model.matrixWorld);
            this.camera.position.copy(offset);
            this.camera.lookAt(this.model.position);


            this.applyBuoyancy(); // تطبيق الطفو
            this.intensityOfEnginePower(this.engineParams);
            this.intensityOfWaterResistance(this.waterParams);
            this.intensityOfWindResistance(this.windParams);
            this.moveFirstPoint(this.model.position.x, this.model.position.y, this.model.position.z)
            this.moveSecondPoint(this.model.position.x, this.model.position.y+100, this.model.position.z-500)
        }
    }

    intensityOfEnginePower(engineParams)
    {
        return this.forcesData.Engine_Force = engineParams.kt
            * engineParams.rho
            * Math.pow(engineParams.n/60,2)
            * Math.pow(engineParams.d, 4);
    }

    intensityOfWindResistance(windParams){
        return this.forcesData.Wind_Resistance = 0.5 * this.windParams.rho * this.windParams.a * this.windParams.cd * Math.pow(this.windParams.v, 2);
    }

    intensityOfWaterResistance(waterParams){
        return this.forcesData.Water_Resistance = 0.5 * this.waterParams.rho * this.waterParams.a * this.windParams.cd * Math.pow(this.waterParams.v, 2);
    }

    applyBuoyancy()
    {
        if (this.model) //التحقق من أن النموذج موجود
        {
            // حساب قوة الطفو والثقل
            const buoyantForce = this.densityOfWater * this.gravity * this.waterReplacedVolume; // قوة الطفو بال نيوتن
            const weight = this.boatMass * this.gravity; // وزن القارب بال نيوتن


            // تحديث القيم في `dat.gui`
            this.forcesData.Buoyant_Force = buoyantForce;
            this.forcesData.Weight = weight;

            // تعديل موضع القارب بناءً على الفرق بين قوة الطفو والثقل
            if (weight > buoyantForce) {
                // إذا كانت قوة الثقل أكبر من الطفو، يغرق القارب
                this.model.position.y -= (weight - buoyantForce) / this.boatMass * 0.1; // غرق القارب

                if(this.model.position.y <= -60)
                    this.model.position.y = -60;
            }

            else if (weight <= buoyantForce) {
                // إذا كانت قوة الطفو أكبر من الثقل، يطفو القارب
                this.model.position.y += (weight + buoyantForce) / this.boatMass * 0.1; // غرق القارب

                if(this.model.position.y >= -10)
                    this.model.position.y = -10;
            }
        }
    }

}
