<p align="center">
  <a href="https://github.com/Surajpal29/Nodegy/">
    <img src="#" alt="Nodegy Logo" width="150" height="150">
  </a>
</p>

<h1 align="center">Nodegy</h1>

<p align="center">
  Nodegy is a lightweight and efficient file watcher and server restarter for Node.js projects. It monitors changes in your project files and automatically restarts your server, making development smooth and easy.
</p>

## Features

- Automatic server restart on file changes.
- Manual server restart and stop options.
- Displays developer details on command.
- Supports various file types including `.js`, `.json`, `.html`, `.css`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, and `.md`.

## Installation

### Step 1: Install Nodegy

<h5>To install Nodegy globally run:</h5>

```bash
npm install -g nodegy
```

<h5>

To install Nodegy locally in your project run:

</h5>

```bash
npm i nodegy
```

<h5>
Step 2: Add Script to package.json
</h5>

```bash
{
  "name": "your-project-name",
  "scripts": {
    "start": "nodegy server.js"
  }
}
```

<h5>
Step 3: To start the server with Nodegy run:
</h5>

```bash
npm start
```

<h6>
Manual Commands
</h6>
Manual Restart: Type r and hit Enter in the terminal to manually restart the server.
Stop: Type c and hit Enter in the terminal to stop and exit the process.
Developer Details: Type dev and hit Enter in the terminal to display developer details.
Ignored Files
Nodegy automatically ignores the following files and directories:

.env
node_modules
.txt
.gitignore
Future updates will include features for manually ignoring specific files and directories.

Preview

Developer
Name: <Span style="{color:red}">
Suraj Pal
</Span>
Email: surajpal141516@gmail.com
Status: Currently a student looking for opportunities.
License
MIT License

Note: Nodegy is designed to enhance the development workflow by providing automatic server restarts and easy control over the server process. It is not recommended for production use.

Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss improvements or bugs.

Acknowledgements
Special thanks to all the contributors and the open-source community for their support and contributions.
