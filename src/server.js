const http = require('http');
const app = require('./app');

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`PagBank controller API running on port ${PORT}`);
});

module.exports = server;
