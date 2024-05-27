const fs = require("fs");
const path = require("path");
const {
  getListMarkup,
  getFormMarkup,
  getCreateMarkup,
  getShowMarkup,
  getEditMarkup,
  getDeleteMarkup,
  getServiceMarkup,
  getTypesMarkup,
} = require("./markups/index");
const { findConfigFile } = require("./find-config-file");

async function createRoutes({ ressourceName, folder, modelFieldsObject }) {
  folder = folder || "app";
  folder = folder.replace(/^\/|\/$/g, "");
  folder = folder.replace(/^app/, "");

  let parent = "/";
  const parentParts = folder.split("/").filter((p) => p && !p.includes("("));
  if (parentParts.length) {
    parent = `/${parentParts.join("/")}/`;
  } else {
    parent = "/";
  }

  const routes = [
    {
      file: `${folder}/${ressourceName}/page.tsx`,
      content: getListMarkup({ ressourceName, parent }),
    },
    {
      file: `${folder}/${ressourceName}/create/page.tsx`,
      content: getCreateMarkup({ ressourceName, parent, modelFieldsObject }),
    },
    {
      file: `${folder}/${ressourceName}/[id]/page.tsx`,
      content: getShowMarkup({ ressourceName, parent }),
    },
    {
      file: `${folder}/${ressourceName}/[id]/edit/page.tsx`,
      content: getEditMarkup({ ressourceName, parent, modelFieldsObject }),
    },
    {
      file: `${folder}/${ressourceName}/_components/form.tsx`,
      content: getFormMarkup({ ressourceName, parent, modelFieldsObject }),
    },
    {
      file: `${folder}/${ressourceName}/_components/delete-form.tsx`,
      content: getDeleteMarkup({ ressourceName, parent }),
    },
    {
      file: `${folder}/${ressourceName}/_actions/index.ts`,
      content: getServiceMarkup({ ressourceName, parent, modelFieldsObject }),
    },
    {
      file: `${folder}/${ressourceName}/_types/index.ts`,
      content: getTypesMarkup({ modelFieldsObject }),
    },
  ];

  return function execute() {
    const routesConfigFilePath = findConfigFile(...folder.split("/").filter((p) => p));
    if (!routesConfigFilePath) {
      const appDir = findConfigFile("app");
      fs.mkdirSync(path.join(appDir, ...folder.split("/")), { recursive: true });
    }
    const appDir = findConfigFile("app");
    for (const route of routes) {
      let { file } = route;
      file = file.replace(/^\//, "");
      file = file.replace(/^app\//, "");
      const directories = path.join(appDir, ...file.split("/").slice(0, -1));
      fs.mkdirSync(directories, { recursive: true });
      fs.writeFileSync(path.join(appDir, file), route.content);
    }
  };
}

module.exports = { createRoutes };
