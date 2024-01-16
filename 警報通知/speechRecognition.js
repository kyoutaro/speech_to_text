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

async function createModel() {
    const checkpointURL = URL + "model.json"; // model topology
    const metadataURL = URL + "metadata.json"; // model metadata

    const recognizer = speechCommands.create(
        "BROWSER_FFT", // fourier transform type, not useful to change
        undefined, // speech commands vocabulary feature, not useful for your models
        checkpointURL,
        metadataURL);

    // check that model and metadata are loaded via HTTPS requests.
    await recognizer.ensureModelLoaded();

    return recognizer;
}

async function init() {
    const recognizer = await createModel();
    const classLabels = recognizer.wordLabels(); // get class labels
    const labelContainer = document.getElementById("label-container");
    for (let i = 0; i < classLabels.length; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    // listen() takes two arguments:
    // 1. A callback function that is invoked anytime a word is recognized.
    // 2. A configuration object with adjustable fields
    recognizer.listen(result => {
        const scores = result.scores; // probability of prediction for each class
        // render the probability scores per class
        for (let i = 0; i < classLabels.length; i++) {
            const classPrediction = classLabels[i] + ": " + result.scores[i].toFixed(2);
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }
    }, {
        includeSpectrogram: true, // in case listen should return result.spectrogram
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.50 // probably want between 0.5 and 0.75. More info in README
    });

    // Stop the recognition in 5 seconds.
    // setTimeout(() => recognizer.stopListening(), 5000);
}



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
