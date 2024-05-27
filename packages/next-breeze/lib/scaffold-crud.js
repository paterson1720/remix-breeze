const { createRoutes } = require("./scripts/create-routes");
const { createPrismaModel } = require("./scripts/create-model");

const { Command } = require("commander");
const { singularize, capitalize } = require("./scripts/utils");

const command = new Command("scaffold-crud")
  .alias("s-crud")
  .alias("g-crud")
  .description("Scaffold CRUD for a ressource")
  .option("-r, --ressource <ressource>", "Ressource name")
  .option(
    "-f, --folder [folder]",
    "Folder name where the pages will be created. Default is 'app/' folder",
    "app/"
  )
  .option(
    "-m, --model <model>",
    "Model fields. Example: title:string description:text imageUrl:string?"
  )
  .action(async (options) => {
    if (typeof options.ressource !== "string") {
      throw new Error(
        "Ressource name is required. Please provide a ressourceName name. \n\nExample:\ns-crud -r posts -m 'title:string description:text'"
      );
    }

    if (typeof options.model !== "string") {
      throw new Error(
        "Model fields are required. Please provide model fields. \n\nExample:\ns-crud -r posts -m 'title:string description:text'"
      );
    }

    if (options.folder && typeof options.folder !== "string") {
      throw new Error("Folder name should be of type string. Example: -f app/pages/admin");
    }

    const folder = options.folder || "app/";
    const ressourceName = options.ressource;

    const modelFields = options.model;
    if (!modelFields) {
      throw new Error(
        "Model fields are required. Please provide model fields. \n\nExample:\ngen-crud -r posts -m 'title:string description:text'"
      );
    }

    const modelFieldsObject = {};
    modelFields.split(" ").forEach((field) => {
      const [name, type] = field.split(":");
      modelFieldsObject[name] = type;
    });

    let parentRoute = options.folder || "/";
    if (!parentRoute) {
      parentRoute = "/";
    } else {
      parentRoute = parentRoute.replace(/^\/|\/$/g, "");
      parentRoute = parentRoute.trim().replace(/^app/, "");
      const routeParts = parentRoute.split("/").filter((p) => p && !p.includes("("));
      if (routeParts.length) {
        parentRoute = `/${routeParts.join("/")}/`;
      } else {
        parentRoute = "/";
      }
    }

    async function scaffoldCrud(ressourceName, folder) {
      const executeCreateRoutes = await createRoutes({
        ressourceName,
        folder,
        options,
        modelFieldsObject,
      });
      const executeCreateModel = createPrismaModel(ressourceName, modelFields);

      executeCreateRoutes();
      executeCreateModel();

      console.info("\n\n✅ CRUD scaffolded successfully!\n");
      console.info("---------------------------------------------------------------");
      console.info("👉Routes Created and Added to 'app/' :");
      console.info("---------------------------------------------------------------");
      console.info(
        `✅ ${parentRoute}${ressourceName}\n✅ ${parentRoute}${ressourceName}/create\n✅ ${parentRoute}${ressourceName}/:id\n✅ ${parentRoute}${ressourceName}/:id/edit\n✅ ${parentRoute}${ressourceName}/:id/delete\n`
      );

      console.info("---------------------------------------------------------------");
      console.info(
        `👉Model '${singularize(capitalize(ressourceName))}' added to 'prisma/schema.prisma'`
      );
      console.info("👉Server Actions added to 'actions/' folder");
      console.info("---------------------------------------------------------------\n");

      console.info("ℹ️ WHAT TO DO NEXT ?");
      console.info("-------------------");
      console.info("🖥️ Run the following command to update your database schema:");
      console.info(">👉 npx prisma db push");
      console.info(">👉 npx prisma generate");
      console.info(
        `🚀 Restart your server and navigate to '${parentRoute}${ressourceName}' and see magic happens`
      );
    }

    scaffoldCrud(ressourceName, folder);
  });

module.exports = command;
