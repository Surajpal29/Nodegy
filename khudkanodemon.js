#!/usr/bin/env node

const { spawn } = require("child_process");
const chokidar = require("chokidar");
const path = require("path");

let serverProcess = null;
let isProcessClosed = true;
const watchPaths = [
  path.join(process.cwd(), "/**/*.js"),
  path.join(process.cwd(), "/**/*.json"),
  path.join(process.cwd(), "/**/*.html"),
  path.join(process.cwd(), "/**/*.css"),
  path.join(process.cwd(), "/**/*.{png,jpg,jpeg,gif,svg}"),
  path.join(process.cwd(), "/**/*.md"),
];

const delayTime = 1000;
const intervalTime = 500;

const messages = {
  welcome: `\x1b[32mWelcome to SyncServer\x1b[0m`,
  version: `\x1b[34mv1.0.0\x1b[0m`,
  rebooting: `\x1b[35m... SyncServer Rebooting ...\x1b[0m`,
  manualRestart: `\x1b[33mPress 'r' to manually restart the server\x1b[0m`,
  manualStop: `\x1b[33mPress 'c' to stop the server\x1b[0m`,
  devDetails: `\x1b[33mPress 'dev' to know more about the developer\x1b[0m`,
  compatibleExtensions: `\x1b[35mCompatible extensions: .js, .json, .html, .css, .png, .jpg, .jpeg, .gif, .svg, .md\x1b[0m`,
  closing: `\x1b[31m... SyncServer Shutting Down ...\x1b[0m`,
  developerInfo: `\x1b[32mDeveloper: Alex Doe\x1b[0m`,
  developerEmail: `\x1b[32mEmail: alexdoe@example.com\x1b[0m`,
  developerStatus: `\x1b[32mCurrently available for new opportunities\x1b[0m`,
};

if (process.argv.length === 3) {
  console.log(messages.welcome, messages.version);
  console.log(messages.manualRestart);
  console.log(messages.manualStop);
  console.log(messages.devDetails);
  console.log(messages.compatibleExtensions);

  initialize();
}

function initialize() {
  serverProcess = startServerProcess();
  watchFiles();

  process.on("SIGINT", async () => await handleClose());
  process.on("SIGTERM", async () => await handleClose());
  process.on("exit", async () => await handleClose());

  process.stdin.on("data", async (chunk) => {
    const input = chunk.toString().trim();
    if (input === "r") await reloadServer();
    if (input === "c") await handleClose();
    if (input === "dev") {
      displayDevDetails();
      await reloadServer();
    }
  });
}

function startServerProcess() {
  const childProcess = spawn("node", [process.argv[2]], {
    stdio: [process.stdin, process.stdout, process.stderr],
  });

  isProcessClosed = false;

  childProcess.on("close", () => {
    isProcessClosed = true;
    console.log(messages.rebooting);
    console.log("Rebooting:", process.argv[2]);
  });

  childProcess.on("error", (error) => {
    isProcessClosed = true;
    console.error(error);
  });

  return childProcess;
}

function watchFiles() {
  chokidar
    .watch(watchPaths, {
      ignored: ["**/node_modules/*", "**/.env", "**/.gitignore", "**/*.txt"],
      ignoreInitial: true,
    })
    .on(
      "all",
      debounce(async () => {
        await reloadServer();
      }, delayTime)
    );
}

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

async function reloadServer() {
  await stopServerProcess();
  serverProcess = startServerProcess();
}

async function stopServerProcess() {
  return new Promise((resolve) => {
    if (serverProcess) {
      serverProcess.kill();
      const intervalId = setInterval(() => {
        if (isProcessClosed) {
          clearInterval(intervalId);
          resolve(true);
        }
      }, intervalTime);
    } else {
      resolve(true);
    }
  });
}

async function handleClose() {
  await stopServerProcess();
  console.log(messages.closing);
  process.exit();
}

function displayDevDetails() {
  console.log(messages.developerInfo);
  console.log(messages.developerStatus);
  console.log(messages.developerEmail);
}

function libraryFunction() {
  console.log("Hello from the library!");
}

module.exports = {
  libraryFunction,
};
