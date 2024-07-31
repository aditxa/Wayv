const express = require('express');
const bodyParser = require('body-parser');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const serialPort = new SerialPort('COM3', { baudRate: 9600 }); // Replace 'COM3' with your Arduino's port
const parser = serialPort.pipe(new Readline({ delimiter: '\r\n' }));

let currentCharacter = '';

parser.on('data', data => {
  currentCharacter = data.trim();
  console.log(currentCharacter);
});

app.get('/api/current-character', (req, res) => {
  res.json({ character: currentCharacter });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
