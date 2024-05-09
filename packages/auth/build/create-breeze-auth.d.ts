import { SessionStorage } from "@remix-run/node";
import { BreezeAuthSessionUser, BreezeAuthProvider, BreezeAuthSessionFlashData, ExtendedBreezeAuthSessionUser, RequireAuthOptions, RequireRoleOptions, CreateBreezeAuthOptions, CreateBreezeAuthWithCustomSessionStorageOptions } from "./types";
/**
 * -----------------------------------------
 * createBreezeAuth
 * -----------------------------------------
 * Create a new BreezeAuth instance
 * @param breezeAuthOptions - The options object
 * @example
 * ```ts
 * import { createBreezeAuth } from "./breeze-auth";
 * import { PrismaAdapter } from "./breeze-auth/adapters/prisma-adapter";
 * import { prisma } from "prisma/client";
 *
 * const auth = createBreezeAuth({
 *   databaseAdapter: PrismaAdapter(prisma),
 *   cookie: {
 *     name: "__breeze-auth-session__",
 *     secret: process.env.COOKIE_SECRET,
 *     maxAge: 30 * 24 * 60 * 60, // 30 days
 *   },
 * });
 * ```
 */
export declare function createBreezeAuth<T extends BreezeAuthSessionUser>(breezeAuthOptions: CreateBreezeAuthOptions<T> | CreateBreezeAuthWithCustomSessionStorageOptions<T>): {
    /**
     * -----------------------------------------
     * sessionStorage
     * -----------------------------------------
     * The session storage instance with methods: getSession, commitSession, and destroySession
     * @example
     * ```ts
     * // Get the session
     * const session = await auth.sessionStorage.getSession(request);
     *
     * // set some data in the session
     * session.set("user", { id: 1, email: "test@email.com" });
     *
     * // Commit the session
     * await auth.sessionStorage.commitSession(session);
     *
     * // Destroy the session
     * await auth.sessionStorage.destroySession(session);
     * ```
     */
    sessionStorage: SessionStorage<{
        user: ExtendedBreezeAuthSessionUser<T>;
        metadata: object;
    }, BreezeAuthSessionFlashData>;
    /**
     * -----------------------------------------
     * use
     * -----------------------------------------
     * Register an authentication provider for BreezeAuth to use
     * @param provider - The authentication provider to use
     * @example
     * ```ts
     * auth.use({
     *  type: "credentials",
     *  resetPasswordPageUrl: "/auth/reset-password",
     *  sendResetPasswordEmail: async ({ user, resetLink }) => {
     *   const { error } = await sendTransactionalEmail({
     *    to: user.email,
     *    subject: "Password Reset Link",
     *    html: `
     *     <h1>Your password reset link</h1>
     *     <p>Click the link below to reset your password</p>
     *     <a href="${process.env.APP_BASE_URL}${resetLink}">Reset Password</a>
     *    `,
     *   });
     *
     *  return {
     *   error: Boolean(error),
     *   message: "Error sending email. Please try again",
     *  };
     * });
     * ```
     */
    use(provider: BreezeAuthProvider): void;
    /**
     * -----------------------------------------
     * signout
     * -----------------------------------------
     * Log out a user and redirect them to the signin page or the provided redirect URL.
     * This function clears the "__breeze-auth-session__" cookie data.
     * @param request - The request object
     * @param options - The options object
     * @param options.redirectTo - The URL to redirect the user to after logout
     * @returns The HTTP response object with the Set-Cookie header to clear the session cookie data.
     * @example
     * ```ts
     * await auth.logout(request, { redirectTo: "/auth/login" });
     * ```
     */
    logout(request: Request, options: {
        redirectTo: string;
    }): Promise<import("@remix-run/node").TypedResponse<never>>;
    /**
     * -----------------------------------------
     * getSession
     * -----------------------------------------
     * Parse the authentication session from the request cookie
     * @param request - The request object
     * @returns The session object
     */
    getSession(request: Request): Promise<import("@remix-run/node").Session<{
        user: ExtendedBreezeAuthSessionUser<T>;
        metadata: object;
    }, BreezeAuthSessionFlashData>>;
    /**
     * -----------------------------------------
     * registerUser
     * -----------------------------------------
     * Register a new user and returns an object with `user` and `error` properties.
     * If the registration is successful, the `user` property will contain the user data.
     * If the registration fails, the `error` property will contain the error message and code.
     * If the `authenticateAndRedirectTo` option is provided, the user will be authenticated and
     * redirected to the provided URL.
     * @param request - The request object
     * @param options - The options object
     * @param options.authenticateAndRedirectTo - [optional] The URL to redirect the user to after registration and authentication
     * @returns The user object if the registration is successful. Otherwise, an object with the error message and code.
     */
    registerUser(request: Request, options?: {
        authenticateAndRedirectTo?: string;
    }): Promise<import("./types").UserDataError | import("./types").UserDataSuccess<T> | import("@remix-run/node").TypedResponse<{
        user: null;
        error: {
            message: string;
            code: string;
        };
    }>>;
    /**
     * -----------------------------------------
     * updateSession
     * -----------------------------------------
     * Update the session with the provided data and redirect the user to the provided URL.
     * If a redirect URL is provided, the session will be commited and user will be redirected to the URL.
     * If no redirect URL is provided, the session will be returned and it's up to the caller to commit the session.
     *
     * @param request - The request object
     * @param options - The options object
     * @param options.data - The session data to update
     * @param options.redirectTo - The URL to redirect the user to
     * @returns The HTTP response object if a redirect URL is provided, otherwise the session object
     *
     * @example
     * ```ts
     * await auth.updateSession(request, {
     *  data: {
     *     user: {
     *        id: 1,
     *        email: "user@email.com",
     *        roles: ["user"],
     *     },
     *  },
     *  redirectTo: "/account",
     * });
     */
    updateSession(request: Request, options: {
        data: {
            user: ExtendedBreezeAuthSessionUser<T>;
        };
        redirectTo?: string;
    }): Promise<import("@remix-run/node").Session<{
        user: ExtendedBreezeAuthSessionUser<T>;
        metadata: object;
    }, BreezeAuthSessionFlashData> | import("@remix-run/node").TypedResponse<never>>;
    /**
     * -----------------------------------------
     * requireRole
     * -----------------------------------------
     * Require a specific role to access a page. If the user does not have the required role,
     * he will be redirected to the provided "redirectTo" option.
     * @param request - The request object
     * @param role - The role to require
     * @param options - The options object
     * @param options.redirectTo - The URL to redirect the user to if they do not have the required role
     * @returns The user object if the user has the required role. Otherwise, redirects the user to the provided URL.
     * @example
     * Require the "admin" role and redirect to the default "/auth/unauthorized" if the user does not have the role.
     * ```ts
     * await auth.requireRole(request, "admin", { redirectTo: "/auth/unauthorized" });
     * ```
     */
    requireRole(request: Request, role: string, options: RequireRoleOptions): Promise<ExtendedBreezeAuthSessionUser<T>>;
    /**
     * -----------------------------------------
     * requireAuth
     * -----------------------------------------
     * Require authentication to access a page. If the user is not authenticated,
     * he will be redirected to the signin or the provided redirectTo option.
     * otherwise, the session will be returned.
     *
     * Optionally, you can require specific roles to access the page.
     * If the user does not have the required role, he will be redirected to the unauthorizedredirectTo option.
     *
     * @param request - The request object
     * @param options - The options object
     * @param options.ifNotAuthenticatedRedirectTo - [required] The URL to redirect the user to if they are not authenticated
     * @param options.roles - [optional] The roles required to access the page. By default any authenticated user can access any page.
     * @param options.ifNotAuthorizedRedirectTo - [optional] The URL to redirect the user to if they do not have the required role default to "/" if not provided
     * @returns The session if the user is authenticated. Otherwise, redirects the user to the provided URL.
     * @example
     *
     * Require authentication and redirect to the default "/auth/login" if the user is not authenticated.
     * ```ts
     * const session = await auth.requireAuth(request, { redirectTo: "/auth/login" });
     * const user = session.get("user");
     * ```
     *
     * Require authentication and the "admin" role, and redirect to "/auth/unauthorized" if the user does not have the required role.
     * ```ts
     * await auth.requireAuth(request, {
     *    roles: ["admin"]
     *    redirectTo: "/auth/login",
     *    unauthorizedredirectTo: "/auth/unauthorized",
     * });
     * ```
     */
    requireAuth(request: Request, options: RequireAuthOptions): Promise<import("@remix-run/node").Session<{
        user: ExtendedBreezeAuthSessionUser<T>;
        metadata: object;
    }, BreezeAuthSessionFlashData>>;
    /**
     * -----------------------------------------
     * resetPassword
     * -----------------------------------------
     * Reset the user's password and redirect them to the reset password success page
     * @param request - The request object. Should contain the form data with the "token", "newPassword" and "confirmNewPassword" fields
     * @param options - The options object
     * @param options.onSuccessRedirectTo - The URL to redirect the user to after the password has been reset
     * @returns The HTTP response object with the redirect URL to the reset password success page
     * @example
     * ```ts
     * await auth.resetPassword(request, {
     *  onSuccessRedirectTo: "/auth/reset-password-success",
     * });
     * ```
     */
    resetPassword(request: Request, options: {
        onSuccessRedirectTo: string;
    }): Promise<import("@remix-run/node").TypedResponse<never> | {
        data: null;
        error: {
            message: string;
            code: string;
        };
    }>;
    /**
     * -----------------------------------------
     * requireAllRoles
     * -----------------------------------------
     * Require all the specified roles to access a page. If the user does not have all the required roles,
     * he will be redirected to the provided "redirectTo" option.
     * @param request - The request object
     * @param roles - The roles to require
     * @param options - The options object
     * @param options.redirectTo - The URL to redirect the user to if they do not have the required roles
     * @returns The user object if the user has all the required roles. Otherwise, redirects the user to the provided URL.
     * @example
     * Require the "admin" and "editor" roles and redirect to "/auth/unauthorized" if the user does not have the roles.
     * ```ts
     * await auth.requireAllRoles(request, ["admin", "editor"], { redirectTo: "/auth/unauthorized" });
     * ```
     */
    requireAllRoles(request: Request, roles: string[], options: RequireRoleOptions): Promise<ExtendedBreezeAuthSessionUser<T>>;
    /**
     * -----------------------------------------
     * requireSomeRoles
     * -----------------------------------------
     * Require at least one of the specified roles to access a page. If the user does not have any of the required roles,
     * he will be redirected to the provided "redirectTo" option.
     * @param request - The request object
     * @param roles - The roles to require
     * @param options - The options object
     * @param options.redirectTo - The URL to redirect the user to if they do not have the required roles
     * @returns The user object if the user has at least one of the required roles. Otherwise, redirects the user to the provided URL.
     * @example
     * Require the "admin" or "editor" roles and redirect to "/auth/unauthorized" if the user does not have any of the roles.
     * ```ts
     * await auth.requireSomeRoles(request, ["admin", "editor"], { redirectTo: "/auth/unauthorized" });
     * ```
     */
    requireSomeRoles(request: Request, roles: string[], options: RequireRoleOptions): Promise<ExtendedBreezeAuthSessionUser<T>>;
    /**
     * -----------------------------------------
     * getUserFromSession
     * -----------------------------------------
     * Get the user from the session
     * @param request - The request object
     */
    getUserFromSession(request: Request): Promise<ExtendedBreezeAuthSessionUser<T> | undefined>;
    /**
     * -----------------------------------------
     * sendPasswordResetLink
     * -----------------------------------------
     * Send a password reset link to the user's email. The user will be redirected to the provided "onSuccessRedirectTo" URL
     * after the password reset link has been sent. If an error occurs, an error object will be returned with the error message and code.
     * @param request - The request object. Should contain the "email" address in the request's form data.
     * @param options - The options object
     * @param options.expireLinkAfterMinutes - The number of minutes after which the password reset link will expire
     * @param options.onSuccessRedirectTo - The URL to redirect the user to after the password reset link has been sent. The email address will be appended to the URL as a query parameter.
     * @returns - An object with the error message and code if an error occurs. Otherwise, the user will be redirected to the provided URL.
     *
     * Make sure to configure the "sendResetPasswordEmail" && "resetPasswordPageUrl" in the credentials provider configuration
     * to be able to use the sendPasswordResetLink function.
     *
     * @example
     * In your credentials provider configuration:
     * ```ts
     * auth.use({
     * type: "credentials",
     * resetPasswordPageUrl: "/auth/reset-password",
     * sendResetPasswordEmail: async ({ user, resetLink }) => {
     *  const { error } = await sendTransactionalEmail({
     *   to: user.email,
     *  subject: "Password Reset Link",
     * html: `
     * <h1>Your password reset link</h1>
     * <p>Click the link below to reset your password</p>
     * <a href="${resetLink}">Reset Password</a>
     * `,
     * });
     *
     * if (error) {
     *   return {
     *     error: {
     *       message: "Error sending email. Please try again",
     *       code: "send_password_reset_email_error",
     *     },
     *  };
     *
     *  return { error: null };
     * });
     * ```
     *
     * Then in your route you can use the sendPasswordResetLink function like this:
     *
     * ```ts
     * import auth from "~/auth.server";
     *
     * export const action = async ({ request }) => {
     *   return auth.sendPasswordResetLink(request, {
     *     onSuccessRedirectTo: "/auth/reset-password-email-sent",
     *     expireLinkAfterMinutes: 15,
     *   });
     * };
     */
    sendPasswordResetLink(request: Request, options: {
        onSuccessRedirectTo: string;
        expireLinkAfterMinutes: number;
    }): Promise<import("@remix-run/node").TypedResponse<{
        error: {
            message: string;
            code: string;
        };
    }> | {
        error: {
            message: string;
            code: string;
        };
    }>;
    /**
     * -----------------------------------------
     * redirectIfAuthenticated
     * -----------------------------------------
     * Redirects the user to the provided URL if they are authenticated.
     * Otherwise, returns the session.
     * @param request - The request object
     * @param options - The options object
     * @param options.to - The URL to redirect the user to if they are authenticated
     * @returns The session object if the user is not authenticated. Otherwise, redirects the user to the provided URL.
     * @example
     * ```ts
     * await auth.redirectIfAuthenticated(request, {
     *   to: "/dashboard",
     * });
     * ```
     */
    redirectIfAuthenticated(request: Request, options: {
        to: string;
    }): Promise<import("@remix-run/node").Session<{
        user: ExtendedBreezeAuthSessionUser<T>;
        metadata: object;
    }, BreezeAuthSessionFlashData>>;
    /**
     * -----------------------------------------
     * generatePasswordResetToken
     * -----------------------------------------
     * Generate a password reset token for the user
     * @param email - The user's email address
     * @param options - The options object
     * @param options.expiresAfterMinutes - After how many minutes the token should expire
     * @returns An object containing the token or an error object with a message and code if an error occurred
     * @example
     * ```ts
     * const generateTokenResult = await dbAdapter.generatePasswordResetToken("email@example.com",{
     *   expiresAfterMinutes: 15,
     * });
     * ```
     */
    generatePasswordResetToken(email: string, options: {
        expiresAfterMinutes: number;
    }): Promise<import("./types").TokenDataSuccess | import("./types").TokenDataError>;
    /**
     * -----------------------------------------
     * validatePasswordResetToken
     * -----------------------------------------
     * Validate a password reset token
     * @param token - The password reset token
     * @returns An object with tokenData and error properties. If an error occurs,
     * the error property will contain the error message and code.
     */
    validatePasswordResetToken(token: string): Promise<import("./types").TokenValidationSuccess | import("./types").TokenValidationError>;
    /**
     * -----------------------------------------
     * getCommittedSessionHeaders
     * -----------------------------------------
     * This function commits the session and returns the Set-Cookie header
     * to be used in the HTTP response.
     */
    getCommittedSessionHeaders(session: Awaited<ReturnType<typeof this.getSession>>): Promise<{
        "Set-Cookie": string;
    }>;
    /**
     * -----------------------------------------
     * authenticateWithCredentials
     * -----------------------------------------
     * Authenticate a user with their email and password and redirect them to the provided redirectTo URL.
     * If the authentication fails, an error object will be returned with the error message and code.
     * @param request - The request object. Should contain the "email" and "password" fields in the request's form data.
     * @param options - The options object
     * @param options.redirectTo - The URL to redirect the user to after authentication
     */
    authenticateWithCredentials(request: Request, options: {
        redirectTo: string;
    }): Promise<import("@remix-run/node").TypedResponse<{
        error: {
            message: string;
            code: string;
        };
    }>>;
};
