const { createRoutes } = require("./scripts/create-routes");
const { createPrismaModel } = require("./scripts/create-model");
const { createService } = require("./scripts/create-service");

const { Command } = require("commander");
const { singularize, capitalize } = require("./scripts/utils");

const command = new Command("scaffold-crud")
  .alias("s-crud")
  .alias("g-crud")
  .addHelpText(
    "after",
    `Example: @remix-breeze/cli scaffold crud -r posts -f title:string, content:text`
  )
  .description("Scaffold CRUD for a ressource")
  .option("-r, --ressource <ressource>", "Ressource name")
  .option(
    "-f, --folder [folder]",
    "Folder name where the pages will be created. Default is 'app/pages' folder",
    "app/pages"
  )
  .option(
    "-m, --model <model>",
    "Model fields. Example: title:string description:text imageUrl:string?"
  )
  .option(
    "-pr, --parent-route [parentRoute]",
    "The parent route, if you want this ressource routes to be nested nested. Default is '/'"
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

    if (options.parentRoute && typeof options.parentRoute !== "string") {
      throw new Error("Parent route should be of type string. Example: -pr /admin");
    }

    const folder = options.folder || "app/pages";
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

    async function scaffoldCrud(ressourceName, folder) {
      const executeCreateRoutes = await createRoutes({
        ressourceName,
        folder,
        options,
        modelFieldsObject,
      });
      const executeCreateModel = createPrismaModel(ressourceName, modelFields);
      const executeCreateService = createService(ressourceName, modelFields);

      executeCreateRoutes();
      executeCreateModel();
      executeCreateService();
    }

    let parentRoute = options.parentRoute;
    if (!parentRoute) {
      parentRoute = "/";
    } else {
      parentRoute = parentRoute.replace(/^\/|\/$/g, "");
      parentRoute = `/${parentRoute}/`;
    }

    console.info("\n\n✅ CRUD scaffolded successfully!\n");
    console.info("---------------------------------------------------------------");
    console.info("👉Routes Created and Added to 'app/breeze.routes.config.js' :");
    console.info("---------------------------------------------------------------");
    console.info(
      `✅ ${parentRoute}${ressourceName}\n✅ ${parentRoute}${ressourceName}/create\n✅ ${parentRoute}${ressourceName}/:id\n✅ ${parentRoute}${ressourceName}/:id/edit\n✅ ${parentRoute}${ressourceName}/:id/delete\n`
    );

    console.info("---------------------------------------------------------------");
    console.info(
      `👉Model '${singularize(capitalize(ressourceName))}' added to 'prisma/prisma.schema'`
    );
    console.info("👉Service added to 'app/services' folder");
    console.info(`👉Pages added to 'app/pages' folder`);
    console.info("---------------------------------------------------------------\n");

    console.info("ℹ️ WHAT TO DO NEXT ?");
    console.info("-------------------");
    console.info("🖥️ Run the following command to update your database schema:");
    console.info(">👉 npx prisma db push");
    console.info(">👉 npx prisma generate");
    console.info(
      `🚀 Restart your Remix server and navigate to '${parentRoute}${ressourceName}' and see magic happens`
    );

    scaffoldCrud(ressourceName, folder);
  });

module.exports = command;
