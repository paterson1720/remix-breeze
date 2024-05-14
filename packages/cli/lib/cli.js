#!/usr/bin/env node

const { program } = require("commander");
const path = require("path");
const fs = require("fs");
const { getPackageManager } = require("./commands/utils");

program
  .command("scaffold <type>")
  .description("scaffold a new project type")
  .action(async (type) => {
    switch (type) {
      case "auth":
        console.info("👉Remix-Breeze: Installing necessary packages...");
        const packageManager = await getPackageManager(process.cwd());
        const installCommand = packageManager === "npm" ? "install" : "add";
        const installPackages = `${packageManager} ${installCommand} @remix-breeze/auth`;
        const { execSync } = require("child_process");
        execSync(installPackages, { stdio: "inherit" });

        console.info("👉Remix-Breeze: Scaffolding auth...");
        const url =
          "https://raw.githubusercontent.com/paterson1720/remix-breeze/master/packages/remix-demo-app/public/auth-scaffold.json";
        const response = await fetch(url);
        const data = await response.json();

        const appDir = path.join(process.cwd(), "app");
        const routesDir = path.join(appDir, "routes");

        if (!fs.existsSync(appDir)) {
          fs.mkdirSync(appDir);
        }

        if (!fs.existsSync(routesDir)) {
          fs.mkdirSync(routesDir);
        }

        data.forEach((file) => {
          const filePath = path.join(process.cwd(), file.path);
          const fileDir = path.dirname(filePath);

          if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, {
              recursive: true,
            });
          }

          fs.writeFileSync(filePath, file.content);
        });

        console.info("✅ Auth scaffolded successfully!\n");
        console.info("👉The following routes were created in your project:");
        console.info(`✅ /auth/register
          ✅ /auth/login
          ✅ /auth/logout
          ✅ /auth/forgot-password
          ✅ /auth/reset-password-email-sent
          ✅ /auth/reset-password
          ✅ /auth/reset-password-success
          ✅ /auth/dashboard
          ✅ /auth/admin-dashboard
          ✅ /auth/unauthorized
        `);

        console.info(
          `Make sure you have at least a "user" role in the "Role" table in your database. Then navigate to /auth/register in your browser to register a new user.`
        );
        break;
      default:
        console.log(`❌ Command ${type} is not a valid scaffolding command.`);
    }
  });

program.parse(process.argv);
