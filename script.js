// Check if the Web Serial API is supported
if ("serial" in navigator) {
    let port;
    let reader;

    async function connectToSerial() {
      try {
        // Request a port and open a connection
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });

        // Create a reader to read the incoming data
        const decoder = new TextDecoderStream();
        const inputDone = port.readable.pipeTo(decoder.writable);
        reader = decoder.readable.getReader();

        // Continuously read data from the serial port
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
          handleBrailleInput(value);
        }
      }
    }

    function handleBrailleInput(data) {
      console.log("Received data:", data);
      // Add logic to translate the received data into Braille characters
      // For example, if data matches a certain pattern, display a letter
      let brailleCharacter = ""; // Initialize with the corresponding character
      if (data === "a") {
        brailleCharacter = "A";
        speakCharacter(brailleCharacter);
    } else if (data === "b") {
        brailleCharacter = "B";
        speakCharacter(brailleCharacter);
    } else if (data === "c") {
        brailleCharacter = "C";
        speakCharacter(brailleCharacter);
    } else if (data === "d") {
        brailleCharacter = "D";
        speakCharacter(brailleCharacter);
    } else if (data === "e") {
        brailleCharacter = "E";
        speakCharacter(brailleCharacter);
    } else if (data === "f") {
        brailleCharacter = "F";
        speakCharacter(brailleCharacter);
    } else if (data === "g") {
        brailleCharacter = "G";
        speakCharacter(brailleCharacter);
    } else if (data === "h") {
        brailleCharacter = "H";
        speakCharacter(brailleCharacter);
    } else if (data === "i") {
        brailleCharacter = "I";
        speakCharacter(brailleCharacter);
    } else if (data === "j") {
        brailleCharacter = "J";
        speakCharacter(brailleCharacter);
    } else if (data === "k") {
        brailleCharacter = "K";
        speakCharacter(brailleCharacter);
    } else if (data === "l") {
        brailleCharacter = "L";
        speakCharacter(brailleCharacter);
    } else if (data === "m") {
        brailleCharacter = "M";
        speakCharacter(brailleCharacter);
    } else if (data === "n") {
        brailleCharacter = "N";
        speakCharacter(brailleCharacter);
    } else if (data === "o") {
        brailleCharacter = "O";
        speakCharacter(brailleCharacter);
    } else if (data === "p") {
        brailleCharacter = "P";
        speakCharacter(brailleCharacter);
    } else if (data === "q") {
        brailleCharacter = "Q";
        speakCharacter(brailleCharacter);
    } else if (data === "r") {
        brailleCharacter = "R";
        speakCharacter(brailleCharacter);
    } else if (data === "s") {
        brailleCharacter = "S";
        speakCharacter(brailleCharacter);
    } else if (data === "t") {
        brailleCharacter = "T";
        speakCharacter(brailleCharacter);
    } else if (data === "u") {
        brailleCharacter = "U";
        speakCharacter(brailleCharacter);
    } else if (data === "v") {
        brailleCharacter = "V";
        speakCharacter(brailleCharacter);
    } else if (data === "w") {
        brailleCharacter = "W";
        speakCharacter(brailleCharacter);
    } else if (data === "x") {
        brailleCharacter = "X";
        speakCharacter(brailleCharacter);
    } else if (data === "y") {
        brailleCharacter = "Y";
        speakCharacter(brailleCharacter);
    } else if (data === "z") {
        brailleCharacter = "Z";
        speakCharacter(brailleCharacter);
    }
      
      // Add other cases for different Braille letters

      document.getElementById("brailleOutput").textContent = brailleCharacter;
    }

    function speakCharacter(character) {
      const utterance = new SpeechSynthesisUtterance(character);
      window.speechSynthesis.speak(utterance);
    }

    document.getElementById("connectBtn").addEventListener("click", connectToSerial);
  } else {
    alert("Web Serial API not supported in this browser.");
  }
