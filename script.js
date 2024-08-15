let alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let index = 0;
let synth = window.speechSynthesis;

document.getElementById('alphabet').innerText = alphabets[index];
speak(alphabets[index]);

document.getElementById('next').addEventListener('click', function() {
    index = (index + 1) % alphabets.length;
    document.getElementById('alphabet').innerText = alphabets[index];
    speak(alphabets[index]);
});

document.getElementById('prev').addEventListener('click', function() {
    index = (index - 1 + alphabets.length) % alphabets.length;
    document.getElementById('alphabet').innerText = alphabets[index];
    speak(alphabets[index]);
});

function speak(text) {
    let utterThis = new SpeechSynthesisUtterance(text);
    synth.speak(utterThis);
}
