import GUI from 'lil-gui';
import data from './data.js';

// Deconstruct data object
const { planeData, textureData, options } = data;

export function setupGUI(scene, groupData) {
    const gui = new GUI();
    
    const groupFolder = gui.addFolder('Group Settings');
    
    Object.keys(groupData).forEach(prop => {
        groupFolder.add(groupData, prop, 0, 10, 0.01).listen();
    });

    groupFolder.open();

    gui.addColor(options, 'backgroundColor')
        .name('Background Color')
        .onChange(() => scene.background.set(options.backgroundColor));
}
