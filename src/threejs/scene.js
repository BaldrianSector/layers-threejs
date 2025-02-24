import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export function createScene() {

    // Create the scene
    const scene = new THREE.Scene();

    // Set up the camera
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    // Create the renderer and attach it to the document
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create a cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
    });

    let planes = 11;

    for (let i = 0; i < planes; i++) {
        const newGeometry = new THREE.BoxGeometry(1.2, 0.1, 2); // Make the cube rectangular
    
        // Compute a gray value ranging from 0 (black) to 1 (white)
        let gray = i / (planes - 1);
        const color = new THREE.Color(gray, gray, gray);
    
        const material = new THREE.MeshBasicMaterial({ color: color });
    
        const newPlane = new THREE.Mesh(newGeometry, material);
        newPlane.position.y = -2.5 + i * 0.5;
        scene.add(newPlane);
    }

    // draw a line down the center of the scene

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const points = [];
    points.push(new THREE.Vector3(0, - 2.5, 0));
    points.push(new THREE.Vector3(0, 2.5, 0));
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);

    // add OrbitControls
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Rotate the cube for some basic animation
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;

        renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

}