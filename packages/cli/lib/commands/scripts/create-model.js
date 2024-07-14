const fs = require("fs");
const path = require("path");
const { normalizeRessourceName } = require("./utils");
const { findConfigFile } = require("./find-config-file");

function createPrismaModel(ressourceName, fieldsString) {
  const { capitalSingularResource } = normalizeRessourceName(ressourceName);

  const typeMap = {
    string: "String",
    boolean: "Boolean",
    date: "DateTime",
    int: "Int",
    text: "String",
    "string?": "String?",
    "int?": "Int?",
    "boolean?": "Boolean?",
    "date?": "DateTime?",
    "text?": "String?",
  };

  // validate model not yet created
  const modelFolderPath = findConfigFile("prisma");
  const modelsPath = path.join(modelFolderPath, "schema.prisma");
  const schema = fs.readFileSync(modelsPath, "utf-8");
  if (schema.includes(`model ${capitalSingularResource}`)) {
    const message = `A Model for ${capitalSingularResource} already exists in the prisma Schema file. Skipping model creation.`;
    return () => console.log(message);
  }

  return function execute() {
    const fields = {};
    for (const field of fieldsString.split(" ")) {
      const [name, type] = field.split(":");
      fields[name] = type;
    }

    let model = `model ${capitalSingularResource} {\n  id String @id @default(cuid())\n`;

    for (const field in fields) {
      model += `  ${field} ${typeMap[fields[field]]}\n`;
    }
    model += "  createdAt DateTime @default(now())\n";
    model += "  updatedAt DateTime @updatedAt\n";
    model += "}";
    fs.writeFileSync(modelsPath, schema + "\n" + model);
  };
}

module.exports = { createPrismaModel };
