const express = require('express');

const hostname = '127.0.0.1';
const port = 3000;

const app = express();

// Suppress the framework fingerprint header, and disable entity tags so that
// neither response carries an ETag. Disabling entity tags is not on its own
// enough to keep a revalidating client on 200: Express still evaluates request
// freshness, so each route also drops the conditional validators below.
app.disable('x-powered-by');
app.disable('etag');

// The original greeting, byte for byte: 14 bytes including the trailing newline.
// The media type is declared before sending; sending without declaring it would
// emit text/html instead of text/plain.
app.get('/', (req, res) => {
  // res.send downgrades the response to a bodyless 304 whenever Express reports
  // the request as fresh, and a wildcard If-None-Match is reported fresh even
  // with entity tags disabled. Dropping both validators leaves the freshness
  // check on its unconditional-request path, so the full 200 is always sent.
  delete req.headers['if-none-match'];
  delete req.headers['if-modified-since'];
  res.type('text/plain').send('Hello, World!\n');
});

// The second endpoint: exactly 12 bytes, no punctuation and no trailing newline.
app.get('/good-evening', (req, res) => {
  // Same conditional-request neutralisation as the route above, for the same
  // reason: a revalidating client receives the full 200, never a bodyless 304.
  delete req.headers['if-none-match'];
  delete req.headers['if-modified-since'];
  res.type('text/plain').send('Good evening');
});

// Express registers this callback as the server's 'error' listener as well, so a
// bind failure such as EADDRINUSE arrives here instead of crashing the process.
// Rethrowing it reports the failure on stderr with its full diagnostic stack and
// exits non-zero, rather than announcing a server that is not listening: the
// startup line below is printed only when the socket is really listening.
app.listen(port, hostname, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Server running at http://${hostname}:${port}/`);
});
