const fs = require("fs");
const path = require("path");
const { normalizeRessourceName } = require("./utils");

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
  const modelsPath = path.join("prisma", "schema.prisma");
  const schema = fs.readFileSync(modelsPath, "utf-8");
  if (schema.includes(`model ${capitalSingularResource}`)) {
    throw new Error(
      `A Model for ${capitalSingularResource} already exists in the prisma Schema file. Please delete it first or choose another name.`
    );
  }

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

  return function execute() {
    fs.writeFileSync(modelsPath, schema + "\n" + model);
  };
}

module.exports = { createPrismaModel };
