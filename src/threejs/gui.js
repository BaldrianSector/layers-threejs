import GUI from 'lil-gui';
import data from './data.js';

// Deconstruct data object
const { planeData, textureData, options, colors} = data;

export function setupGUI(scene, groupData) {
    const gui = new GUI();
    
    const groupFolder = gui.addFolder('Group Settings');
    
    Object.keys(groupData).forEach(prop => {
        groupFolder.add(groupData, prop, -5, 5, 0.01).listen();
    });

    groupFolder.open();

    gui.addColor(colors, 'backgroundColor')
        .name('Background Color')
        .onChange(() => scene.background.set(colors.backgroundColor));
}
