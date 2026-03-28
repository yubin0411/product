const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/fkOPXRoWR/';

let model = null;
let webcamStream = null;
let isWebcamMode = false;

const fileInput = document.getElementById('file-input');
const webcamBtn = document.getElementById('webcam-btn');
const captureBtn = document.getElementById('capture-btn');
const analyzeBtn = document.getElementById('analyze-btn');
const retryBtn = document.getElementById('retry-btn');
const previewImage = document.getElementById('preview-image');
const webcamVideo = document.getElementById('webcam-video');
const captureCanvas = document.getElementById('capture-canvas');
const placeholder = document.getElementById('placeholder');
const previewContainer = document.getElementById('preview-container');
const loadingEl = document.getElementById('loading');
const resultEl = document.getElementById('result');

const descriptions = {
    DOG: '당신은 따뜻하고 친근한 강아지상이에요! 사람들에게 편안한 느낌을 주고, 밝은 에너지로 주변을 환하게 만드는 타입입니다. 누구와도 쉽게 친해지는 사교적인 매력이 돋보이며, 솔직하고 순수한 모습이 사람들의 마음을 사로잡습니다.',
    CAT: '당신은 시크하고 매력적인 고양이상이에요! 독립적이면서도 은근한 매력으로 사람들을 끌어당기는 타입입니다. 차분하고 세련된 분위기가 인상적이며, 쉽게 다가갈 수 없는 신비로운 매력이 오히려 더 큰 호기심을 자아냅니다.'
};

async function loadModel() {
    const modelURL = MODEL_URL + 'model.json';
    const metadataURL = MODEL_URL + 'metadata.json';
    model = await tmImage.load(modelURL, metadataURL);
}

fileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    stopWebcam();

    const reader = new FileReader();
    reader.onload = function (event) {
        previewImage.src = event.target.result;
        previewImage.style.display = 'block';
        webcamVideo.style.display = 'none';
        placeholder.style.display = 'none';
        previewContainer.classList.add('has-image');
        analyzeBtn.style.display = 'block';
        captureBtn.style.display = 'none';
        resultEl.style.display = 'none';
        isWebcamMode = false;
    };
    reader.readAsDataURL(file);
});

webcamBtn.addEventListener('click', async function () {
    if (webcamStream) {
        stopWebcam();
        return;
    }

    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 300, height: 300 }
        });
        webcamVideo.srcObject = webcamStream;
        webcamVideo.style.display = 'block';
        previewImage.style.display = 'none';
        placeholder.style.display = 'none';
        previewContainer.classList.add('has-image');
        captureBtn.style.display = 'block';
        analyzeBtn.style.display = 'none';
        resultEl.style.display = 'none';
        webcamBtn.textContent = '카메라 끄기';
        isWebcamMode = true;
    } catch (err) {
        alert('카메라에 접근할 수 없습니다. 카메라 권한을 허용해주세요.');
    }
});

captureBtn.addEventListener('click', function () {
    captureCanvas.width = webcamVideo.videoWidth;
    captureCanvas.height = webcamVideo.videoHeight;
    captureCanvas.getContext('2d').drawImage(webcamVideo, 0, 0);

    const dataURL = captureCanvas.toDataURL('image/png');
    previewImage.src = dataURL;
    previewImage.style.display = 'block';
    webcamVideo.style.display = 'none';
    stopWebcam();

    captureBtn.style.display = 'none';
    analyzeBtn.style.display = 'block';
    isWebcamMode = false;
});

analyzeBtn.addEventListener('click', async function () {
    analyzeBtn.style.display = 'none';
    loadingEl.style.display = 'block';
    resultEl.style.display = 'none';

    try {
        if (!model) {
            await loadModel();
        }

        const prediction = await model.predict(previewImage);

        let dogScore = 0;
        let catScore = 0;
        for (const p of prediction) {
            if (p.className === 'DOG') dogScore = p.probability;
            if (p.className === 'CAT') catScore = p.probability;
        }

        showResult(dogScore, catScore);
    } catch (err) {
        alert('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
        analyzeBtn.style.display = 'block';
    }

    loadingEl.style.display = 'none';
});

retryBtn.addEventListener('click', function () {
    previewImage.style.display = 'none';
    previewImage.src = '';
    webcamVideo.style.display = 'none';
    placeholder.style.display = 'flex';
    previewContainer.classList.remove('has-image');
    analyzeBtn.style.display = 'none';
    captureBtn.style.display = 'none';
    resultEl.style.display = 'none';
    fileInput.value = '';
    webcamBtn.textContent = '카메라 촬영';
});

function showResult(dogScore, catScore) {
    const dogPct = Math.round(dogScore * 100);
    const catPct = Math.round(catScore * 100);

    const isDog = dogScore >= catScore;
    const emoji = isDog ? '🐶' : '🐱';
    const title = isDog
        ? '당신은 강아지상!'
        : '당신은 고양이상!';
    const desc = isDog ? descriptions.DOG : descriptions.CAT;

    document.getElementById('result-emoji').textContent = emoji;
    document.getElementById('result-title').textContent = title;
    document.getElementById('dog-percent').textContent = dogPct + '%';
    document.getElementById('cat-percent').textContent = catPct + '%';
    document.getElementById('result-description').textContent = desc;

    resultEl.style.display = 'block';

    setTimeout(function () {
        document.getElementById('dog-bar').style.width = dogPct + '%';
        document.getElementById('cat-bar').style.width = catPct + '%';
    }, 100);

    resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function stopWebcam() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(function (track) { track.stop(); });
        webcamStream = null;
    }
    webcamBtn.textContent = '카메라 촬영';
}
