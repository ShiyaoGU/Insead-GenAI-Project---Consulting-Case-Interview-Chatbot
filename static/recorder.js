// Initialize variables to manage the recording state
let mediaRecorder;
let audioChunks = [];

// Get the DOM elements
const recordButton = document.getElementById('recordButton');
const stopButton = document.getElementById('stopButton');
const uploadButton = document.getElementById('uploadButton');

// Function to start recording
function startRecording() {
    audioChunks = [];
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = function(event) {
            audioChunks.push(event.data);
        };
        mediaRecorder.start();

        // Update button states
        recordButton.disabled = true;
        stopButton.disabled = false;
        uploadButton.disabled = true;
    })
    .catch(e => console.error('Error obtaining audio stream:', e));
}

// Function to stop recording
function stopRecording() {
    mediaRecorder.stop();
    mediaRecorder.onstop = function() {
        // Update button states
        stopButton.disabled = true;
        uploadButton.disabled = false;
    };
}

// Function to upload the audio file
function uploadAudio() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
    sendAudio(audioBlob);  // Use the sendAudio function from chatbot.js

    // Reset buttons
    recordButton.disabled = false;
    uploadButton.disabled = true;
}

// Event listeners for the buttons
recordButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);
uploadButton.addEventListener('click', uploadAudio);
