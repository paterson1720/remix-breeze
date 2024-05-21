#!/usr/bin/env node

const { Command } = require("commander");
const { execSync } = require("child_process");
const path = require("path");
const { gitClone } = require("./util");

const program = new Command("create-remix-breeze");

program
  .argument("<project-name>")
  .action(function (projectName) {
    const projectPath = path.join(process.cwd(), projectName);
    const repoUrl = "https://github.com/paterson1720/new-remix-breeze-app";

    console.log(`Creating a new project in ${projectPath}.`);
    gitClone(repoUrl, projectPath, null, function () {
      console.log("Installing dependencies...");
      execSync("npm install", { cwd: projectPath, stdio: "inherit" });
      execSync("cp .env.example .env", { cwd: projectPath, stdio: "inherit" });
      console.log("✅ Project is ready!");
    });
  })
  .parse(process.argv);
