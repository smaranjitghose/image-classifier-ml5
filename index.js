// Global variables
let classifier;
let isModelLoaded = false;

// DOM Elements
const modelStatus = document.getElementById('model-status');
const imageInput = document.getElementById('image-input');
const previewSection = document.querySelector('.preview-section');
const previewImage = document.getElementById('preview-image');
const loadingSpinner = document.getElementById('loading-spinner');
const predictions = document.getElementById('predictions');
const resetButton = document.getElementById('reset-button');

// Initialize MobileNet classifier
async function initializeModel() {
    try {
        classifier = await ml5.imageClassifier('MobileNet', () => {
            isModelLoaded = true;
            modelStatus.textContent = 'MobileNet model loaded successfully!';
            modelStatus.style.backgroundColor = '#d4edda';
            modelStatus.style.color = '#155724';
        });
    } catch (error) {
        modelStatus.textContent = 'Error loading model. Please refresh the page.';
        modelStatus.style.backgroundColor = '#f8d7da';
        modelStatus.style.color = '#721c24';
        console.error('Error loading model:', error);
    }
}

// Handle file selection
imageInput.addEventListener('change', handleImageUpload);

// Handle drag and drop
const uploadButton = document.querySelector('.upload-button');
uploadButton.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadButton.style.backgroundColor = '#e3e3e3';
});

uploadButton.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadButton.style.backgroundColor = '#f8f9fa';
});

uploadButton.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadButton.style.backgroundColor = '#f8f9fa';
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageUpload({ target: { files: e.dataTransfer.files } });
    }
});

// Handle image upload
async function handleImageUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
        alert('Please upload an image file');
        return;
    }

    // Show preview section
    previewSection.classList.remove('hidden');
    loadingSpinner.classList.remove('hidden');
    predictions.innerHTML = '';

    // Create and display image preview
    const reader = new FileReader();
    reader.onload = async function(e) {
        previewImage.src = e.target.result;
        previewImage.onload = async function() {
            if (isModelLoaded) {
                await classifyImage();
            } else {
                alert('Please wait for the model to load');
            }
        };
    };
    reader.readAsDataURL(file);
}

// Classify the image
async function classifyImage() {
    try {
        const results = await classifier.classify(previewImage);
        displayResults(results);
    } catch (error) {
        console.error('Error classifying image:', error);
        predictions.innerHTML = '<p class="error">Error classifying image. Please try again.</p>';
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

// Display classification results
function displayResults(results) {
    predictions.innerHTML = '';
    
    results.forEach((result, index) => {
        const confidence = (result.confidence * 100).toFixed(2);
        const predictionEl = document.createElement('div');
        predictionEl.className = 'prediction-item';
        predictionEl.innerHTML = `
            <div class="label">${result.label}</div>
            <div class="confidence">
                <div class="confidence-bar" style="width: ${confidence}%"></div>
                <span>${confidence}%</span>
            </div>
        `;
        predictions.appendChild(predictionEl);
    });
}

// Reset the form
resetButton.addEventListener('click', () => {
    imageInput.value = '';
    previewSection.classList.add('hidden');
    predictions.innerHTML = '';
});

// Initialize the model when the page loads
initializeModel();