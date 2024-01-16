// speechRecognition.js
const speech = new webkitSpeechRecognition();
speech.lang = 'ja-JP';
speech.continuous = true;
speech.interimResults = true;
const synth = window.speechSynthesis;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const content = document.getElementById('content');


let chart;
let classLabels;
let model, microphoneStream;

const URL = "https://teachablemachine.withgoogle.com/models/v41i_P2fV/"; // Teachable MachineモデルのURL

async function createModel() {
    const checkpointURL = URL + "model.json"; // model topology
    const metadataURL = URL + "metadata.json"; // model metadata

    const recognizer = speechCommands.create(
        "BROWSER_FFT", // fourier transform type
        undefined, // vocabulary feature
        checkpointURL,
        metadataURL);

    await recognizer.ensureModelLoaded();
    return recognizer;
}

async function init() {
    const recognizer = await createModel();
    const classLabels = recognizer.wordLabels(); // クラスラベルを取得
    const labelContainer = document.getElementById("label-container");
    for (let i = 0; i < classLabels.length; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    recognizer.listen(result => {
        const scores = result.scores; // 各クラスの確率
        for (let i = 0; i < classLabels.length; i++) {
            const classPrediction = classLabels[i] + ": " + (scores[i] * 100).toFixed(2) + "%"; // 確率をパーセンテージで表示
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }
    }, {
        includeSpectrogram: true,
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.50
    });
}




async function loadModel() {
    model = await tmAudio.load(URL);
    startListening();
}

async function startListening() {
    microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    model.listen(result => { handlePredictions(result); }, { probabilityThreshold: 0.75 });
}

// Teachable Machineの警報1の確率が0.8を超えた場合にアラートを表示
function handlePredictions(predictions) {
    predictions.forEach(prediction => {
        if (prediction.className === '火災警報1' && prediction.probability > 0.8) {
            onAlarmDetected();
        }
    });
    updateChart(predictions);
}

function onAlarmDetected() {
    content.innerHTML = '<p>警報が鳴っています。</p>' + content.innerHTML;
}

// 他の関数やイベントハンドラーは変更せずにそのまま使用



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
