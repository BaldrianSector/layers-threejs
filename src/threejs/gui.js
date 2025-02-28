import GUI from 'lil-gui';
import data from './data.js';

// Deconstruct data object
const { planeData, textureData, options } = data;

export function setupGUI(scene, updatePlanes, updateGrid) {
    const gui = new GUI();

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
    
    // Depthscale
    gui.add(planeData, 'depthScale', 0.1, 1, 0.1).onChange(updatePlanes);
    
    gui.add(options, 'showGrid').name('Show Grid').onChange(updateGrid);
    
    // Background color
    gui.addColor(options, 'backgroundColor').name('Background Color').onChange((color) => {
        scene.background
            .set(color);
    });
}