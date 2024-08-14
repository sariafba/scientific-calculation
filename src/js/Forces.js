import * as dat from "dat.gui";

export class Forces {

    constructor()
    {
        this.boatMass = 22000;
        /**
         *
         * dat.GUI configuration
         *
         */

        const gui = new dat.GUI();

        //general params
         this.params = {
            Boat_Mass: 22,
            V: (15) * (1.5) * (1),
            rho: 1000,
            gravity: 9.81,
        };
        gui.add(this.params, 'Boat_Mass', 20, 30).name('Boat Mass (ton)').onChange((value) => {
            this.setBoatMass(value);
        });
        gui.add(this.params, 'rho', 500, 2000).name('Rho').onChange((value) => {
            this.params.rho = value;

            // Update rho in other parameter groups
            this.engineParams.rho = value;
            this.waterParams.rho = value;
            this.windParams.rho = value;

            // Update the displayed values in the GUI
            this.updateGUI();
        });


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
            rho: this.params.rho,
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
            rho: this.params.rho,
            a: (((15+16)*1.5*0.5) * 2) + (((1+1.2)*1.5*0.5) * 2),
            v: 1,
            cd:0.5,
        }
        this.waterFolder.add(this.params, 'rho').name('Rho (kg.m^-3)');
        this.waterFolder.add(this.waterParams, 'a').name('A (m^2)');
        this.waterFolder.add(this.waterParams, 'cd').name('Cd');
        this.waterFolder.add(this.waterParams, 'v').name('v^2 (m.s^-1)');

        this.waterFolder.open();

        //wind params
        this.windFolder = gui.addFolder('Wind Parameters');
        this.windParams = {
            rho: this.params.rho,
            a: (((15+16)* 3 * 0.5) * 2) + (((1+1.2) * 3 * 0.5) * 2),
            v: 1,
            cd:0.5,
        }
        this.windFolder.add(this.params, 'rho').name('Rho (kg.m^-3)');
        this.windFolder.add(this.windParams, 'a').name('A (m^2)');
        this.windFolder.add(this.windParams, 'cd').name('Cd');
        this.windFolder.add(this.windParams, 'v').name('v^2 (m.s^-1)');

        this.windFolder.open();

    }

    updateGUI() {
        // Manually update the values displayed in the GUI for rho in the engine, water, and wind folders
        this.engineFolder.__controllers.forEach(controller => controller.updateDisplay());
        this.waterFolder.__controllers.forEach(controller => controller.updateDisplay());
        this.windFolder.__controllers.forEach(controller => controller.updateDisplay());
    }

    setBoatMass(value)
    {
        this.boatMass = value * 1000
    }


    intensityOfEnginePower()
    {
        return this.forcesData.Engine_Force = this.engineParams.kt
            * this.params.rho
            * Math.pow(this.engineParams.n/60,2)
            * Math.pow(this.engineParams.d, 4);
    }

    intensityOfWindResistance()
    {
        return this.forcesData.Wind_Resistance = 0.5
            * this.params.rho
            * this.windParams.a
            * this.windParams.cd
            * Math.pow(this.windParams.v, 2);
    }

    intensityOfWaterResistance()
    {
        return this.forcesData.Water_Resistance = 0.5
            * this.params.rho
            * this.waterParams.a
            * this.windParams.cd
            * Math.pow(this.waterParams.v, 2);
    }

    intensityOfBuoyancyPower()
    {
        return this.forcesData.Buoyant_Force = this.params.rho * this.params.gravity * this.params.V
    }

    intensityOfWeightPower()
    {
        return this.forcesData.Weight = this.boatMass * this.params.gravity;
    }
}