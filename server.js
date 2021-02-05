const express = require("express");
const path = require("path");
const enableDestroy = require("server-destroy");
const winston = require("winston");
const logform = require("logform");

const kTwoDigitFormatter = new Intl.NumberFormat("en-US", {
  minimumIntegerDigits: 2,
});
const kDeltaFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});
const kStartTime = new Date();
const format = logform.format;
const isoTimeFormatter = format((info, opts = {}) => {
  info.isoTime = new Date().toISOString();
  return info;
});
const fmt = kTwoDigitFormatter;
const now = kStartTime;
const logFileName = `server_out_${now.getFullYear()}_${fmt.format(
  now.getMonth() + 1
)}_\
${fmt.format(now.getDate())}_${fmt.format(now.getHours())}_${fmt.format(
  now.getMinutes()
)}_\
${fmt.format(now.getSeconds())}_${process.pid}.log`;

const { combine, printf } = winston.format;
const custom = printf(({ isoTime, level, message }) => {
  return `${isoTime}:${level}: ${message}`;
});
const formatter = combine(isoTimeFormatter(), custom);

const logger = winston.createLogger({
  level: "info",
  format: formatter,
  handleExceptions: true,
  maxsize: 1024 * 1024 * 10,
  maxFiles: 5,
  transports: [
    new winston.transports.File({
      filename: `${process.cwd()}/logs/${logFileName}`,
    }),
  ],
});

const BIN = true;
let infoLog = BIN ? logger.info : console.log;
let errorLog = BIN ? logger.error : console.error;

let app;
let expressServer;

const startServer = (port, dataPath) => {
  if (app) {
    app = null;
  }

  app = express();
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Serve static assets in production
  // Set static folder
  app.use("/", express.static(`${dataPath}/client/build`));
  app.use("*", (req, res) =>
    res.sendFile(path.resolve(dataPath, "client", "build", "index.html"))
  );

  expressServer = app.listen(port, () => {
    infoLog(`PSJ server is running on port ${port} at ${Date()}`);
  });

  const expressPid = process.pid;
  infoLog(expressPid);

  enableDestroy(expressServer);
};

const stopServer = () => {
  if (expressServer !== null) {
    infoLog("Server stopped");
    expressServer.destroy();
    app = null;
    expressServer = null;
  }
};
const restartServer = (port, dataPath) => {
  infoLog("Server restarted");
  stopServer();
  startServer(port, dataPath);
};

if (!BIN) {
  startServer("3000", process.cwd());
}

module.exports = {
  logger,
  stopServer,
  startServer,
  restartServer,
};
