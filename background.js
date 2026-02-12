import * as THREE from 'three';

export function loadBackground(scene) {

    // Create loader to load image files as textures
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        'concert.jpg', 
        (texture) => {
            const backgroundGeometry = new THREE.SphereGeometry(500, 128, 128);
            const backgroundMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide
            });
            const backgroundSphere = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
            scene.add(backgroundSphere);
            
            const overlayGeometry = new THREE.SphereGeometry(500, 128, 128);
            const overlayMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.2,
                side: THREE.BackSide
            });
            const darkOverlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
            scene.add(darkOverlay);
        },
        undefined,
        (error) => {
            console.error('Error loading background image:', error);
        }
    );
}
