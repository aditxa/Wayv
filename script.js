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

        async connectToSerial() {
            try {
                this.port = await navigator.serial.requestPort();
                await this.port.open({ baudRate: 9600 });

                const decoder = new TextDecoderStream();
                const inputDone = this.port.readable.pipeTo(decoder.writable);
                this.reader = decoder.readable.getReader();

                this.showStatus("Connected successfully!");
                this.readSerialData();
            } catch (error) {
                this.showStatus(`Connection failed: ${error.message}`);
                console.error("Failed to connect to serial port:", error);
            }
        }

        async readSerialData() {
            try {
                while (true) {
                    const { value, done } = await this.reader.read();
                    if (done) {
                        this.showStatus("Connection closed");
                        this.reader.releaseLock();
                        break;
                    }
                    if (value) {
                        this.handleBrailleInput(value.trim());
                    }
                }
            } catch (error) {
                this.showStatus(`Error reading data: ${error.message}`);
                console.error("Error reading serial data:", error);
            }
        }

        handleBrailleInput(data) {
            if (!data) return;

            let outputText = "";
            
            try {
                if (this.mode === "learning") {
                    outputText = this.handleLearningMode(data);
                } else if (this.mode === "practice") {
                    outputText = this.handlePracticeMode(data);
                }

                this.updateDisplay(outputText);
            } catch (error) {
                this.showStatus(`Error processing input: ${error.message}`);
                console.error("Error handling input:", error);
            }
        }

        handleLearningMode(data) {
            const currentLetter = this.alphabet[this.currentLetterIndex];
            
            if (data.toLowerCase() === currentLetter) {
                this.speak(`Great! You folded ${currentLetter.toUpperCase()} correctly.`);
                this.correctInputs++;
                this.currentLetterIndex++;

                if (this.currentLetterIndex < this.alphabet.length) {
                    const nextLetter = this.alphabet[this.currentLetterIndex];
                    this.speak(`Now fold ${nextLetter.toUpperCase()}. Fold ${this.alphabetFolds[nextLetter]}.`);
                } else {
                    this.speak("Congratulations! You have completed learning the alphabet. Let's try forming words in practice mode.");
                    this.mode = "practice";
                    document.getElementById("modeSelect").value = "practice";
                }
            } else {
                this.speak(`Incorrect! Fold ${this.alphabetFolds[currentLetter]} for ${currentLetter.toUpperCase()}.`);
            }

            this.totalInputs++;
            this.updateProgressChart();
            return currentLetter.toUpperCase();
        }

        handlePracticeMode(data) {
            const currentWord = this.words[this.currentWordIndex];
            const currentLetter = currentWord[this.currentWordLetterIndex];

            if (data.toLowerCase() === currentLetter) {
                this.speak(currentLetter.toUpperCase());
                this.currentWordLetterIndex++;
                this.correctInputs++;

                if (this.currentWordLetterIndex === currentWord.length) {
                    this.speak(`Great! You completed the word ${currentWord.toUpperCase()}`);
                    this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
                    this.currentWordLetterIndex = 0;
                    this.speak(`Next word is ${this.words[this.currentWordIndex].toUpperCase()}`);
                }
            } else {
                this.speak(`${data.toUpperCase()}, Incorrect, start over.`);
                this.currentWordLetterIndex = 0;
            }

            this.totalInputs++;
            this.updateProgressChart();
            return currentWord.substring(0, this.currentWordLetterIndex).toUpperCase();
        }

        speak(text) {
            if (!text) return;
            
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9; // Slightly slower rate for better clarity
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }

        initProgressChart() {
            const ctx = document.getElementById('progressChart').getContext('2d');
            this.progressChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Accuracy (%)',
                        data: [],
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        tension: 0.4 // Smooth line
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Accuracy (%)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Attempts'
                            }
                        }
                    }
                }
            });
        }

        updateProgressChart() {
            if (this.totalInputs > 0) {
                const accuracy = (this.correctInputs / this.totalInputs) * 100;
                
                // Keep only the last 20 data points for better visualization
                if (this.progressChart.data.labels.length > 20) {
                    this.progressChart.data.labels.shift();
                    this.progressChart.data.datasets[0].data.shift();
                }
                
                this.progressChart.data.labels.push(this.totalInputs.toString());
                this.progressChart.data.datasets[0].data.push(accuracy.toFixed(2));
                this.progressChart.update();
            }
        }

        updateDisplay(text) {
            const display = document.getElementById("brailleOutput");
            if (display) {
                display.textContent = text;
            }
        }

        showStatus(message) {
            const status = document.getElementById("statusMessage");
            if (status) {
                status.textContent = message;
                setTimeout(() => {
                    status.textContent = "";
                }, 3000);
            }
        }

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
        }

        initializeEventListeners() {
            document.getElementById("connectBtn").addEventListener("click", () => this.connectToSerial());
            
            document.getElementById("modeSelect").addEventListener("change", (event) => {
                this.mode = event.target.value;
                this.resetState();
                
                const message = this.mode === "learning" 
                    ? `Let's start with the letter ${this.alphabet[0].toUpperCase()}. Fold ${this.alphabetFolds[this.alphabet[0]]}.`
                    : `Let's practice with the word ${this.words[0].toUpperCase()}`;
                
                this.speak(message);
            });
        }
    }

    // Initialize the application
    const brailleTeacher = new BrailleTeacher();
} else {
    alert("Web Serial API is not supported in this browser. Please use Chrome or Edge.");
}
