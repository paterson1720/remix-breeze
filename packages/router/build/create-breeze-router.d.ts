import { DefineRouteCallback, GetPathOption, RouteConfig } from "./types";
export declare function createBreezeRouter(options: {
    routes: RouteConfig[];
}): {
    /**
     * Initializes the routes
     * @param defineRoutes - The Remix DefineRouteFunction
     */
    init: (defineRoutes: DefineRouteCallback) => import("./types").RouteManifest;
    /**
     * Takes a DefineRouteCallback and defines the routes based on the RouteConfig object
     * @param defineRoutes - The Remix DefineRouteFunction
     */
    routes: (defineRoutes: DefineRouteCallback) => import("./types").RouteManifest;
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
    getPath: (name: string, _options?: GetPathOption) => string;
};
