#!/usr/bin/env node
const program = require("commander");
const { execSync } = require("child_process");
const path = require("path");
const { gitClone } = require("./util");

program
  .arguments("<project-name>")
  .action(function (projectName) {
    const projectPath = path.join(process.cwd(), projectName);
    const repoUrl = "https://github.com/paterson1720/new-remix-breeze-app";

    console.log(`Creating a new project in ${projectPath}.`);
    gitClone(repoUrl, projectPath, null, function () {
      console.log("Installing dependencies...");
      execSync("npm install", { cwd: projectPath, stdio: "inherit" });
      console.log("Project is ready!");
    });
  })
  .parse(process.argv);
