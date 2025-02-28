import * as THREE from 'three';
import data from './data.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { setupGUI } from './gui.js';
import { createCamera } from './camera.js';
import { handleResize } from './resizeHandler.js';

// Deconstruct data object
const { planeData, textureData, options } = data;

// Texture loader and caching
const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('anonymous');
const textureCache = new Map();

function getTexture(path) {
    if (!path) {
        console.error('Texture path is undefined');
        return null;
    }
    if (!textureCache.has(path)) {
        const texture = textureLoader.load(
            path,
            undefined,
            (error) => { console.error(`Error loading texture: ${path}`, error); }
        );
        textureCache.set(path, texture);
    }
    return textureCache.get(path);
}

// Create scene
export function createScene() {
    const scene = new THREE.Scene();
    const aspect = window.innerWidth / window.innerHeight;
    
    // Create camera
    const camera = createCamera(aspect);

    scene.background = new THREE.Color(options.backgroundColor); // Light blue

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 3);
    scene.add(ambientLight);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Create group for objects
    const group = new THREE.Group();

    let groupData = {
        spacingY: 1.5,
        spacingX: 0,
        spacingZ: 0,
        scale: 1,
        rotation: 0,
    };

    // Create planes
    planeData.planes.forEach((plane) => {
        const texture = getTexture(plane.texture);
        if (!texture) {
            console.error(`Texture for path ${plane.texture} could not be loaded.`);
            return;
        }

        const materialOptions = { map: texture, transparent: true };

        // Optionally add displacement map if enabled in planeData
        if (planeData.useDisplacement) {
            const displacementTexture = getTexture(plane.displacement);
            if (displacementTexture) {
                materialOptions.displacementMap = displacementTexture;
            }
        }

        const material = new THREE.MeshPhongMaterial(materialOptions);
        const geometry = new THREE.PlaneGeometry(planeData.dimensions. width, planeData.dimensions.length);
        material.side = THREE.DoubleSide;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotateX(Math.PI / 2);
        group.add(mesh);
    });

    // Create sphere
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ wireframe: true });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    group.add(sphere);

    scene.add(group);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);

        // Apply spacing to X, Y, and Z axes
        spaceElements(group, 'x', groupData.spacingX);
        spaceElements(group, 'y', groupData.spacingY);
        spaceElements(group, 'z', groupData.spacingZ);

        // Update group's scale and rotation based on groupData
        group.scale.set(groupData.scale, groupData.scale, groupData.scale);
        group.rotation.y = groupData.rotation;
    }

    animate();
    handleResize(camera, renderer);

    // GUI
    setupGUI(scene, groupData, camera, renderer);
}

// Helper Functions

// Function to space out elements along a given axis
function spaceElements(group, axis, spacing) {
    const offset = (group.children.length - 1) * spacing / 2;
    group.children.forEach((child, index) => {
        child.position[axis] = index * spacing - offset;
    });
}
