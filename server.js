// Entry point for cPanel Phusion Passenger / PM2.
// Starts the Next.js production server on the port provided by the host.
// Usage: node server.js
//
// For cPanel Node.js Selector set:
//   Application startup file: server.js
//   Node.js version:          18.x or 20.x
//   Application root:         /home/username/nextjscms
//   Environment variables:    See .env.example
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
// cPanel Phusion Passenger injects PORT; fallback to 3000 for local
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  }).listen(port, hostname, () => {
    console.log(`> NextjsCMS running at http://${hostname}:${port} [${process.env.NODE_ENV}]`);
  });
});
