import * as THREE from 'three';
export class Audio
{
    constructor(camera)
    {
        this.camera = camera;

        // create an AudioListener and add it to the camera
        const listener = new THREE.AudioListener();
        this.camera.add( listener );

        // create a global audio source
        const sound = new THREE.Audio( listener );

        // load a sound and set it as the Audio object's buffer
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( 'audio/wave-sound.mp3', function( buffer ) {
            sound.setBuffer( buffer );
            sound.setLoop( true );
            sound.setVolume( 0.5 );
            sound.play();
        });
    }

}