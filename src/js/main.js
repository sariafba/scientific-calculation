// src/main.js
import { SceneManager } from './SceneManager';
import { EnvironmentManager } from './EnvironmentManager.js';
import { ControlsManager } from './ControlsManager.js';
import { ModelManager } from './ModelManager.js';
import {Land} from './land.js';
import {Forces} from "./Forces";

document.addEventListener('DOMContentLoaded', () => {

    //initialize container
    const container = document.body;


    //main objects
    const sceneManager = new SceneManager(container);
    const environmentManager = new EnvironmentManager(sceneManager.scene);
    const controlsManager = new ControlsManager();
    const land = new Land(sceneManager.scene);
    const forces = new Forces();
    const modelManager = new ModelManager(sceneManager.scene, sceneManager.camera, controlsManager, land, forces);
    modelManager.forces = forces;


    //main loop
    function animate() {

        requestAnimationFrame(animate);

        sceneManager.render();

        environmentManager.updateWater(1.0 / 60.0);

        modelManager.update();
    }

    animate();
});
