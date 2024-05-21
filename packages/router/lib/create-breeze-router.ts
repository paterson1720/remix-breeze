import { DefineRouteCallback, DefineRouteFunction, GetPathOption, RouteConfig } from "./types";

// Utility type to extract route names, ensuring children is always checked
type ExtractRouteNames<T extends RouteConfig[]> = {
  [K in keyof T]: T[K] extends { name: infer N; children?: RouteConfig[] }
    ? N | ExtractRouteNames<NonNullable<T[K]["children"]>>
    : never;
}[number];

export function createBreezeRouter<T extends RouteConfig[]>(options: { routes: T }) {
  type RouteNames = ExtractRouteNames<T>;

  function init(defineRoutes: DefineRouteCallback) {
    return defineRoutes(getDefineRoutesCallback(options.routes));
  }
  function routes(defineRoutes: DefineRouteCallback) {
    return init(defineRoutes);
  }
  function getPath(name: RouteNames, _options: GetPathOption = {}) {
    return getRoutePath(name as string, options.routes, _options);
  }
  return {
    /**
     * Initializes the routes
     * @param defineRoutes - The Remix DefineRouteFunction
     */
    init,
    /**
     * Takes a DefineRouteCallback and defines the routes based on the RouteConfig object
     * @param defineRoutes - The Remix DefineRouteFunction
     */
    routes,
    /**
     * Get a route path by name, throws an error if the route is not found, make sure
     * to pass the "name" attribute when definig your routes in the RouteConfig object
     * if you want to use this function
     *
     * @param name - The name of the route
     * @param options - The options to pass to the route
     * @returns The path of the route
     * @example
     * breezeRouter.getPath("Posts.Edit", { id: "1" }) => "/posts/1/edit"
     * breezeRouter.getPath("Posts.Edit", { id: "1", query: { name: "John" } }) => "/posts/1/edit?name=John"
     * breezeRouter.getPath("Posts.Edit", { id: "1", hash: "section-1" }) => "/posts/1/edit#section-1"
     * breezeRouter.getPath("Posts.Edit", { id: "1", query: { name: "John" }, hash: "section-1" }) => "/posts/1/edit?name=John#section-1"
     */
    getPath,
  };
}

// Function to get a route by name
// example
// breezeRouter.path("Posts.Edit", { id: "1" }) => "/posts/1/edit"
// breezeRouter.path("Posts.Edit", { id: "1", query: { name: "John" } }) => "/posts/1/edit?name=John"
// breezeRouter.path("Posts.Edit", { id: "1", hash: "section-1" }) => "/posts/1/edit#section-1"
// breezeRouter.path("Posts.Edit", { id: "1", query: { name: "John" }, hash: "section-1" }) => "/posts/1/edit?name=John#section-1"
// type of name so should be infferd automatically in tn routes config, it should be a union of all names

function getRoutePath(name: string, routesConfig: RouteConfig[], options: GetPathOption = {}) {
  const route = findRouteRecursively(name, routesConfig);

  if (!route) {
    throw new Error(`Route with name ${name} not found`);
  }

  let path = route.path;
  for (const key in options.params) {
    path = path.replace(`:${key}`, options.params[key].toString());
  }

  if (options.query) {
    path += `?${new URLSearchParams(options.query).toString()}`;
  }

  if (options.hash) {
    path += `#${options.hash}`;
  }

  return path;
}

function findRouteRecursively(name: string, routes: RouteConfig[]): RouteConfig | undefined {
  for (const route of routes) {
    if (route.name === name) {
      return route;
    }

    if (route.children) {
      const found = findRouteRecursively(name, route.children);
      if (found) {
        return found;
      }
    }
  }
}

/**
 * -------------------------------------
 * getDefineRoutesCallback
 * -------------------------------------
 * This function takes a RouteConfig object and returns a function that takes the 
 * Remix DefineRouteFunctionand recursively defines the routes based 
 * on the RouteConfig object.
 * 
 * Transformed RouteConfig object to something like the following:
 * 
 *  route("/", "pages/home/page.tsx", { index: true });
    route("about", "pages/about/page.tsx");
    route("admin", "pages/admin/layout.tsx", () => {
      route("", "pages/admin/users.tsx", { index: true });
      route("banners", "pages/admin/banners.tsx");
      route("announcements", "pages/admin/announcements.tsx");
    });
 */
function getDefineRoutesCallback(routesConfig: RouteConfig[]) {
  return (route: DefineRouteFunction) => {
    const defineRoutesRecursively = (config: RouteConfig) => {
      const { path, file, options, children } = config;

      route(path, file, options, () => {
        if (children) {
          children.forEach((child) => {
            defineRoutesRecursively(child);
          });
        }
      });
    };

    routesConfig.forEach((config) => {
      defineRoutesRecursively(config);
    });
  };
}
