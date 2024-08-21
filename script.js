if ("serial" in navigator) {
    let port;
    let reader;
    let mode = "learning";
    let currentWord = "";
    let currentLetterIndex = 0;
    let userInputs = [];
    let correctInputs = 0;
    let totalInputs = 0;

    const practiceWords = ["cat", "dog", "bat", "rat", "sun", "moon", "star"];

    let progressChart;

    async function connectToSerial() {
        try {
            port = await navigator.serial.requestPort();
            await port.open({ baudRate: 9600 });

            const decoder = new TextDecoderStream();
            const inputDone = port.readable.pipeTo(decoder.writable);
            reader = decoder.readable.getReader();

            readSerialData();
        } catch (error) {
            console.error("Failed to connect to serial port:", error);
        }
    }

    async function readSerialData() {
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                console.log("Reader closed");
                reader.releaseLock();
                break;
            }
            if (value) {
                handleBrailleInput(value.trim());
            }
        }
    }

    function handleBrailleInput(data) {
        let outputText = "";

        if (mode === "learning") {
            outputText = handleLetterInput(data);
        } else if (mode === "practice") {
            outputText = handlePracticeInput(data);
        }

        document.getElementById("brailleOutput").textContent = outputText;
    }

    function handleLetterInput(data) {
        const brailleMap = {
            "a": "A", "b": "B", "c": "C", "d": "D", "e": "E",
            "f": "F", "g": "G", "h": "H", "i": "I", "j": "J",
            "k": "K", "l": "L", "m": "M", "n": "N", "o": "O",
            "p": "P", "q": "Q", "r": "R", "s": "S", "t": "T",
            "u": "U", "v": "V", "w": "W", "x": "X", "y": "Y",
            "z": "Z"
        };

        const brailleCharacter = brailleMap[data] || "";
        if (brailleCharacter) {
            speakCharacter(brailleCharacter);
        }
        return brailleCharacter;
    }

    function handlePracticeInput(data) {
        if (!currentWord) {
            currentWord = practiceWords[Math.floor(Math.random() * practiceWords.length)].toUpperCase();
            currentLetterIndex = 0;
            document.getElementById("brailleOutput").textContent = currentWord;
            speakCharacter(currentWord, true);
            userInputs = [];
            updateUserInputsDisplay();
        } else {
            const expectedLetter = currentWord[currentLetterIndex];
            totalInputs++;
            if (data.toUpperCase() === expectedLetter) {
                correctInputs++;
                speakCharacter(expectedLetter);
                currentLetterIndex++;
                if (currentLetterIndex >= currentWord.length) {
                    currentWord = "";
                    currentLetterIndex = 0;
                }
            }
            userInputs.push(data.toUpperCase());
            updateUserInputsDisplay();
            updateProgressChart(); // Update the progress chart with each input
        }
        return currentWord;
    }

    function updateUserInputsDisplay() {
        document.getElementById("userInputsOutput").textContent = userInputs.join(" ");
    }

    function speakCharacter(text, spellOut = false) {
        if (spellOut) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => {
                text.split("").forEach((char, index) => {
                    setTimeout(() => {
                        const letterUtterance = new SpeechSynthesisUtterance(char);
                        window.speechSynthesis.speak(letterUtterance);
                    }, index * 600);
                });
            };
            window.speechSynthesis.speak(utterance);
        } else {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    }

    function initProgressChart() {
        const ctx = document.getElementById('progressChart').getContext('2d');
        progressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [], // x-axis labels
                datasets: [{
                    label: 'Accuracy (%)',
                    data: [], // y-axis data
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    function updateProgressChart() {
        if (totalInputs > 0) {
            const accuracy = (correctInputs / totalInputs) * 100;
            progressChart.data.labels.push(totalInputs.toString());
            progressChart.data.datasets[0].data.push(accuracy.toFixed(2));
            progressChart.update();
        }
    }

    document.getElementById("connectBtn").addEventListener("click", connectToSerial);
    document.getElementById("modeSelect").addEventListener("change", (event) => {
        mode = event.target.value;
        document.getElementById("brailleOutput").textContent = "";
        currentWord = "";
        currentLetterIndex = 0;
        userInputs = [];
        correctInputs = 0;
        totalInputs = 0;
        updateUserInputsDisplay();
        progressChart.data.labels = [];
        progressChart.data.datasets[0].data = [];
        progressChart.update();
    });

    initProgressChart(); // Initialize the chart on page load
} else {
    alert("Web Serial API not supported in this browser.");
}
