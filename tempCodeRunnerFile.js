const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

let displayAsJson = true; // Default display format
let nodeProcess = null;
let processClosed = true;
let showFullTree = false; // Control flag for showing the full tree
let changeTimeout = null; // Timeout ID for debouncing

// Build the directory tree recursively
const buildTree = (dirPath) => {
  const tree = {};
  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      tree[file.name] = buildTree(fullPath);
    } else {
      tree[file.name] = "file";
    }
  });

  return tree;
};

// Read the directory and display the tree
const readDirectory = (dirPath) => {
  try {
    const dirTree = buildTree(dirPath);
    console.log("\x1b[36m%s\x1b[0m", "Restarting the server.🚀");
    if (displayAsJson) {
      console.log(JSON.stringify(dirTree, null, 2));
    } else {
      console.log(flattenTree(dirTree));
    }
  } catch (err) {
    console.error(
      "\x1b[31m%s\x1b[0m",
      `Error reading directory '${dirPath}':`,
      err.message
    );
  }
};

// Flatten the directory tree for normal format display
const flattenTree = (tree, prefix = "") => {
  let result = "";
  for (const key in tree) {
    if (tree[key] === "file") {
      result += `${prefix}${key}\n`;
    } else {
      result += `${prefix}${key}/\n`;
      result += flattenTree(tree[key], `${prefix}  `);
    }
  }
  return result;
};

// Start the Node.js process
const startProcess = () => {
  let childProcess = spawn("node", ["index.js"], {
    stdio: [process.stdin, process.stdout, process.stderr],
  });
  processClosed = false;

  childProcess.on("close", () => {
    processClosed = true;
    console.log(
      "\x1b[32m%s\x1b[0m",
      "Process closed, waiting for changes to restart..."
    );
  });

  childProcess.on("error", (err) => {
    processClosed = true;
    console.error(err);
  });

  return childProcess;
};

// Reload the process
const reload = async () => {
  await stopProcess();
  nodeProcess = startProcess();
};

// Stop the process
const stopProcess = () => {
  return new Promise((resolve) => {
    if (nodeProcess) {
      nodeProcess.kill();
    }
    const key = setInterval(() => {
      if (processClosed) {
        clearInterval(key);
        resolve(true);
      }
    }, 500);
  });
};

// Display the introductory message with available commands
const displayIntroMessage = () => {
  console.log("\x1b[33m%s\x1b[0m", "Welcome! Here are the available commands:");
  console.log("\x1b[32m%s\x1b[0m", "  rs     - Restart the server manually");
  console.log(
    "\x1b[32m%s\x1b[0m",
    "  toggle - Toggle the display format between JSON and normal"
  );
  console.log("\x1b[32m%s\x1b[0m", "  seeFiles - Show the full directory tree");
};

// Initialize the directory watcher and process manager
const init = () => {
  displayIntroMessage();
  const dirPath = process.cwd(); // Use the current working directory

  // Initial directory read (only show if requested)
  if (showFullTree) {
    readDirectory(dirPath);
  }

  // Watch the directory for changes
  fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
    if (filename) {
      if (showFullTree) {
        readDirectory(dirPath);
      } else {
        console.log(`Changed file: ${filename}`);
      }

      // Debounce the reload function
      clearTimeout(changeTimeout);
      changeTimeout = setTimeout(() => {
        reload();
      }, 100);
    }
  });

  nodeProcess = startProcess();

  // Listening for 'rs', 'toggle', and 'seeFiles' inputs
  process.stdin.on("data", async (chunk) => {
    const data = chunk.toString().trim();
    if (data === "rs") {
      await reload();
    } else if (data === "toggle") {
      displayAsJson = !displayAsJson;
      console.log(
        `Display format toggled to ${displayAsJson ? "JSON" : "normal"}`
      );
    } else if (data === "seeFiles") {
      showFullTree = !showFullTree;
      if (showFullTree) {
        readDirectory(dirPath);
      }
      console.log(
        `Directory tree display ${showFullTree ? "enabled" : "disabled"}`
      );
    }
  });

  process.on("SIGINT", async () => {
    await stopProcess();
    process.exit();
  });

  process.on("SIGTERM", async () => {
    await stopProcess();
    process.exit();
  });
};

// Ensure the module exports the init function
module.exports = { init };

// Automatically call init if the script is run directly
if (require.main === module) {
  init();
}
