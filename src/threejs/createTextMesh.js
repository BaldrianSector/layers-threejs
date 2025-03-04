import * as THREE from 'three';
import { TTFLoader, FontLoader, TextGeometry } from 'three/examples/jsm/Addons.js';
import { materialOpacity, rotate } from 'three/tsl';

export function createHeaderTextMesh(userGroup, textInput, size = 1, height = 0.1, depth = 0.01, position = { x: 0, y: 0, z: 0 }, customData, lookAt) {
const ttfLoader = new TTFLoader();
    const fontLoader = new FontLoader();

    ttfLoader.load("src/assets/fonts/Covered_By_Your_Grace/CoveredByYourGrace-Regular.ttf", (json) => {
        const font = fontLoader.parse(json);
        const textGeometry = new TextGeometry(textInput, {
            size: size,
            height: height,
            depth: depth,
            font: font,
        });

        const textMaterial = new THREE.MeshPhongMaterial();
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        textGeometry.computeBoundingBox();
        textGeometry.center();

        textMesh.rotateY(Math.PI / 2);

        textMesh.position.set(position.x, position.y, position.z);

        textMesh.userData = customData;

        if (lookAt) {
            textMesh.lookAt(lookAt.x, lookAt.y, lookAt.z);
        }
        textMaterial.transparent = true;
        
        userGroup.add(textMesh);
    });
}

export function createTextMesh(group, textInput, size = 0.5, height = 0.1, depth = 0.01, weight = 400, italic = false, transparency = false, center = false, position = { x: 0, y: 0, z: 0 }, customData, lookAt) {
    const ttfLoader = new TTFLoader();
    const fontLoader = new FontLoader();

    function getSofiaSansFontPath(weight, italic) {
        // Map numeric weight to the corresponding file name suffix
        let suffix = '';
        switch (weight) {
            case 100:
                suffix = 'Thin';
                break;
            case 200:
                suffix = 'ExtraLight';
                break;
            case 300:
                suffix = 'Light';
                break;
            case 400:
                suffix = 'Regular';
                break;
            case 500:
                suffix = 'Medium';
                break;
            case 600:
                suffix = 'SemiBold';
                break;
            case 700:
                suffix = 'Bold';
                break;
            case 800:
                suffix = 'ExtraBold';
                break;
            case 900:
                suffix = 'Black';
                break;
            default:
                suffix = 'Regular';
        }

        // If italic is true, add 'Italic' to the file name
        if (italic && suffix !== 'Regular') {
            suffix += 'Italic';
        } else if (italic && suffix === 'Regular') {
            suffix = 'Italic';
        }

        // Return the path to the TTF file
        return `src/assets/fonts/Sofia_Sans/static/SofiaSans-${suffix}.ttf`;
    }

    // Determine the correct font path based on weight and italic
    const fontPath = getSofiaSansFontPath(weight, italic);

    ttfLoader.load(fontPath, (json) => {
        const font = fontLoader.parse(json);

        const textGeometry = new TextGeometry(textInput, {
            font: font,
            size: size,
            height: height,
            depth: depth
        });

        const textMaterial = new THREE.MeshPhongMaterial();
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Rotate 90 degrees about Y-axis
        textMesh.rotateY(Math.PI / 2);

        // Set the position of the text mesh
        textMesh.position.set(position.x, position.y, position.z);
        
        // Set transparency
        textMaterial.transparent = true;
        if (transparency) {
            textMaterial.opacity = 0.0;
        }

        textMesh.userData = customData;

        if (lookAt) {
            textMesh.lookAt(lookAt.x, lookAt.y, lookAt.z);
        }

        if (center) {
            textGeometry.computeBoundingBox();
            textGeometry.center();
        }

        group.add(textMesh);
    });
}

