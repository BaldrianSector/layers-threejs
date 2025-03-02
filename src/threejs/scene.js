import * as THREE from 'three';
import data from './data.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { setupGUI } from './gui.js';
import { createCamera } from './camera.js';
import { handleResize } from './resizeHandler.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createTextMesh, createHeaderTextMesh } from './createTextMesh.js';
import { gsap } from "gsap";    
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(ScrollTrigger,ScrollToPlugin,TextPlugin);

// Deconstruct data object
const { planeData, textureData, options, fonts, colors, stack } = data;

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

    scene.background = new THREE.Color(colors.backgroundColor);

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

    const groupData = stack;

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

        // group.add(mesh);
    });

    // Create sphere
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ wireframe: true });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    // group.add(sphere);

    // Create custom 3d object from src/assets/3d_models/mountain.glb
    const loader = new GLTFLoader();
    loader.load('src/assets/3d_models/grid.glb', (gltf) => {
        gltf.scene.scale.set(1, 1, 1);
        // rotate 90 degrees
        gltf.scene.rotation.y = Math.PI / 2;
        const layer = new THREE.Group();
        
        // make a plane to put the 3d object on
        const planeGeometry = new THREE.PlaneGeometry(2.4, 4);
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        // rotate 90 degrees
        plane.rotation.x = Math.PI / 2;

        layer.add(plane);

        layer.add(gltf.scene);
            
        // group.add(layer);
    });

    // Create text with custom font
    createTextMesh(group, 'Minerals of global interest', 0.1, 0.1, 0.01, 100, false);
    createTextMesh(group, 'Greenland has a variety of minerals that are of global interest.', 0.1, 0.1, 0.01, 900, false);
    createTextMesh(group, 'Some italic text would look like this', 0.1, 0.1, 0.01, 500, true);

    // Create text with a different font
    createHeaderTextMesh(group, 'Greenland', 0.5, 0.1, 0.01, true);
    
    // Create a dashed line

    // For now this is just a fixed line between two points, but it should scale with the text and target object
    const dashedMaterial = new THREE.LineDashedMaterial( { color: 0xffffff, dashSize: 0.1, gapSize: 0.1 } )
    const points = [];
    points.push(new THREE.Vector3(0, 0, -2));
    points.push(new THREE.Vector3(0, 0, -8.86));
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(lineGeometry, dashedMaterial);
    line.computeLineDistances();
    
    const layer2 = new THREE.Group();
    layer2.add(line);
    createTextMesh(layer2, 'Greenland has a variety of minerals that are of global interest.', 0.1, 0.1, 0.01, 900, false, { x: 0, y: 0.1, z: -5 });
    
    group.add(layer2);
    
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
    setupGUI(scene, groupData, camera, renderer, setSpacingZ);
}

// Helper Functions

// Function to space out elements along a given axis
function spaceElements(group, axis, spacing) {
    const offset = (group.children.length - 1) * spacing / 2;
    group.children.forEach((child, index) => {
        child.position[axis] = index * spacing - offset;
    });
}

// Set spacingZ to 2 with gsap animation
function setSpacingZ() {
    gsap.to(stack, { spacingZ: 2, duration: 1 });
}


// Reset camera position
function resetCamera() {
    // reset camera position
    gsap.to(camera.position, { x: 3, y: 3, z: 5, duration: 1 });
}