const http = require("http");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 5000;

function createSend(req, res, start) {
  return function (status, body, headers = {}) {
    const payload = typeof body === "string" ? body : JSON.stringify(body);
    const isJson = typeof body === "object";

    res.writeHead(status, {
      "Content-type": isJson ? "application/json" : "text/plain",
      ...headers,
    });
    res.end(payload);

    const duration = Date.now() - start;
    console.log(`${req.method}${req.url}${duration}`);
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;

      if (data.length > 1e6) {
        req.connection.destroy();
        reject(new Error("payload is too large"));
      }
    });

    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

const server = http.createServer(async (req, res) => {
  const start = Date.now();
  const send = createSend(req, res, start);

  try {
    const { pathname, searchParams } = new URL(
      req.url,
      `http://${req.headers.host}`
    );

    if (req.method === "GET" && pathname === "/") {
      return send(
        200,
        `
         <html>
                <head>
                    <title>NODE.JS SERVER</title>
                </head>
                <body>
                    <h1>Сервер на node.js без фреймворков</h1>
                </body>
            </html>
            `
      );
    }

    if (req.method === "GET" && pathname === "/about") {
      return send(
        200,
        `
         <html>
                <head>
                    <title>ABOUT</title>
                </head>
                <body>
                    <h1>Сервер использует только встренные модули node.js</h1>
                </body>
            </html>
            `
      );
    }

    if (req.method === "GET" && pathname === "/time") {
      return send(200, {
        now: new Date().toISOString(),
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    }

    if (req.method === "GET" && pathname === "/random") {
      const min = parseInt(searchParams.get("min"), 10);
      const max = parseInt(searchParams.get("max"), 10);

      if (isNaN(min) || isNaN(max)) {
        return send(400, { error: "Invalid min or max" });
      }

      return send(200, {
        randomNumber: getRandomInt(min, max),
      });
    }
    if (req.method === "POST" && pathname === "/echo") {
      const raw = await readBody(req);
      let json = null;

      try {
        json = raw ? JSON.parse(raw) : {};
      } catch {
        return send(400, { error: "Invalid JSON" });
      }

      return send(201, {
        received: json,
        headers: req.headers,
        method: req.method,
        url: req.url,
      });
    }

    send(404, { error: "Not Found" });
  } catch (err) {
    console.error(err);
    send(500, { error: "Internal Server Error" });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

function shutdown() {
  console.log(`\nServer is shutting donw`);
  server.close(() => {
    console.log("Server stopped");
    process.exit(1);
  });
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
