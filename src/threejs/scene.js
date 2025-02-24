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
    useTexture: true
};

const options = {
    showGrid: true
};

// Texture paths
const textureLoader = new THREE.TextureLoader();
const textureCache = new Map();
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
    const camera = new THREE.OrthographicCamera(
        -aspect * 5, aspect * 5, 5, -5, 0.1, 1000
    );
    camera.position.set(3, 3, 5);
    camera.lookAt(0, 0, 0);

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
                planeData.dimensions.length
            );

            let material;
            if (planeData.useTexture) {
                material = new THREE.MeshBasicMaterial({
                    map: planeTextures[i].texture,
                    side: THREE.DoubleSide,
                    transparent: true
                });
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
                    plane.material.opacity = 0.5;
                } else {
                    plane.material.opacity = 1;
                }
            });
        } else {
            hoverText.style.display = 'none';
            planesArray.forEach(plane => (plane.material.opacity = 1));
        }
    }

    gui.add(planeData, 'planes', 1, 100, 1).onChange(updatePlanes);
    gui.add(planeData, 'spacing', 0.1, 2, 0.01).onChange(updatePlanes);
    gui.add(planeData.dimensions, 'width', 0.1, 2, 0.1).onChange(updatePlanes);
    gui.add(planeData.dimensions, 'height', 0.1, 2, 0.1).onChange(updatePlanes);
    gui.add(planeData.dimensions, 'length', 0.1, 2, 0.1).onChange(updatePlanes);
    gui.add(planeData, 'useTexture').name('Use Texture').onChange(updatePlanes);
    gui.add(options, 'showGrid').name('Show Grid').onChange(updateGrid);

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
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('mousemove', onMouseMove);
}
