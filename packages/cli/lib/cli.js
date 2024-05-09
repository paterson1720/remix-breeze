#!/usr/bin/env node

const { program } = require("commander");

program
  .command("scaffold <type>")
  .description("scaffold a new project type")
  .action(async (type) => {
    switch (type) {
      case "auth":
        console.info("Scaffolding auth...");
        const url =
          "https://raw.githubusercontent.com/paterson1720/remix-breeze/master/packages/remix-demo-app/public/auth-scaffold.json";
        const response = await fetch(url);
        const data = await response.json();

        console.log(data);

        const routesDir = path.join(process.cwd(), "routes");
        if (!fs.existsSync(routesDir)) {
          fs.mkdirSync(routesDir);
        }

        data.forEach((item) => {
          const filePath = path.join(routesDir, item.fileName);
          fs.writeFileSync(filePath, item.content);
        });

        console.info("Auth scaffolded successfully!");
        console.info("The following routes were created in your project:");
        console.info(`
          ✅ /auth/register
          ✅ /auth/login
          ✅ /auth/logout
          ✅ /auth/forgot-password
          ✅ /auth/reset-password-email-sent
          ✅ /auth/reset-password
          ✅ /auth/reset-password-success
          ✅ /auth/test-dashboard
          ✅ /auth/test-admin-page
          ✅ /auth/unauthorized
        
          Make sure you have at least a "user" role in the "Role" table in your database.
          Then navigate to /auth/register in your browser to register a new user.
        `);

        break;
      default:
        console.log(`I don't know how to scaffoldz ${type}`);
    }
  });

program.parse(process.argv);
