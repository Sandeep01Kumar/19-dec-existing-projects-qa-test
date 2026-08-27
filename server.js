const express = require('express');

const hostname = '127.0.0.1';
const port = 3000;

const app = express();

// Suppress the framework fingerprint header, and disable entity tags so that a
// revalidating client always receives the full 200 response instead of a
// bodyless 304.
app.disable('x-powered-by');
app.disable('etag');

// The original greeting, byte for byte: 14 bytes including the trailing newline.
// The media type is declared before sending; sending without declaring it would
// emit text/html instead of text/plain.
app.get('/', (req, res) => {
  res.type('text/plain').send('Hello, World!\n');
});

// The second endpoint: exactly 12 bytes, no punctuation and no trailing newline.
app.get('/good-evening', (req, res) => {
  res.type('text/plain').send('Good evening');
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
