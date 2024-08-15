export class ControlsManager {
    constructor()
    {
        this.isAccelerating = false;
        this.isBraking = false;
        this.isTurningLeft = false;
        this.isTurningRight = false;
        this.timerActive = false;
        this.timerInterval = null;
        this.timer = 0;

        window.addEventListener('keydown', (event) => this.onKeyDown(event));
        window.addEventListener('keyup', (event) => this.onKeyUp(event));
    }

    startTimer()
    {
        if (!this.timerActive)
        {
            this.timerActive = true;
            let start = new Date().getTime();
            this.timerInterval = setInterval(() => {
                let now = new Date().getTime();
                // this.timer = Math.round((now - start) / 1000);
                this.timer = (now - start) ;
                // console.log(`Timer: ${Math.round(this.timer / 1000)}`);
            }, 1000);
        }
    }

    stopTimer()
    {
        if (this.timerActive)
        {
            clearInterval(this.timerInterval);
            this.timerActive = false;
            console.log('Timer stopped');
        }
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
