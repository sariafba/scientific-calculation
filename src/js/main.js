import { SceneManager } from './SceneManager';
import { EnvironmentManager } from './EnvironmentManager.js';
import { ControlsManager } from './ControlsManager.js';
import { ModelManager } from './ModelManager.js';
import {Land} from './land.js';
import {Audio} from './Audio'

document.addEventListener('DOMContentLoaded', () => {

    //initialize container
    const container = document.body;


    //main objects
    const sceneManager = new SceneManager(container);
    const environmentManager = new EnvironmentManager(sceneManager.scene);
    const controlsManager = new ControlsManager();
    const land = new Land(sceneManager.scene);
    const audio = new Audio(sceneManager.camera);
    const modelManager = new ModelManager(sceneManager.scene, sceneManager.camera, controlsManager, land, audio);


    //main loop
    function animate() {

        requestAnimationFrame(animate);

        sceneManager.render();

        environmentManager.updateWater(1.0 / 60.0);

        modelManager.update();
    }

    animate();

});
