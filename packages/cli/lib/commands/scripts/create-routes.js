const fs = require("fs");
const path = require("path");
const {
  getListMarkup,
  getCreateMarkup,
  getShowMarkup,
  getEditMarkup,
  getDeleteMarkup,
} = require("./markups/index");
const { findConfigFile } = require("./find-config-file");

async function createRoutes({ ressourceName, folder, options, modelFieldsObject }) {
  folder = folder || "app/pages";
  folder = folder.replace(/^\/|\/$/g, "");
  folder = folder.replace(/^app\//, "");
  let parent = options.parentRoute;

  if (parent) {
    parent = parent.replace(/^\/|\/$/g, "");
    parent = `/${parent}/`;
  } else {
    parent = "/";
  }

  const routes = [
    {
      path: `${parent}${ressourceName}`,
      file: `${folder}/${ressourceName}/index.tsx`,
      content: getListMarkup({ ressourceName, parent }),
    },
    {
      path: `${parent}${ressourceName}/create`,
      file: `${folder}/${ressourceName}/create.tsx`,
      content: getCreateMarkup({ ressourceName, parent, modelFieldsObject }),
    },
    {
      path: `${parent}${ressourceName}/:id`,
      file: `${folder}/${ressourceName}/show.tsx`,
      content: getShowMarkup({ ressourceName, parent }),
    },
    {
      path: `${parent}${ressourceName}/:id/edit`,
      file: `${folder}/${ressourceName}/edit.tsx`,
      content: getEditMarkup({ ressourceName, parent, modelFieldsObject }),
    },
    {
      path: `${parent}${ressourceName}/:id/delete`,
      file: `${folder}/${ressourceName}/delete.tsx`,
      content: getDeleteMarkup({ ressourceName, parent }),
    },
  ];

  const routesConfigFilePath = findConfigFile("app", "breeze.routes.config.js");
  const routesConfig = (await import(routesConfigFilePath)).default;

  // check if the routes already exist
  if (options.parentRoute) {
    const parent = routesConfig.find((r) => r.path === options.parentRoute);
    if (!parent) {
      throw new Error(`Parent route ${options.parentRoute} not found`);
    }
    for (const route of routes) {
      if (parent.children && parent.children.find((r) => r.path === route.path)) {
        throw new Error(`Route ${route.path} already exists`);
      }
    }
  } else {
    for (const route of routes) {
      if (routesConfig.find((r) => r.path === route.path)) {
        throw new Error(`Route ${route.path} already exists`);
      }
    }
  }

  // validate routes config file exists
  if (!fs.existsSync("app/breeze.routes.config.js")) {
    throw new Error(
      "Routes config file 'app/breeze.routes.config.js' not found. Please create one first before running this command."
    );
  }

  // create the files in the pages directory
  for (const route of routes) {
    const { file } = route;
    const directories = path.join("app", ...file.split("/").slice(0, -1));
    fs.mkdirSync(directories, { recursive: true });
    fs.writeFileSync(path.join("app", file), route.content);
  }

  // add the routes to the routesConfig
  for (const route of routes) {
    const { path, file } = route;
    if (options.parentRoute) {
      const parent = routesConfig.find((r) => r.path === options.parentRoute);
      if (!parent) {
        throw new Error(`Parent route ${options.parentRoute} not found`);
      }
      parent.children = parent.children || [];
      parent.children.push({ path, file });
    } else {
      routesConfig.push({ path, file });
    }
  }

  return function execute() {
    fs.writeFileSync(
      "app/breeze.routes.config.js",
      `/** @type {import("app/lib/remix-breeze-router/types").RouteConfig[]} */
     export default ${JSON.stringify(routesConfig, null, 2)}`
    );
  };
}

module.exports = { createRoutes };
