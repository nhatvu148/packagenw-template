const util = require("util");
const childProcess = require("child_process");
const exec = util.promisify(childProcess.exec);
const portfinder = require("portfinder");
const fs = require("fs");

const bytenode = require("bytenode");
const convertBin = (fileName) => {
  if (
    !fs.existsSync(`${process.cwd()}/${fileName}.jsc`) &&
    fs.existsSync(`${process.cwd()}/${fileName}.js`)
  ) {
    bytenode.compileFile({
      filename: `${process.cwd()}/${fileName}.js`,
      output: `${process.cwd()}/${fileName}.jsc`,
      compileAsModule: true,
    });
  }
};
convertBin("helpers");
convertBin("server");
convertBin("converter");

const { logger, stopServer, startServer, restartServer } = fs.existsSync(
  `${process.cwd()}/server.js`
)
  ? require(`${process.cwd()}/server.js`)
  : require(`${process.cwd()}/server.jsc`);

logger.info("Starting a new session...");
const win = nw.Window.get();
nw.App.on("open", async () => {
  await exec(
    `cd ${process.cwd()}/scripts && "${process.cwd()}/3rd_party/Python/python.exe" "InsWarn.py"`
  );
});
let port = 19283;
const sleep = async (msec) => {
  return new Promise((resolve) => setTimeout(resolve, msec));
};

const myframe = document.getElementById("myframe");
(async () => {
  try {
    win.on("close", async function () {
      if (window.confirm("Do you want to close PSJ Documentation?")) {
        this.close(true);
      }
    });

    win.on("minimize", function () {});
    win.on("maximize", function () {
      // win.enterFullscreen();
    });

    win.on("resize", function (width, height) {});

    // startServer("19283", tempPath);
    // stopServer();
    await sleep(1000);
    await startServerHtml();
  } catch (err) {
    logger.error(err);
  }
})();

const checkPort = async () => {
  const newPort = await portfinder.getPortPromise({
    port,
    host: "localhost",
  });
  if (Number(newPort) !== Number(port)) {
    port = newPort;
  }
};

const killServerHtml = () => {
  stopServer();
};

const startServerHtml = async () => {
  try {
    await checkPort();

    startServer(port, process.cwd());

    myframe.src = `http://localhost:${port}/`;
  } catch (err) {
    logger.error(err);
  }
};

const restartServerHtml = async () => {
  try {
    await checkPort();

    restartServer(port, process.cwd());
  } catch (err) {
    logger.error(err);
    restartServer(port, process.cwd());
  }
};
