if ("serial" in navigator) {
    class BrailleTeacher {
        constructor() {
            this.port = null;
            this.reader = null;
            this.mode = "learning";
            this.currentLetterIndex = 0;
            this.correctInputs = 0;
            this.totalInputs = 0;
            this.progressChart = null;

            // Constants
            this.alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
            this.words = ["aa", "cat", "moon", "star", "tree", "bee", "sun", "ice"];
            this.currentWordIndex = 0;
            this.currentWordLetterIndex = 0;

            // Braille patterns mapping
            this.alphabetFolds = {
                "a": "1",
                "b": "1 and 2",
                "c": "1 and 4",
                "d": "1, 4, and 5",
                "e": "1 and 5",
                "f": "1, 2 and 4",
                "g": "1, 2, 4, and 5",
                "h": "1, 2, and 5",
                "i": "2 and 4",
                "j": "2, 4, and 5",
                "k": "1 and 3",
                "l": "1, 2, and 3",
                "m": "1, 3, and 4",
                "n": "1, 3, 4, and 5",
                "o": "1, 3, and 5",
                "p": "1, 2, 3, and 4",
                "q": "1, 2, 3, 4, and 5",
                "r": "1, 2, 3, and 5",
                "s": "2, 3, and 4",
                "t": "2, 3, 4, and 5",
                "u": "1, 3, and 6",
                "v": "1, 2, 3, and 6",
                "w": "2, 4, 5, and 6",
                "x": "1, 3, 4, and 6",
                "y": "1, 3, 4, 5, and 6",
                "z": "1, 3, 5, and 6"
            };

            this.initializeEventListeners();
            this.initProgressChart();
        }

        // ... (previous methods remain the same until announceCurrentWord)

        async announceCurrentWord() {
            const currentWord = this.words[this.currentWordIndex];
            const letters = currentWord.toUpperCase().split('');
            
            // Create a promise to handle the word pronunciation
            const speakWord = () => {
                return new Promise((resolve) => {
                    const utterance = new SpeechSynthesisUtterance(`The word is ${currentWord.toUpperCase()}`);
                    utterance.rate = 0.9;
                    utterance.onend = resolve;
                    window.speechSynthesis.speak(utterance);
                });
            };

            // Create a promise to handle individual letter pronunciation
            const speakLetter = (letter) => {
                return new Promise((resolve) => {
                    const utterance = new SpeechSynthesisUtterance(letter);
                    utterance.rate = 0.9;
                    utterance.onend = resolve;
                    window.speechSynthesis.speak(utterance);
                });
            };

            // Sequence the speech
            try {
                // First speak the word
                await speakWord();
                
                // Wait a bit before starting to spell
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Speak each letter
                for (const letter of letters) {
                    await speakLetter(letter);
                    await new Promise(resolve => setTimeout(resolve, 500)); // Small pause between letters
                }
                
                // Wait before speaking the folding instructions
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Speak the folding instructions for the first letter
                const firstLetter = currentWord[0].toUpperCase();
                this.speak(`Fold ${this.alphabetFolds[currentWord[0]]} for ${firstLetter}`);
                
            } catch (error) {
                console.error("Error in speech sequence:", error);
            }
        }

        speak(text) {
            if (!text) return;
            
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }

        handlePracticeMode(data) {
            const currentWord = this.words[this.currentWordIndex];
            const currentLetter = currentWord[this.currentWordLetterIndex];

            if (data.toLowerCase() === currentLetter) {
                this.speak(currentLetter.toUpperCase());
                this.currentWordLetterIndex++;
                this.correctInputs++;

                if (this.currentWordLetterIndex === currentWord.length) {
                    this.speak(`Excellent! You completed the word ${currentWord.toUpperCase()}`);
                    this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
                    this.currentWordLetterIndex = 0;
                    setTimeout(() => this.announceCurrentWord(), 2000);
                }
            } else {
                this.speak(`${data.toUpperCase()}, Incorrect, let's try again.`);
                this.currentWordLetterIndex = 0;
                setTimeout(() => this.announceCurrentWord(), 2000);
            }

            this.totalInputs++;
            this.updateProgressChart();
            return currentWord.substring(0, this.currentWordLetterIndex).toUpperCase();
        }

        // ... (remaining methods stay the same)

        resetState() {
            this.currentLetterIndex = 0;
            this.correctInputs = 0;
            this.totalInputs = 0;
            this.currentWordIndex = 0;
            this.currentWordLetterIndex = 0;
            
            this.progressChart.data.labels = [];
            this.progressChart.data.datasets[0].data = [];
            this.progressChart.update();
            
            this.updateDisplay("");

            if (this.mode === "practice") {
                setTimeout(() => this.announceCurrentWord(), 500);
            }
        }

        initializeEventListeners() {
            document.getElementById("connectBtn").addEventListener("click", () => this.connectToSerial());
            
            document.getElementById("modeSelect").addEventListener("change", (event) => {
                this.mode = event.target.value;
                this.resetState();
                
                if (this.mode === "learning") {
                    this.speak(`Let's start with the letter ${this.alphabet[0].toUpperCase()}. Fold ${this.alphabetFolds[this.alphabet[0]]}.`);
                }
            });
        }
    }

    // Initialize the application
    const brailleTeacher = new BrailleTeacher();
} else {
    alert("Web Serial API is not supported in this browser. Please use Chrome or Edge.");
}
