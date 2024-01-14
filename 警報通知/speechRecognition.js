// speechRecognition.js
const speech = new webkitSpeechRecognition();
speech.lang = 'ja-JP';
speech.continuous = true;
speech.interimResults = true;
const synth = window.speechSynthesis;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const content = document.getElementById('content');

const modelURL = 'https://teachablemachine.withgoogle.com/models/v41i_P2fV/';

let chart;
let classLabels;
let model, microphoneStream;

async function loadModel() {
    model = await tmAudio.load(modelURL);
    startListening();
}

async function startListening() {
    microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    model.listen(result => { handlePredictions(result); }, { probabilityThreshold: 0.75 });
}

function onAlarmDetected() {
    content.innerHTML = '<p>警報が鳴っています。避難してください</p>' + content.innerHTML;
}

function handlePredictions(predictions) {
    predictions.forEach(prediction => {
        if (prediction.className === '火災警報1' && prediction.probability > 0.8) {
            onAlarmDetected();
        }
    });
    updateChart(predictions);
}

function updateChart(predictions) {
    const labels = predictions.map(p => p.className);
    const data = predictions.map(p => p.probability);
    chart.data.labels = labels;
    chart.data.datasets.forEach((dataset, index) => {
        dataset.data = [data[index]];
    });
    chart.update();
}


startBtn.addEventListener('click', function() {
    speech.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
});

stopBtn.addEventListener('click', function() {
    speech.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
});

function checkSound(transcript) {
    const keywords = ['警報', '緊急', '危険', '火事']; // キーワードの配列
    const foundKeyword = keywords.some(keyword => transcript.includes(keyword));

    if (foundKeyword) {
        // キーワードが含まれている場合、特定のアクションを実行
        content.innerHTML = '<p class="alert-message">警報が鳴っています。避難してください</p>' + content.innerHTML;
    }
}



speech.onresult = function(event) {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
        }
    }
    if (transcript) {
        content.innerHTML = '<p>' + transcript + '</p>' + content.innerHTML;
        checkSound(transcript);
    }
};

speech.onend = function() {
    if (!stopBtn.disabled) {
        speech.start();
    }
};

const textToSpeechInput = document.getElementById('textToSpeech');
const speakButton = document.getElementById('speak');

speakButton.addEventListener('click', () => {
    var text = textToSpeechInput.value;
    var utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
});

loadModel();

function createChart() {
const ctx = document.getElementById('chart').getContext('2d');
chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [], // 最初は空のラベルで初期化
        datasets: [{
            label: '確信度',
            data: [], // 最初は空のデータで初期化
            backgroundColor: 'rgba(0, 123, 255, 0.5)',
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
}

function updateChart(predictions) {
    chart.data.labels = predictions.map(p => p.className);
    chart.data.datasets.forEach((dataset, index) => {
    dataset.data = [predictions[index].probability];
    });
    chart.update();
    }
    
    // モデルのロードとチャートの初期化
    loadModel().then(createChart);