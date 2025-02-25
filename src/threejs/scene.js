import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import initialState from './initialState.json';
import textureArray from './textureArray.json';

// Create a GUI
const gui = new GUI();

// Import initial data

const planeData = initialState.planeData;
const options = initialState.options;

// Texture paths
const textureLoader = new THREE.TextureLoader();
const textureCache = new Map();
const texturePaths = textureArray;

function getTexture(path) {
    if (!textureCache.has(path)) {
        textureCache.set(path, textureLoader.load(path));
    }
    return textureCache.get(path);
}

// Create scene
export function createScene() {
    const scene = new THREE.Scene();
    const aspect = window.innerWidth / window.innerHeight;
    
    // Create camera
    const camera = new THREE.OrthographicCamera(
        -aspect * 5, aspect * 5, 5, -5, 0.1, 1000
    );
    camera.position.set(3, 3, 5);
    camera.lookAt(0, 0, 0);

    scene.background = new THREE.Color(options.backgroundColor); // Light blue

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 3);
    scene.add(ambientLight);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let planesArray = [];
    let gridHelper = null;
    let planeTextures = [];

    // Create text element for hover info
    const hoverText = document.createElement('div');
    hoverText.style.position = 'absolute';
    hoverText.style.color = 'white';
    hoverText.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    hoverText.style.padding = '5px';
    hoverText.style.display = 'none';
    document.body.appendChild(hoverText);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function updatePlanes() {
        planesArray.forEach(plane => scene.remove(plane));
        planesArray = [];

        while (planeTextures.length < planeData.planes) {
            const randomTexturePath = texturePaths[Math.floor(Math.random() * texturePaths.length)];
            planeTextures.push({ texture: getTexture(randomTexturePath), path: randomTexturePath });
        }
        while (planeTextures.length > planeData.planes) {
            planeTextures.pop();
        }

        const totalHeight = (planeData.planes - 1) * planeData.spacing;
        const startY = -totalHeight / 2;

        for (let i = 0; i < planeData.planes; i++) {
            const newGeometry = new THREE.BoxGeometry(
                planeData.dimensions.width,
                planeData.dimensions.height,
                planeData.dimensions.length,
                planeData.segments.width,
                planeData.segments.height,
                planeData.segments.length                
            );

            let material;
            if (planeData.useTexture) {
                let materialOptions = {
                    map: planeTextures[i].texture,
                    side: THREE.DoubleSide,
                    transparent: true
                };
            
                if (planeData.useDisplacement) {
                    materialOptions.displacementMap = planeTextures[i].texture;
                    materialOptions.displacementScale = planeData.depthScale;
                }
            
                material = new THREE.MeshPhongMaterial(materialOptions);            
            } else {
                let gradient = 0.1 + (i / (planeData.planes - 1)) * 0.9;
                const color = new THREE.Color(gradient, gradient, gradient);
                material = new THREE.MeshBasicMaterial({ color: color, transparent: true });
            }

            const newPlane = new THREE.Mesh(newGeometry, material);
            newPlane.position.y = startY + i * planeData.spacing;
            newPlane.userData.texturePath = planeTextures[i]?.path || 'Color';
            scene.add(newPlane);
            planesArray.push(newPlane);
        }
    }

    function updateGrid() {
        if (gridHelper) {
            scene.remove(gridHelper);
            gridHelper = null;
        }
        if (options.showGrid) {
            gridHelper = new THREE.GridHelper(10, 10, 0x0000ff, 0x808080);
            gridHelper.position.y = 0.1;
            scene.add(gridHelper);
        }
    }

    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(planesArray);

        if (intersects.length > 0) {
            const hoveredPlane = intersects[0].object;
            hoverText.innerText = hoveredPlane.userData.texturePath;
            hoverText.style.left = `${event.clientX + 10}px`;
            hoverText.style.top = `${event.clientY + 10}px`;
            hoverText.style.display = 'block';

            planesArray.forEach(plane => {
                if (plane !== hoveredPlane) {
                    plane.material.opacity = 0.3;
                } else {
                    plane.material.opacity = 1;
                }
            });
        } else {
            hoverText.style.display = 'none';
            planesArray.forEach(plane => (plane.material.opacity = 1));
        }
    }


    // GUI
    gui.add(planeData, 'planes', 1, 100, 1).onChange(updatePlanes);
    gui.add(planeData, 'spacing', 0.1, 2, 0.01).onChange(updatePlanes);
    
    const dimensionsFolder = gui.addFolder('Dimensions');

    dimensionsFolder.add(planeData.dimensions, 'width', 0.1, 2, 0.1).onChange(updatePlanes);
    dimensionsFolder.add(planeData.dimensions, 'height', 0.1, 2, 0.1).onChange(updatePlanes);
    dimensionsFolder.add(planeData.dimensions, 'length', 0.1, 2, 0.1).onChange(updatePlanes);

    const segmentsFolder = gui.addFolder('Segments');

    segmentsFolder.add(planeData.segments, 'width', 1, 100, 1).onChange(updatePlanes);
    segmentsFolder.add(planeData.segments, 'height', 1, 100, 1).onChange(updatePlanes);
    segmentsFolder.add(planeData.segments, 'length', 1, 100, 1).onChange(updatePlanes);
    
    gui.add(planeData, 'useTexture').name('Use Texture').onChange(updatePlanes);
    gui.add(planeData, 'useDisplacement').name('Use Displacement').onChange(updatePlanes);
    // depthscale
    gui.add(planeData, 'depthScale', 0.1, 1, 0.1).onChange(updatePlanes);
    
    gui.add(options, 'showGrid').name('Show Grid').onChange(updateGrid);
    
    // gui for background color
    gui.addColor(options, 'backgroundColor').name('Background Color').onChange((color) => {
        scene.background
            .set(color);
    }
    );

    updatePlanes();
    updateGrid();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        const aspect = window.innerWidth / window.innerHeight;
        camera.left = -aspect * 5;
        camera.right = aspect * 5;
        camera.top = 5;
        camera.bottom = -5;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

    });

    window.addEventListener('mousemove', onMouseMove);
}
