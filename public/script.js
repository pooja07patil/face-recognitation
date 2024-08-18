const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const overlayCtx = overlay.getContext('2d');

// Load models and start video
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => console.error(err));
}

video.addEventListener('play', () => {
    // Set canvas dimensions to match video dimensions
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;

    // Function to detect faces and draw landmarks and expressions
    async function detectFaces() {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

        // Clear the overlay canvas
        overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

        // Draw the detections, landmarks, and expressions
        faceapi.draw.drawDetections(overlay, detections);
        faceapi.draw.drawFaceLandmarks(overlay, detections);
        faceapi.draw.drawFaceExpressions(overlay, detections);

        // Call the function again to create a loop
        requestAnimationFrame(detectFaces);
    }

    // Start detecting faces
    detectFaces();
});