"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBreezeToast = void 0;
const node_1 = require("@remix-run/node");
function createBreezeToast(options) {
    const toastSessionStorage = (0, node_1.createCookieSessionStorage)({
        cookie: {
            name: options.cookie.name || "__breeze-toast-session__",
            secrets: [options.cookie.secret],
        },
    });
    async function toastRedirect(type, message, redirectTo) {
        const session = await toastSessionStorage.getSession();
        session.flash("breeze_toast", { type, message });
        return (0, node_1.redirect)(redirectTo, {
            headers: {
                "Set-Cookie": await toastSessionStorage.commitSession(session),
            },
        });
    }
    async function toast(type, message) {
        const session = await toastSessionStorage.getSession();
        session.flash("breeze_toast", { type, message });
        const headers = {
            "Set-Cookie": await toastSessionStorage.commitSession(session),
        };
        return headers;
    }
    return {
        /**
         * -------------------------------
         * sessionStorage
         * -------------------------------
         * The session storage object with methods `getSession`, `commitSession`, and `destroySession`
         * @type {SessionStorage<{breeze_toast: {type: "success" | "error" | "info" | "warning"; message: string;};}>}
         *
         */
        sessionStorage: toastSessionStorage,
        /**
         * -------------------------------
         * successRedirect
         * -------------------------------
         * Adds a flash toast object to the session storage with type `success` and the specified message
         * committing the session object to the storage and redirecting to the specified URL
         * @param options
         * @param options.message - string - The message to display
         * @param options.redirectTo - string - The URL to redirect to after displaying the toast
         * @returns - Promise<Response> - The response object that will redirect to the specified URL
         * @example
         * ```ts
         * await toast.successRedirect({
         *  to: "/dashboard",
         *  message: "This is a success message",
         * });
         * ```
         */
        successRedirect: async (options) => {
            const { message, to } = options;
            return toastRedirect("success", message, to);
        },
        /**
         * -------------------------------
         * errorRedirect
         * -------------------------------
         * Adds a flash toast object to the toast session with type `error` and the specified message
         * committing the session object to the storage and redirecting to the specified URL
         * @param options
         * @param options.message - string - The message to display
         * @param options.redirectTo - string - The URL to redirect to after displaying the toast
         * @returns - Promise<Response> - The response object that will redirect to the specified URL
         * @example
         * ```ts
         * await toast.errorRedirect({
         *  to: "/dashboard",
         *  message: "This is an error message",
         * });
         * ```
         */
        errorRedirect: async (options) => {
            const { message, to } = options;
            return toastRedirect("error", message, to);
        },
        /**
         * -------------------------------
         * infoRedirect
         * -------------------------------
         * Adds a flash toast object to the toast session with type `info` and the specified message
         * committing the session object to the storage and redirecting to the specified URL
         * @param options
         * @param options.message - string - The message to display
         * @param options.redirectTo - string - The URL to redirect to after displaying the toast
         * @returns - Promise<Response> - The response object that will redirect to the specified URL
         * @example
         * ```ts
         * await toast.info({
         * message: "This is an info message",
         * redirectTo: "/dashboard",
         * });
         * ```
         * */
        infoRedirect: async (options) => {
            const { message, to } = options;
            return toastRedirect("info", message, to);
        },
        /**
         * -------------------------------
         * warningRedirect
         * -------------------------------
         * Adds a flash toast object to the toast session with type `warning` and the specified message
         * committing the session object to the storage and redirecting to the specified URL
         * @param options
         * @param options.message - string - The message to display
         * @param options.redirectTo - string - The URL to redirect to after displaying the toast
         * @returns - Promise<Response> - The response object that will redirect to the specified URL
         * @example
         * ```ts
         * await toast.warninRedirect({
         *  to: "/dashboard",
         *  message: "This is a warning message",
         * });
         */
        warningRedirect: async (options) => {
            const { message, to } = options;
            return toastRedirect("warning", message, to);
        },
        /**
         * -------------------------------
         * success
         * -------------------------------
         * Adds a flash toast object to the toast session with type `success` and the specified message
         * @param message - string - The message to display
         * @returns - Promise<Headers> - The headers object with the "Set-Cookie" property
         * @example
         * ```ts
         * export async function action({params}: ActionFunctionArgs) {
         *   await deletePost(params.id);
         *   const headers = await toast.success("Post deleted successfully");
         *   return json({ message: "Success" }, { headers });
         * }
         */
        success: async (message) => {
            return toast("success", message);
        },
        /**
         * -------------------------------
         * error
         * -------------------------------
         * Adds a flash toast object to the toast session with type `error` and the specified message
         * @param message - string - The message to display
         * @returns - Promise<Headers> - The headers object with the "Set-Cookie" property
         * @example
         * ```ts
         * export async function action({params}: ActionFunctionArgs) {
         *   try {
         *     await deletePost(params.id);
         *     const headers = await toast.success("Post deleted successfully");
         *     return json({ message: "Success" }, { headers });
         *   } catch (error) {
         *     const headers = await toast.error("An error occurred while deleting the post");
         *     return json({ message: "Error" }, { headers });
         *   }
         * }
         */
        error: async (message) => {
            return toast("error", message);
        },
        /**
         * -------------------------------
         * info
         * -------------------------------
         * Adds a flash toast object to the toast session with type `info` and the specified message
         * @param message - string - The message to display
         * @returns - Promise<{"Set-Cookie": }> - The headers object with the "Set-Cookie" property
         * @example
         * ```ts
         * export async function action({params}: ActionFunctionArgs) {
         *   await deletePost(params.id);
         *   const headers = await toast.info("Some info message");
         *   return json({ message: "Success" }, { headers });
         * }
         */
        info: async (message) => {
            return toast("info", message);
        },
        /**
         * -------------------------------
         * warning
         * -------------------------------
         * Adds a flash toast object to the toast session with type `warning` and the specified message
         * @param message - string - The message to display
         * @returns - Promise<Headers> - The headers object with the "Set-Cookie" property
         * @example
         * ```ts
         * export async function action({params}: ActionFunctionArgs) {
         *   await deletePost(params.id);
         *   const headers = await toast.warning("Some warning message");
         *   return json({ message: "Success" }, { headers });
         * }
         */
        warning: async (message) => {
            return toast("warning", message);
        },
        /**
         * -------------------------------
         * getToastSession
         * -------------------------------
         * Get the toast session object. When you call this function, it will return the session object
         * It's your responsibility to extract the toast data from the session object and commit
         * the session object back to the storage.
         * @param request
         * @returns - Promise<Session> - The session object
         * @example
         *
         * ```ts
         * async function loader({ request }: LoaderFunctionArgs) {
         *    const session = await toast.getToastSession(request);
         *    const toastData = session.get("breeze_toast");
         *    return json({ toastData }, {
         *     headers: {
         *      "Set-Cookie": await toastSessionStorage.commitSession(session),
         *     },
         *    });
         * }
         * ```
         */
        getToastSession: async (request) => {
            const cookieHeader = request.headers.get("Cookie");
            const session = await toastSessionStorage.getSession(cookieHeader);
            return session;
        },
        /**
         * -------------------------------
         * getData
         * -------------------------------
         * Get the toast data from the session storage and commit the session object back to the storage
         * @param request
         * @returns - Promise<{toastData: {type: "success" | "error" | "info" | "warning"; message: string;}; headers: Headers}> - An object containing the toast data and the headers object
         * @example
         * ```ts
         * async function loader({ request }: LoaderFunctionArgs) {
         *   const { toastData, headers } = await toast.getData(request);
         *   return json({ toastData }, { headers });
         * }
         */
        getData: async (request) => {
            const cookieHeader = request.headers.get("Cookie");
            const session = await toastSessionStorage.getSession(cookieHeader);
            const toastData = session.get("breeze_toast");
            const headers = {
                "Set-Cookie": await toastSessionStorage.commitSession(session),
            };
            return { toastData, headers };
        },
        /**
         * -------------------------------
         * getWithJson
         * -------------------------------
         * Get the toast and add additional data to the response object. This function is useful when you want to add
         * additional data to the response object before sending it to the client.
         * @param request
         * @param data - An object containing the additional data to add to the response object
         * @returns - Promise<Response> - The response object with the "toastData" property and the additional data
         * @example
         * ```ts
         * async function loader({ request }: LoaderFunctionArgs) {
         *    return toast.withAdditionalData(request, { message: "Hello World" });
         * }
         * ```
         */
        getWithJson: async (request, data) => {
            const cookieHeader = request.headers.get("Cookie");
            const session = await toastSessionStorage.getSession(cookieHeader);
            const toastData = session.get("breeze_toast");
            return (0, node_1.json)({ ...data, toastData }, {
                headers: {
                    "Set-Cookie": await toastSessionStorage.commitSession(session),
                },
            });
        },
    };
}
exports.createBreezeToast = createBreezeToast;
