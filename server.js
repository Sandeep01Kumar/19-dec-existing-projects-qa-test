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
const server = app.listen(port, hostname, (error) => {
  if (error) {
    const code = typeof error.code === 'string' ? error.code : 'UNKNOWN';
    console.error(`Server failed to bind ${hostname}:${port} (${code})`);
    process.exitCode = 1;
    return;
  }
  console.log(`Server running at http://${hostname}:${port}/`);
});

// Node hands a CONNECT request to the server's 'connect' event instead of the
// normal request pipeline, so the Express router never sees one and its
// built-in 404 cannot answer it. With no listener attached Node simply
// destroys the socket, leaving CONNECT with an empty close where every method
// other than GET/HEAD/OPTIONS gets a 404, so write that 404 on the raw socket
// here. The socket needs its own 'error' handler too: it carries no default
// one, so a peer vanishing mid-write would raise an unhandled 'error' and take
// the process down. Destroy it silently, leaving stdout and stderr untouched.
server.on('connect', (req, socket) => {
  socket.on('error', () => {
    socket.destroy();
  });
  socket.end('HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n');
});
