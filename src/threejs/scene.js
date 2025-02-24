import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';

// Create a GUI
const gui = new GUI();

// Data for planes
const planeData = {
    planes: 7,
    spacing: 0.6,
    dimensions: {
        width: 2.4,
        height: 0.2,
        length: 4
    },
    useTexture: true // Add this property to toggle between color and texture
};

const options = {
    showGrid: true
};

// Texture paths (but not loading them upfront)
const textureLoader = new THREE.TextureLoader();
const textureCache = new Map(); // Store loaded textures for reuse

const texturePaths = [
    'src/assets/textures/lines.png',
    'src/assets/textures/snow-ground-water.jpg',
    'src/assets/textures/snow.jpg',
    'src/assets/textures/stone.png',
    'src/assets/textures/structure.png',
    'src/assets/textures/topographic-map.avif',
    'src/assets/textures/topographic.webp',
    'src/assets/textures/topography-map-white.avif'
];

// Function to load a texture only when needed
function getTexture(path) {
    if (!textureCache.has(path)) {
        textureCache.set(path, textureLoader.load(path));
    }
    return textureCache.get(path);
}

// Create scene
export function createScene() {
    // Create the scene
    const scene = new THREE.Scene();

    // Set up the camera
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(
        -aspect * 5, aspect * 5, 5, -5, 0.1, 1000
    );

    // Set the camera position
    camera.position.set(3, 3, 5);
    camera.lookAt(0, 0, 0);

    // Create the renderer and attach it to the document
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Array to store plane meshes
    let planesArray = [];
    let gridHelper = null; // Store grid reference

    // Store textures for each plane so they don't reset when GUI changes
    let planeTextures = [];

    function updatePlanes() {
        // Remove existing planes from the scene
        planesArray.forEach(plane => scene.remove(plane));
        planesArray = [];

        // Adjust stored textures array to match the number of planes
        while (planeTextures.length < planeData.planes) {
            // Add new textures only for newly created planes
            const randomTexturePath = texturePaths[Math.floor(Math.random() * texturePaths.length)];
            planeTextures.push(getTexture(randomTexturePath));
        }
        while (planeTextures.length > planeData.planes) {
            // Remove excess textures when reducing plane count
            planeTextures.pop();
        }

        // Calculate starting position to keep planes centered
        const totalHeight = (planeData.planes - 1) * planeData.spacing;
        const startY = -totalHeight / 2;

        // Create new planes based on planeData.planes and spacing
        for (let i = 0; i < planeData.planes; i++) {
            const newGeometry = new THREE.BoxGeometry(
                planeData.dimensions.width,
                planeData.dimensions.height,
                planeData.dimensions.length
            );

            let material;
            if (planeData.useTexture) {
                material = new THREE.MeshBasicMaterial({ map: planeTextures[i] });
            } else {
                let gradient = 0.1 + (i / (planeData.planes - 1)) * 0.9;
                const color = new THREE.Color(gradient, gradient, gradient);
                material = new THREE.MeshBasicMaterial({ color: color });
            }

            const newPlane = new THREE.Mesh(newGeometry, material);
            newPlane.position.y = startY + i * planeData.spacing; // Dynamic spacing
            scene.add(newPlane);
            planesArray.push(newPlane);
        }
    }


    // Function to update grid visibility
    function updateGrid() {
        if (gridHelper) {
            scene.remove(gridHelper); // Remove existing grid
            gridHelper = null;
        }

        if (options.showGrid) {
            gridHelper = new THREE.GridHelper(10, 10, 0x0000ff, 0x808080);
            gridHelper.position.y = 0.1;
            scene.add(gridHelper);
        }
    }

    // GUI Controls
    gui.add(planeData, 'planes', 1, 100, 1).onChange(updatePlanes);
    gui.add(planeData, 'spacing', 0.1, 2, 0.01).onChange(updatePlanes);
    gui.add(planeData.dimensions, 'width', 0.1, 2, 0.1).onChange(updatePlanes);
    gui.add(planeData.dimensions, 'height', 0.1, 2, 0.1).onChange(updatePlanes);
    gui.add(planeData.dimensions, 'length', 0.1, 2, 0.1).onChange(updatePlanes);
    gui.add(planeData, 'useTexture').name('Use Texture').onChange(updatePlanes); // Add this line

    gui.add(options, 'showGrid').name('Show Grid').onChange(updateGrid);

    // Initial setup
    updatePlanes();
    updateGrid();

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
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