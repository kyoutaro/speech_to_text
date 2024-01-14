// speechRecognition.js
const speech = new webkitSpeechRecognition();
const synth = window.speechSynthesis;
speech.lang = 'ja-JP';
speech.continuous = true;
speech.interimResults = true;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const content = document.getElementById('content');

// Teachable MachineのモデルURL
const modelURL = 'https://teachablemachine.withgoogle.com/models/v41i_P2fV/';

// モデルと音声ストリームを扱うための変数
let model, microphoneStream;

// モデルをロードする関数
async function loadModel() {
    // ここにモデルロードのコードを記述（音声モデル用のロード方法を使用）
    model = await tmAudio.load(modelURL);
    startListening();
}

// 音声ストリームを開始し、モデルにフィードする関数
// startListening関数を更新
async function startListening() {
    microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    model.listen(result => { handlePredictions(result); }, { probabilityThreshold: 0.75 });
}


// モデルが特定の音（例：警報）を検出した場合の処理
function onAlarmDetected() {
    content.innerHTML = '<p>警報が鳴っています。</p>' + content.innerHTML;
}

// モデルの予測結果を処理する関数
function handlePredictions(predictions) {
    predictions.forEach(prediction => {
        if (prediction.className === 'Alarm' && prediction.probability > 0.8) {
            onAlarmDetected();
        }
    });
}


// モデルのロードを開始
loadModel();

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

speech.onresult = function(event) {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
        }
    }
    if (transcript) {
        // 最新のテキストをdivの最初に追加
        content.innerHTML = '<p>' + transcript + '</p>' + content.innerHTML;
    }
    if (transcript) {
        content.innerHTML = '<p>' + transcript + '</p>' + content.innerHTML;
        checkSound(transcript); // 音声を確認する関数を呼び出し
    }
};

speech.onend = function() {
    if (!stopBtn.disabled) {
        speech.start();
    }
};

// 音声合成のためのコード
const textToSpeechInput = document.getElementById('textToSpeech');
const speakButton = document.getElementById('speak');

speakButton.addEventListener('click', () => {
    var text = textToSpeechInput.value;
    var utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
});