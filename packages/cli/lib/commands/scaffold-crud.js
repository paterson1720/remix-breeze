const { createRoutes } = require("./scripts/create-routes");
const { createPrismaModel } = require("./scripts/create-model");
const { createService } = require("./scripts/create-service");

const { Command } = require("commander");

const command = new Command("scaffold-crud")
  .alias("s-crud")
  .alias("g-crud")
  .addHelpText(
    "after",
    `Example: @remix-breeze/cli scaffold crud posts --fields title:string, content:text`
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

    scaffoldCrud(ressourceName, folder);
  });

module.exports = command;
