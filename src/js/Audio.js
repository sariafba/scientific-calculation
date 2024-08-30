import * as THREE from 'three';
export class Audio
{

    constructor(camera)
    {
        this.camera = camera;

        // Create an AudioListener and add it to the camera
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);

        // Create a global audio source
        this.sound = new THREE.Audio(this.listener);

        // Load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('audio/wave-sound.mp3', (buffer) => {
            this.sound.setBuffer(buffer);
            this.sound.setLoop(true);
            this.sound.setVolume(0.7);
            // Optionally start playing immediately
            this.sound.play();
        });



        // // Create an AudioListener and add it to the camera
        // this.listenerE = new THREE.AudioListener();
        // this.camera.add(this.listenerE);

        // Create a global audio source
        this.soundE = new THREE.Audio(this.listener);

        // Load a sound and set it as the Audio object's buffer
        const audioLoaderE = new THREE.AudioLoader();
        audioLoaderE.load('audio/motor-sound.mp3', (buffer) => {
            this.soundE.setBuffer(buffer);
            this.soundE.setLoop(true);
            this.soundE.setVolume(0.2);
            // Optionally start playing immediately
            // this.soundE.play();
        });



    }


    playAudio()
    {
        if (this.soundE && !this.soundE.isPlaying)
        {
            this.soundE.play()
        }
    }

    pauseAudio()
    {
        if (this.soundE && this.soundE.isPlaying)
        {
            this.soundE.pause();
        }
    }

    // stopAudio()
    // {
    //     if (this.sound && this.sound.isPlaying)
    //     {
    //         this.sound.stop();
    //     }
    // }

}