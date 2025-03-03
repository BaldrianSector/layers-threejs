import GUI from 'lil-gui';
import data from './data.js';

// Deconstruct data object
const { planeData, textureData, options, cameraData, colors } = data;

export function setupGUI(scene, groupData, camera, renderer, customFunction) {
    const gui = new GUI();
    
    // Group settings
    const groupFolder = gui.addFolder('Group Settings');
    Object.keys(groupData).forEach(prop => {
        groupFolder.add(groupData, prop, -5, 5, 0.01).listen();
    });
    groupFolder.open();

    // Camera settings
    const cameraFolder = gui.addFolder('Camera Settings');
    cameraFolder.add(camera.position, 'x', -100, 100, 0.01).name('Camera X').listen();
    cameraFolder.add(camera.position, 'y', -100, 100, 0.01).name('Camera Y').listen();
    cameraFolder.add(camera.position, 'z', -100, 100, 0.01).name('Camera Z').listen();
    
    // Camera zoom
    cameraFolder.add(camera, 'zoom', 0.1, 10, 0.01).name('Camera Zoom').listen();
    cameraFolder.add(camera, 'near', 0.1, 100, 0.01).name('Camera Near').listen();
    cameraFolder.add(camera, 'far', 0.1, 1000, 0.01).name('Camera Far').listen();

    cameraFolder.open();

    // Button to run custom function
    gui.add({ run: customFunction }, 'run').name('Run Custom Function');

    // Background color
    gui.addColor(colors, 'backgroundColor')
        .name('Background Color')
        .onChange(() => scene.background.set(colors.backgroundColor));
}
