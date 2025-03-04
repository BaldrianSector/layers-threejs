import * as THREE from 'three';
import data from './data.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { setupGUI } from './gui.js';
import { createCamera } from './camera.js';
import { handleResize } from './resizeHandler.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createTextMesh, createHeaderTextMesh } from './createTextMesh.js';
import { createLine } from './createLine.js';
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
    renderer.setPixelRatio(window.devicePixelRatio);
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
        return boxMesh;
    }    
    
    const layer1 = createBox(12);  // White ice
    const layer2 = createBox(3);   // Satelite
    const layer3 = createBox(4);   // Map
    const layer4 = createBox(18);   // Village
    const layer5 = createBox(8);   // Colors1
    const layer6 = createBox(10);  // Colors2
    const layer7 = createBox(11);  // Dirt

    group.add(layer4);
    // Create sphere
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ wireframe: true });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    // group.add(sphere);

    
    // Create 3D objects
    const houseGroup = new THREE.Group();    
    create3DObject('src/assets/3d_models/SmallHouse_red.glb', 0.1, 190, { x: 0.35, y: 0.1, z: 0 }, (object) => {houseGroup.add(object);});
    create3DObject('src/assets/3d_models/SmallHouse_red.glb', 0.1, 10, { x: 0.8, y: 0.1, z: 0.6 }, (object) => {houseGroup.add(object);});
    create3DObject('src/assets/3d_models/SmallHouse_blue.glb', 0.1, 190, { x: 0, y: 0.1, z: 1.3 }, (object) => {houseGroup.add(object);});
    create3DObject('src/assets/3d_models/SmallHouse_blue.glb', 0.1, 10, { x: -0.1, y: 0.1, z: -0.7 }, (object) => {houseGroup.add(object);});
    create3DObject('src/assets/3d_models/SmallHouse_green.glb', 0.1, 10, { x: 1, y: 0.1, z: -0.3 }, (object) => {houseGroup.add(object);});

    layer4.add(houseGroup);

    group.add(layer1);
    group.add(layer2);
    group.add(layer3);
    group.add(layer4);
    group.add(layer5);
    group.add(layer6);
    group.add(layer7);

    // Create text with custom font
    // createTextMesh(group, 'Minerals of global interest', 0.1, 0.1, 0.01, 100, false);
    // createTextMesh(group, 'Greenland has a variety of minerals that are of global interest.', 0.1, 0.1, 0.01, 900, false);
    // createTextMesh(group, 'Some italic text would look like this', 0.1, 0.1, 0.01, 500, true);
    
    // Create text with a different font
    createHeaderTextMesh(scene, 'Greenland', 0.5, 0.1, 0.01, { x: 0, y: 0, z: -2.3}, { tag: "header"}, { x: 0, y: 11, z: -2.3 });
    createTextMesh(scene, 'Responsible mining, independent future.', 0.1, 0.1, 0.01, 400, false, false, true, { x: 0, y: 0, z: -1.9 }, { tag: "header" }, { x: 0, y: 10, z: -1.9 })

    // Create a dashed line
    createTextMesh(layer1, 'Layer1', 0.1, 0.1, 0.01, 900, false, true, false, { x: 1.2, y: 0.1, z: -3 }, {tag: "text"});
    createTextMesh(layer3, 'Layer3', 0.1, 0.1, 0.01, 900, false, true, false, { x: 1.2, y: 0.1, z: -3 }, {tag: "text"});
    createTextMesh(layer2, 'Layer2', 0.1, 0.1, 0.01, 900, false, true, false, { x: 1.2, y: 0.1, z: -3 }, {tag: "text"});
    createTextMesh(layer4, 'Layer4', 0.1, 0.1, 0.01, 900, false, true, false, { x: 1.2, y: 0.1, z: -3 }, {tag: "text"});
    createTextMesh(layer5, 'Layer5', 0.1, 0.1, 0.01, 900, false, true, false, { x: 1.2, y: 0.1, z: -3 }, {tag: "text"});
    createTextMesh(layer6, 'Layer6', 0.1, 0.1, 0.01, 900, false, true, false, { x: 1.2, y: 0.1, z: -3 }, {tag: "text"});
    createTextMesh(layer7, 'Layer7', 0.1, 0.1, 0.01, 900, false, true, false, { x: 1.2, y: 0.1, z: -3 }, {tag: "text"});
    createLine(layer1, 0.1, 0.1, { x: 1.2, y: 0, z: -2.2 }, { x: 1.2, y: 0, z: -6.86 }, {tag: "text"});
    createLine(layer2, 0.1, 0.1, { x: 1.2, y: 0, z: -2.2 }, { x: 1.2, y: 0, z: -6.86 }, {tag: "text"});
    createLine(layer3, 0.1, 0.1, { x: 1.2, y: 0, z: -2.2 }, { x: 1.2, y: 0, z: -6.86 }, {tag: "text"});
    createLine(layer4, 0.1, 0.1, { x: 1.2, y: 0, z: -2.2 }, { x: 1.2, y: 0, z: -6.86 }, {tag: "text"});
    createLine(layer5, 0.1, 0.1, { x: 1.2, y: 0, z: -2.2 }, { x: 1.2, y: 0, z: -6.86 }, {tag: "text"});
    createLine(layer6, 0.1, 0.1, { x: 1.2, y: 0, z: -2.2 }, { x: 1.2, y: 0, z: -6.86 }, {tag: "text"});
    createLine(layer7, 0.1, 0.1, { x: 1.2, y: 0, z: -2.2 }, { x: 1.2, y: 0, z: -6.86 }, {tag: "text"});
    
    // const layer2 = new THREE.Group();
    // layer2.add(line);
    // createTextMesh(layer2, 'Greenland has a variety of minerals that are of global interest.', 0.1, 0.1, 0.01, 900, false, { x: 1.2, y: 0.1, z: -5 });
    
    // group.add(layer2);
    
    scene.add(group);
    

    // View State
    const states = [state1, state2, state3, state4, state5, state6, state7];
    let currentState = 0; // Start at the first state
    state1(); // Execute the first state function
    
    // Box chosen
    let chosenBox = 0;

    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight' && currentState < states.length - 1) {
            currentState++;
            states[currentState](); // Execute the next state function
        } else if (event.key === 'ArrowLeft' && currentState > 0) {
            currentState--;
            states[currentState](); // Execute the previous state function
        }
        // Increment chosen box
        if (event.key === 'ArrowDown' && chosenBox < group.children.length - 1) {
            chosenBox++;
        }
        if (event.key === 'ArrowUp' && chosenBox > 0) {
            chosenBox--;
        }

    });
    
    
    
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        
        controls.update();
        
        // Apply spacing to X, Y, and Z axes
        spaceElements(group, 'x', groupData.spacingX);
        spaceElements(group, 'y', groupData.spacingY);
        spaceElements(group, 'z', groupData.spacingZ);
        
        // Update group's scale and rotation based on groupData
        group.scale.set(groupData.scale, groupData.scale, groupData.scale);
        group.rotation.y = groupData.rotation;
        
        // Hacky solution. Not very smooth but good enough for rock.
        // Update stack Y position to match the chosen box if in state 5 or 6
        if (currentState === 4 ) {
            gsap.to(group.position, { y: group.children[chosenBox].position.y, duration: 1});
        } else if (currentState === 5) {
            gsap.to(group.position, { y: group.children[chosenBox].position.y, duration: 0});
        }

        // Avoid circular references in debug output
        debug.innerHTML = `Group Data: ${JSON.stringify(groupData, getCircularReplacer(), 2)}, Camera Position: ${JSON.stringify(camera.position, getCircularReplacer(), 2)}, State ${currentState + 1}, Chosen Box: ${chosenBox}`;
    }
    
    animate();
    handleResize(camera, renderer);
    
    // GUI
    setupGUI(scene, groupData, camera, renderer, setSpacingZ);


    // Camera positions

    // Landing
    function state1() {
        // Topdown view
        gsap.to(camera.position, { x: 0, y: 5, z: 0, duration: 0 }, '');
        // Slight offset on Z-axis
        gsap.to(group.position, { z: 0.5, duration: 0 });
        // Slight zoom out
        gsap.to(camera, { zoom: 0.8, duration: 0, ease: "power2.inOut",
            onUpdate: () => {
                camera.updateProjectionMatrix();
            }
        });

        opacityChangeFromTag(group, "text", 0, 0);
        opacityChangeFromTag(scene, "header", 1, 0);
    }
    
    // Soloing out
    function state2() {
        // Topdown view
        gsap.to(camera.position, { x: 0, y: 5, z: 0, duration: 1.5 }, '');
        // Reset zoom
        gsap.to(camera, { zoom: 1, duration: 1, ease: "ease.inOut",
            onUpdate: () => {
                camera.updateProjectionMatrix();
            }
        });
        // Reset spacing along X-axis
        gsap.to(stack, { spacingX: 0, duration: 1, ease: "power3.inOut" });

        // Set houses to 0 opacity
        opacityChange(houseGroup, 0, 0);
        opacityChangeFromTag(scene, "header", 1, 1);
    }
    
    // Slide out
    function state3() {
        // Topdown view
        gsap.to(camera.position, { x: 0, y: 5, z: 0, duration: 1.5 }, '');
        // Reset zoom
        gsap.to(camera, { zoom: 0.8, duration: 3, ease: "ease.inOut",
            onUpdate: () => {
                camera.updateProjectionMatrix();
            }
        });
        // Space out elements along X-axis
        gsap.to(stack, { spacingX: -2.6, duration: 3, ease: "power3.inOut" });

        // Set header to 1 opacity
        opacityChangeFromTag(scene, "header", 1, 1.5);
    }
    
    // Wow moment
    function state4() {
        // Angle view
        gsap.to(camera.position, { x: 3, y: 2.5, z: 5, duration: 3, ease: "power3.inOut" });
        // Reset spacing along Y-axis
        gsap.to(stack, { spacingY: 0.75, duration: 3, ease: "power3.inOut" });
        // Reset spacing along X-axis
        gsap.to(stack, { spacingX: 0, duration: 3, ease: "power3.inOut" });
        // Reset zoom
        gsap.to(camera, { zoom: 1, duration: 3, ease: "ease.inOut",
            onUpdate: () => {
                camera.updateProjectionMatrix();
            }
        });

        // Set houses to 0 opacity
        opacityChange(houseGroup, 0, 3);

        // Reset group XYZ position
        gsap.to(group.position, { y: 0, duration: 3 });
        gsap.to(group.position, { x: 0, duration: 3 });

        // Fade out titles
        opacityChangeFromTag(group, "text", 0, 1.5);

        // Set header to 0 opacity
        opacityChangeFromTag(scene, "header", 0, 1.5);
    }
    
    // Individual scroll
    function state5() {
        // Flat angle view
        gsap.to(camera.position, { x: 3, y: 1.3, z: 2, duration: 3 });
        // Set big spacing along Y-axis
        gsap.to(stack, { spacingY: 2.3, duration: 3 });
        // Zoom in
        gsap.to(camera, { zoom: 1.5, duration: 3, ease: "ease.inOut",
            onUpdate: () => {
                camera.updateProjectionMatrix();
            }
        });
        // Push group left
        gsap.to(group.position, { x: -1.2, duration: 3 });
        gsap.to(group.position, { z: 1.2, duration: 3 });

        // Fade in houses
        opacityChange(houseGroup, 1, 3);
        
        // Fade in titles
        opacityChangeFromTag(group, "text", 1, 1.5);
    }
    
    // Individual near + text
    function state6() {
        // Flat angle view
        gsap.to(camera.position, { x: 3, y: 1.3, z: 2, duration: 3 });
        // Off screen spacing along Y-axis
        gsap.to(stack, { spacingY: 5, duration: 3, ease: "power3.inOut" });
        // Zoom in
        gsap.to(camera, { zoom: 1.6, duration: 3, ease: "ease.inOut",
            onUpdate: () => {
                camera.updateProjectionMatrix();
            }
        });

        // Push group left
        gsap.to(group.position, { x: -1.2, duration: 3 });
        gsap.to(group.position, { z: 1.2, duration: 3 });
        
        // Fade in houses
        opacityChange(houseGroup, 1, 1.5);

        // Fade in titles
        opacityChangeFromTag(group, "text", 1, 1.5);
    }

    // End
    function state7() {
        // Side view
        gsap.to(camera.position, { x: 3, y: 0, z: 0, duration: 3 });
        // Off screen spacing along Y-axis
        gsap.to(stack, { spacingY: 0.65, duration: 3, ease: "power3.inOut" });
        // Zoom in
        gsap.to(camera, { zoom: 1, duration: 3, ease: "ease.inOut",
            onUpdate: () => {
                camera.updateProjectionMatrix();
            }
        });
        // Reset group Y position
        gsap.to(group.position, { y: 0, duration: 3 });

        // Reset group X and Z position
        gsap.to(group.position, { x: 0, duration: 3 });
        gsap.to(group.position, { z: 0, duration: 3 });
        
        // Fade out houses
        opacityChange(houseGroup, 0, 2.5);

        // Fade out titles
        opacityChangeFromTag(group, "text", 0, 1.5);
    }
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

function opacityChange(targetParent, opacityValue, duration) {
    targetParent.traverse(child => {
        if (child.isMesh) {
            child.material.transparent = true;
            gsap.to(child.material, { opacity: opacityValue, duration: duration, ease: "power2.inOut" });
        }
    });
}

function opacityChangeFromTag(targetParent, tagValue, opacityValue, duration) {
    targetParent.traverse(child => {
        // Check if userData exists and if the tag matches.
        if (child.userData && child.userData.tag === tagValue) {
            // Also ensure that the material exists before modifying it.
            if (child.material) {
                child.material.transparent = true;
                gsap.to(child.material, { 
                    opacity: opacityValue, 
                    duration: duration, 
                    ease: "power2.inOut" 
                });
            }
        }
    });
}
