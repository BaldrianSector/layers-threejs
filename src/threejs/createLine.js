import * as THREE from 'three';

// For now this is just a fixed line between two points, but it should scale with the text and target object
export function createLine(group, dashSize = 0.1, gapSize = 0.1, position1 = { x: 0, y: 0, z: 0 }, position2 = { x: 0, y: 0, z: 0 }, customData) {
    const dashedMaterial = new THREE.LineDashedMaterial( { color: 0xffffff, dashSize: 0.1, gapSize: 0.1 } )
    const points = [];
    points.push(new THREE.Vector3(position1.x, position1.y, position1.z));
    points.push(new THREE.Vector3(position2.x, position2.y, position2.z));
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(lineGeometry, dashedMaterial);
    line.computeLineDistances();

    line.userData = customData;
    
    group.add(line);
}