const express = require('express');

const hostname = '127.0.0.1';
const port = 3000;

const app = express();

app.disable('x-powered-by');
app.disable('etag');

// Preserve the 14-byte greeting, including its newline, and declare plain text
// because Express otherwise treats string bodies as HTML.
app.get('/', (req, res) => {
  // res.send downgrades the response to a bodyless 304 whenever Express reports
  // the request as fresh, and a wildcard If-None-Match is reported fresh even
  // with entity tags disabled, so that validator is dropped. If-Modified-Since
  // needs no guard: it is only ever fresh against a Last-Modified we never set.
  delete req.headers['if-none-match'];
  res.type('text/plain').send('Hello, World!\n');
});

app.get('/good-evening', (req, res) => {
  delete req.headers['if-none-match'];
  res.type('text/plain').send('Good evening');
});

// Express 5 passes listen errors to this callback. Report the code alone,
// never the Error whose stack would disclose local paths, and exit non-zero.
app.listen(port, hostname, (error) => {
  if (error) {
    const code = typeof error.code === 'string' ? error.code : 'UNKNOWN';
    console.error(`Server failed to bind ${hostname}:${port} (${code})`);
    process.exitCode = 1;
    return;
  }
  console.log(`Server running at http://${hostname}:${port}/`);
});
