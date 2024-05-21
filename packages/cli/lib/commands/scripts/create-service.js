const fs = require("fs");
const path = require("path");
const { normalizeRessourceName } = require("./utils");
const { findConfigFile } = require("./find-config-file");

function createService(ressourceName, fields) {
  const { capitalSingularResource, capitalRessourceName, lowerSingularResource } =
    normalizeRessourceName(ressourceName);

  const fieldTypeMap = {
    string: "string",
    boolean: "boolean",
    date: "Date",
    int: "number",
    text: "string",
    "string?": "string",
    "int?": "number",
    "boolean?": "boolean",
    "date?": "Date",
    "text?": "string",
  };

  // validate the service not yet created
  if (fs.existsSync(path.join("app", "services", `${lowerSingularResource}.service.ts`))) {
    throw new Error(
      `A service for ${ressourceName} already exists in the "services" folder. Please delete it first or choose another name of ressource to generate your CRUD.`
    );
  }

  return function execute() {
    const fieldsArray = fields.split(" ");
    fields = "";
    for (const field of fieldsArray) {
      const [name, type] = field.split(":");
      if (type.includes("?")) {
        fields += `${name}: ${fieldTypeMap[type]} | null;\n  `;
      } else {
        fields += `${name}: ${fieldTypeMap[type]};\n  `;
      }
    }

    const serviceContent = `import { prisma } from "prisma/client";
  
interface Create${capitalSingularResource}Params {
  ${fields.trimEnd().padStart("  ")}
  createdAt: Date;
  updatedAt: Date;
}

export async function create${capitalSingularResource}(params: Create${capitalSingularResource}Params) {
  return await prisma.${lowerSingularResource}.create({
    data: params,
  });
}

export async function get${capitalSingularResource}ById(id: string) {
  return await prisma.${lowerSingularResource}.findUnique({
    where: { id },
  });
}

export async function getAll${capitalRessourceName}() {
  return await prisma.${lowerSingularResource}.findMany();
}

export async function update${capitalSingularResource}(id: string, params: Partial<Create${capitalSingularResource}Params>) {
  return await prisma.${lowerSingularResource}.update({
    where: { id },
    data: params,
  });
}

export async function delete${capitalSingularResource}(id: string) {
  return await prisma.${lowerSingularResource}.delete({
    where: { id },
  });
}`;

    const servicesFolderPath = findConfigFile("app", "services");
    fs.writeFileSync(
      path.join(servicesFolderPath, `${lowerSingularResource}.service.ts`),
      serviceContent
    );
  };
}

module.exports = { createService };
