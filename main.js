import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

let audioContext;
let analyser;
let audioSource;
let frequencyData;
const bufferLength = 256;

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = bufferLength * 2;
    analyser.smoothingTimeConstant = 0.8;
    
    frequencyData = new Uint8Array(analyser.frequencyBinCount);
}

async function loadAudio(file) {
    if (!audioContext) {
        initAudio();
    }
    
    if (audioSource) {
        audioSource.stop();
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    
    audioSource.start(0);
}

function getFrequencyData() {
    if (analyser) {
        analyser.getByteFrequencyData(frequencyData);
    }
    return frequencyData;
}

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'audio/*';
fileInput.style.position = 'fixed';
fileInput.style.top = '10px';
fileInput.style.left = '10px';
fileInput.style.zIndex = '1000';
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        loadAudio(file);
    }
});
document.body.appendChild(fileInput);

// Create frequency bars
const bars = [];
const barCount = 64; // Number of bars to display
const radius = 5; // Radius of the circle
const barWidth = 0.1;
const barDepth = 0.1;

// Create bars arranged in a circle
for (let i = 0; i < barCount; i++) {
    const angle = (i / barCount) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    const geometry = new THREE.BoxGeometry(barWidth, 1, barDepth);
    const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / barCount, 1, 0.5)
    });
    
    const bar = new THREE.Mesh(geometry, material);
    bar.position.set(x, 0, z);
    bar.lookAt(0, 0, 0); // Make bars face the center
    bar.rotation.y += Math.PI / 2; // Rotate to stand upright
    
    scene.add(bar);
    bars.push(bar);
}

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

camera.position.set(0, 8, 12);
camera.lookAt(0, 0, 0);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    const frequencies = getFrequencyData();
    
    if (frequencies && frequencies.length > 0 && bars.length > 0) {
        // Map frequency data to bars
        const dataStep = Math.floor(frequencies.length / barCount);
        
        bars.forEach((bar, i) => {
            const frequencyIndex = Math.min(i * dataStep, frequencies.length - 1);
            const value = frequencies[frequencyIndex] / 255; // Normalize to 0-1
            
            // Scale bar height based on frequency (min height 0.1, max height 8)
            const height = 0.1 + value * 8;
            bar.scale.y = height;
            
            // Update bar position to keep bottom aligned
            const angle = (i / barCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            bar.position.y = height / 2;
            bar.position.x = x;
            bar.position.z = z;
            
            // Update color intensity based on frequency
            const hue = i / barCount;
            const saturation = 1;
            const lightness = 0.3 + value * 0.5;
            bar.material.color.setHSL(hue, saturation, lightness);
        });
    }
    
    controls.update();
    
    renderer.render(scene, camera);
}

renderer.setAnimationLoop( animate);