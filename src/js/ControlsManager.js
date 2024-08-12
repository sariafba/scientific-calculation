export class ControlsManager
{
    constructor()
    {
        this.isAccelerating = false;
        this.isBraking = false;
        this.isTurningLeft = false;
        this.isTurningRight = false;


        window.addEventListener('keydown', (event) => this.onKeyDown(event));
        window.addEventListener('keyup', (event) => this.onKeyUp(event));
    }


    onKeyDown(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.isAccelerating = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.isBraking = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.isTurningLeft = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.isTurningRight = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.isAccelerating = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.isBraking = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.isTurningLeft = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.isTurningRight = false;
                break;
        }
    }
}
