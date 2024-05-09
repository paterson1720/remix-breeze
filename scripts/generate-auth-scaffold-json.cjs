const fs = require("fs");
const path = require("path");

const appDir = path.join(__dirname, "../packages/remix-demo-app/app");
const routesDir = path.join(__dirname, "../packages/remix-demo-app/app/routes");
const outputDir = path.join(__dirname, "../packages/remix-demo-app/public");

fs.readdir(routesDir, (err, files) => {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }

  const result = files
    .filter((file) => file !== "_index.tsx")
    .map((file) => {
      const filePath = path.join(routesDir, file);
      const content = fs.readFileSync(filePath, "utf8");
      return { fileName: file, path: `/app/routes/${file}`, content };
    });

  const authServerFile = path.join(appDir, "auth.server.ts");
  const authServerContent = fs.readFileSync(authServerFile, "utf8");
  result.push({
    fileName: "auth.server.ts",
    path: "/app/auth.server.ts",
    content: authServerContent,
  });

  fs.writeFileSync(path.join(outputDir, "auth-scaffold.json"), JSON.stringify(result, null, 2));
});
