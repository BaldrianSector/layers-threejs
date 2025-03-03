import * as THREE from 'three';

// Create and export camera
export function createCamera(aspect) {
    const camera = new THREE.OrthographicCamera(
        -aspect * 5, aspect * 5, 5, -5, 0.001, 1000
    );
    camera.position.set(3, 3, 5);
    camera.lookAt(0, 0, 0);
    return camera;
}