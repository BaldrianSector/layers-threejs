export function handleResize(camera, renderer) {
    window.addEventListener('resize', () => {
        const aspect = window.innerWidth / window.innerHeight;
        camera.left = -aspect * 5;
        camera.right = aspect * 5;
        camera.top = 5;
        camera.bottom = -5;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}