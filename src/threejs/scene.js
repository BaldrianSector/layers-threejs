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
const { planeData, boxData, textureData, options, fonts, colors, stack } = data;

// Texture loader and caching
const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('anonymous');
const textureCache = new Map();

const debug = document.getElementById('debug');

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
    window.scene = scene
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

    function createBox(index) {
        const geometry = new THREE.BoxGeometry(
            boxData.dimensions.width, 
            boxData.dimensions.height, 
            boxData.dimensions.length
        );
    
        const box = boxData.boxes.find(b => b.number === index);
        const texture = getTexture(box.texture);
    
        // Ensure the texture repeats correctly instead of stretching
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);  // Adjust these values to fit your texture properly
    
        const material = new THREE.MeshStandardMaterial({ 
            map: texture, 
            transparent: false 
        });
    
        const boxMesh = new THREE.Mesh(geometry, material);
        group.add(boxMesh);
    }    

    createBox(2); // city nice
    createBox(3); // bugged
    createBox(5); // minerals
    createBox(6); // minerals nice
    createBox(9); // Ship cool
    createBox(10);
    createBox(11);
    createBox(12);
    createBox(13);
    createBox(14);
    createBox(15);
    createBox(16);
    createBox(17);
    createBox(18);
    

    // Create sphere
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ wireframe: true });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    // group.add(sphere);

    const layer3 = new THREE.Group();
    // Create 3D objects

    create3DObject('src/assets/3d_models/SmallHouse_red.glb', 0.1, 180, { x: 0, y: 0, z: 0 }, (object) => {layer3.add(object);});
    create3DObject('src/assets/3d_models/SmallHouse_red.glb', 0.1, 180, { x: 1, y: 0, z: 0.6 }, (object) => {layer3.add(object);});
    create3DObject('src/assets/3d_models/SmallHouse_blue.glb', 0.1, 180, { x: -1.3, y: 0, z: -3 }, (object) => {layer3.add(object);});
    
    group.add(layer3);

    // Create text with custom font
    // createTextMesh(group, 'Minerals of global interest', 0.1, 0.1, 0.01, 100, false);
    // createTextMesh(group, 'Greenland has a variety of minerals that are of global interest.', 0.1, 0.1, 0.01, 900, false);
    // createTextMesh(group, 'Some italic text would look like this', 0.1, 0.1, 0.01, 500, true);

    // // Create text with a different font
    // createHeaderTextMesh(group, 'Greenland', 0.5, 0.1, 0.01, true);
    
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
    
    // group.add(layer2);
    
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
    
        // Avoid circular references in debug output
        debug.innerHTML = `Group Data: ${JSON.stringify(groupData, getCircularReplacer(), 2)}`;
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
        const newPos = index * spacing - offset;
        // Only updateanim position if value has changed
        if (child.position[axis] !== newPos) {
            child.position[axis] = newPos;
            
            // Assuming each child is a plane with properties: width, height, and position = [x, y, z]
            // We assume the plane is centered at child.position and lies on the XY-plane.
            const halfWidth = child.width / 2;
            const halfHeight = child.height / 2;
            const x = child.position[0];
            const y = child.position[1];
            const z = child.position[2];
            
            // Calculate the four corners of the plane
            const topLeft = [x - halfWidth, y + halfHeight, z];
            const topRight = [x + halfWidth, y + halfHeight, z];
            const bottomLeft = [x - halfWidth, y - halfHeight, z];
            const bottomRight = [x + halfWidth, y - halfHeight, z];
            
            // console.log(`Child ${index} corners:`, topLeft, topRight, bottomLeft, bottomRight);
        }
        
    });
}


// Set spacingZ to 2 with gsap animation
function setSpacingZ() {
    gsap.to(stack, { spacingZ: 2, duration: 1 });
}


// Reset camera position
function resetCamera(camera) {
    // reset camera position
    gsap.to(camera.position, { x: 3, y: 3, z: 5, duration: 1 });
}

function getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return "[Circular]"; // Prevent circular reference
            }
            seen.add(value);
        }
        return value;
    };
}    

function create3DObject(path, scale, rotation, position, callback) {
    const loader = new GLTFLoader();
    loader.load(path, (gltf) => {
        gltf.scene.scale.set(scale, scale, scale);
        gltf.scene.rotation.y = dtr(rotation);
        gltf.scene.position.set(position.x, position.y, position.z);
        callback(gltf.scene);
    });
}

function dtr(degrees) {
    return degrees * (Math.PI / 180);
}