// Detect hover on 3D objects

import * as THREE from 'three';

export function detectHover(group) {
    // Create raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Add event listener for mouse move
    document.addEventListener('mousemove', onDocumentMouseMove);

    function onDocumentMouseMove(event) {
        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }

    function detectHover() {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(group.children, true);
        if (intersects.length > 0) {
            intersects[0].object.material.color.set(0xff0000);
        }
    }
}