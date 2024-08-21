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
      if (data.trim() === "g") {
        brailleCharacter = "A";
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
