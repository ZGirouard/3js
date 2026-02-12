let audioContext;
let analyser;
let audioSource;
let frequencyData;
const bufferLength = 256;

// Create audio context and analyser
function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = bufferLength * 2;
    analyser.smoothingTimeConstant = 0.8;
    
    frequencyData = new Uint8Array(analyser.frequencyBinCount);
}

// Load an audio file, decode it, connect to analyser, and start playback
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

// Read the frequency data from the analyser into the array
function getFrequencyData() {
    if (analyser) {
        analyser.getByteFrequencyData(frequencyData);
    }
    return frequencyData;
}

// Create a file input so the user can upload an audio file
function createFileInput() {
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
}

export { getFrequencyData, createFileInput };
