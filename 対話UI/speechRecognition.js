// speechRecognition.js
const speech = new webkitSpeechRecognition();
const synth = window.speechSynthesis;
speech.lang = 'ja-JP';
speech.continuous = true;
speech.interimResults = true;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const content = document.getElementById('content');

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