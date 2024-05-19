"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBreezeAuth = void 0;
const node_1 = require("@remix-run/node");
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
function createBreezeAuth(breezeAuthOptions) {
    let sessionStorage;
    if ("sessionStorage" in breezeAuthOptions) {
        sessionStorage = breezeAuthOptions.sessionStorage;
    }
    else {
        const cookieSecret = breezeAuthOptions.cookie.secret;
        if (!cookieSecret) {
            throw new Error("BreezeAuth: cookieSecret is required");
        }
        const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
        const defaultCookieMaxAge = breezeAuthOptions.cookie.maxAge || thirtyDaysInSeconds;
        sessionStorage = (0, node_1.createCookieSessionStorage)({
            cookie: {
                name: "__breeze-auth-session__",
                secrets: [cookieSecret],
                maxAge: breezeAuthOptions.cookie.maxAge || defaultCookieMaxAge,
                httpOnly: breezeAuthOptions.cookie.httpOnly || true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
            },
        });
    }
    const dbAdapter = breezeAuthOptions.databaseAdapter;
    const providers = [];
    /**
     * -----------------------------------------
     * validateEmail
     * -----------------------------------------
     * Basic email validation. Checks if at least one character is before and after the "@" symbol
     * and if there is at least one character before and after the "." symbol.
     * @param email - The email address to validate
     * @returns A boolean indicating whether the email address is valid
     */
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    return {
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
        sessionStorage,
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
        use(provider) {
            providers.push(provider);
        },
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
        async logout(request, options) {
            const session = await this.getSession(request);
            return (0, node_1.redirect)(options.redirectTo, {
                headers: {
                    "Set-Cookie": await sessionStorage.destroySession(session),
                },
            });
        },
        /**
         * -----------------------------------------
         * getSession
         * -----------------------------------------
         * Parse the authentication session from the request cookie
         * @param request - The request object
         * @returns The session object
         */
        async getSession(request) {
            const cookieHeader = request.headers.get("Cookie");
            return sessionStorage.getSession(cookieHeader);
        },
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
        async registerUser(request, options = {}) {
            const providerConfig = providers.find((provider) => provider.type === "credentials");
            if (!providerConfig) {
                throw new Error(`BreezeAuth: No credentials provider found in the configuration`);
            }
            const registration = await dbAdapter.registerUser(request);
            if (!options.authenticateAndRedirectTo)
                return registration;
            if (registration.error) {
                return (0, node_1.json)({
                    user: null,
                    error: {
                        message: registration.error.message,
                        code: registration.error.code,
                    },
                });
            }
            const session = await this.getSession(request);
            session.set("user", registration.user);
            session.set("metadata", { userAgent: String(request.headers.get("User-Agent")) });
            return (0, node_1.redirect)(options.authenticateAndRedirectTo, {
                headers: await this.getCommittedSessionHeaders(session),
            });
        },
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
        async updateSession(request, options) {
            const session = await this.getSession(request);
            if (!session.get("user")) {
                throw new Error("BreezeAuth: User is not authenticated. Cannot update session.");
            }
            session.set("user", options.data.user);
            sessionStorage.commitSession(session);
            if (options.redirectTo) {
                return (0, node_1.redirect)(options.redirectTo, {
                    headers: await this.getCommittedSessionHeaders(session),
                });
            }
            return session;
        },
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
        async requireRole(request, role, options) {
            const sessionUser = await this.getUserFromSession(request);
            if (!sessionUser || !sessionUser.roles.includes(role)) {
                throw (0, node_1.redirect)(options.redirectTo);
            }
            return sessionUser;
        },
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
        async requireAuth(request, options) {
            const session = await this.getSession(request);
            const sessionUser = session.get("user");
            if (!sessionUser) {
                throw (0, node_1.redirect)(options.ifNotAuthenticatedRedirectTo, {
                    headers: {
                        "Set-Cookie": await sessionStorage.destroySession(session),
                    },
                });
            }
            if (options.withRoles?.length) {
                for (const role of options.withRoles) {
                    await this.requireRole(request, role, {
                        redirectTo: options.ifNotAuthorizedRedirectTo || "/",
                    });
                }
            }
            return session;
        },
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
        async resetPassword(request, options) {
            const providerConfig = providers.find((provider) => provider.type === "credentials");
            if (!providerConfig) {
                throw new Error(`BreezeAuth: No credentials provider found in the configuration`);
            }
            const formData = await request.formData();
            const formEntries = Object.fromEntries(formData.entries());
            const data = {
                token: String(formEntries.token || ""),
                newPassword: String(formEntries.newPassword || ""),
                confirmNewPassword: String(formEntries.confirmPassword || ""),
            };
            for (const [key, value] of Object.entries(data)) {
                if (!value.trim()) {
                    return {
                        data: null,
                        error: {
                            message: `${key} is required`,
                            code: `${key}_required`,
                        },
                    };
                }
            }
            const tokenValidation = await this.validatePasswordResetToken(data.token);
            if (tokenValidation.error) {
                return {
                    data: null,
                    error: {
                        message: tokenValidation.error.message,
                        code: tokenValidation.error.code,
                    },
                };
            }
            if (!data.newPassword?.trim()) {
                return {
                    data: null,
                    error: {
                        message: "New Password is required",
                        code: "password_required",
                    },
                };
            }
            if (data.newPassword !== data.confirmNewPassword) {
                return {
                    data: null,
                    error: {
                        message: "Passwords do not match",
                        code: "passwords_do_not_match",
                    },
                };
            }
            const resetPasswordResult = await dbAdapter.resetUserPassword({
                token: data.token,
                newPassword: data.newPassword,
            });
            if (resetPasswordResult.error) {
                return {
                    data: null,
                    error: {
                        message: resetPasswordResult.error.message,
                        code: resetPasswordResult.error.code,
                    },
                };
            }
            await dbAdapter.deletePasswordResetToken(data.token);
            const requestUrl = new URL(request.url);
            const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
            const redirectTo = new URL(options.onSuccessRedirectTo, baseUrl);
            redirectTo.searchParams.set("email", encodeURIComponent(resetPasswordResult.user.email));
            return (0, node_1.redirect)(redirectTo.toString());
        },
        /**
         * -----------------------------------------
         * changePassword
         * -----------------------------------------
         * Change the user's password
         * @param userId - The user's ID
         * @param currentPassword - The user's current password
         * @param newPassword - The user's new password
         * @returns An object with the error message and code if an error occurs. Otherwise, the user's data will be returned.
         * @example
         * ```ts
         * const {user, error} = await auth.changePassword({
         *  userId: 1,
         *  currentPassword: "currentPassword",
         *  newPassword: "newPassword",
         * });
         * ```
         */
        async changePassword({ userId, currentPassword, newPassword, }) {
            const providerConfig = providers.find((provider) => provider.type === "credentials");
            if (!providerConfig) {
                throw new Error(`BreezeAuth: No credentials provider found in the configuration`);
            }
            return dbAdapter.changeUserPassword({ userId, currentPassword, newPassword });
        },
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
        async requireAllRoles(request, roles, options) {
            const sessionUser = await this.getUserFromSession(request);
            if (!sessionUser || !roles.every((role) => sessionUser.roles.includes(role))) {
                throw (0, node_1.redirect)(options.redirectTo);
            }
            return sessionUser;
        },
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
        async requireSomeRoles(request, roles, options) {
            const sessionUser = await this.getUserFromSession(request);
            if (!sessionUser || !roles.some((role) => sessionUser.roles.includes(role))) {
                throw (0, node_1.redirect)(options.redirectTo);
            }
            return sessionUser;
        },
        /**
         * -----------------------------------------
         * getUserFromSession
         * -----------------------------------------
         * Get the user from the session
         * @param request - The request object
         */
        async getUserFromSession(request) {
            const session = await this.getSession(request);
            return session.get("user");
        },
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
        async sendPasswordResetLink(request, options) {
            const providerConfig = providers.find((provider) => provider.type === "credentials");
            if (!providerConfig) {
                throw new Error(`BreezeAuth: No credentials provider found in the configuration`);
            }
            const formData = await request.formData();
            const formEntries = Object.fromEntries(formData.entries());
            const email = formEntries.email;
            const isValidEmail = validateEmail(email);
            if (!email.trim()) {
                return {
                    error: {
                        message: "Email is required",
                        code: "email_required",
                    },
                };
            }
            if (!isValidEmail) {
                return {
                    error: {
                        message: "Invalid email address",
                        code: "invalid_email",
                    },
                };
            }
            const normalizedEmail = email.trim().toLowerCase();
            const getUserResult = await dbAdapter.getUserByEmail(normalizedEmail);
            if (getUserResult.error) {
                return {
                    error: {
                        message: "User not found",
                        code: "user_not_found",
                    },
                };
            }
            const user = getUserResult.user;
            const { sendResetPasswordEmail, resetPasswordPageUrl } = providerConfig;
            if (!resetPasswordPageUrl || !sendResetPasswordEmail) {
                throw new Error(`BreezeAuth: "resetPasswordPageUrl" and "sendResetPasswordEmail" are required in the credentials provider configuration to be able to use the sendPasswordResetLink function.`);
            }
            const generateTokenResult = await dbAdapter.generatePasswordResetToken(user.email, {
                expiresAfterMinutes: options?.expireLinkAfterMinutes,
            });
            if (generateTokenResult.error) {
                return (0, node_1.json)({
                    error: {
                        message: generateTokenResult.error.message,
                        code: generateTokenResult.error.code,
                    },
                });
            }
            const resetToken = generateTokenResult.token;
            const uriEncodedEmail = encodeURIComponent(email);
            const resetLink = `${resetPasswordPageUrl}?token=${resetToken}&email=${uriEncodedEmail}`;
            const sendMailResult = await sendResetPasswordEmail({
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
                resetLink,
            });
            if (sendMailResult.error) {
                return (0, node_1.json)({
                    error: {
                        message: sendMailResult.error.message,
                        code: sendMailResult.error.code,
                    },
                });
            }
            const requestUrl = new URL(request.url);
            const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
            const redirectTo = new URL(options.onSuccessRedirectTo, baseUrl);
            redirectTo.searchParams.set("email", encodeURIComponent(email));
            return (0, node_1.redirect)(redirectTo.toString());
        },
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
        async redirectIfAuthenticated(request, options) {
            const session = await this.getSession(request);
            const isAuthenticated = session.get("user");
            if (isAuthenticated)
                throw (0, node_1.redirect)(options.to);
            return session;
        },
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
        async generatePasswordResetToken(email, options) {
            const providerConfig = providers.find((provider) => provider.type === "credentials");
            if (!providerConfig) {
                throw new Error(`BreezeAuth: No credentials provider found in the configuration`);
            }
            const user = await dbAdapter.getUserByEmail(email);
            if (user.error) {
                return {
                    token: null,
                    error: {
                        message: user.error.message,
                        code: user.error.code,
                    },
                };
            }
            const generateTokenResult = await dbAdapter.generatePasswordResetToken(email, {
                expiresAfterMinutes: options.expiresAfterMinutes,
            });
            return generateTokenResult;
        },
        /**
         * -----------------------------------------
         * validatePasswordResetToken
         * -----------------------------------------
         * Validate a password reset token
         * @param token - The password reset token
         * @returns An object with tokenData and error properties. If an error occurs,
         * the error property will contain the error message and code.
         */
        async validatePasswordResetToken(token) {
            const providerConfig = providers.find((provider) => provider.type === "credentials");
            if (!providerConfig) {
                throw new Error(`BreezeAuth: No credentials provider found in the configuration`);
            }
            return dbAdapter.validatePasswordResetToken(token);
        },
        /**
         * -----------------------------------------
         * getCommittedSessionHeaders
         * -----------------------------------------
         * This function commits the session and returns the Set-Cookie header
         * to be used in the HTTP response.
         */
        async getCommittedSessionHeaders(session) {
            return {
                "Set-Cookie": await sessionStorage.commitSession(session),
            };
        },
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
        async authenticateWithCredentials(request, options) {
            const providerConfig = providers.find((provider) => provider.type === "credentials");
            if (!providerConfig) {
                throw new Error(`BreezeAuth: No credentials provider found in the configuration`);
            }
            const formData = await request.formData();
            const formEntries = Object.fromEntries(formData.entries());
            const credentials = {
                email: formEntries.email,
                password: formEntries.password,
            };
            if (!validateEmail(credentials.email)) {
                return (0, node_1.json)({
                    error: {
                        message: "Invalid email address",
                        code: "invalid_email",
                    },
                });
            }
            for (const [key, value] of Object.entries(credentials)) {
                if (!value.trim()) {
                    return (0, node_1.json)({
                        error: {
                            message: `${key} is required`,
                            code: `${key}_required`,
                        },
                    });
                }
            }
            const { user, error } = await dbAdapter.loginUser(credentials);
            if (error) {
                return (0, node_1.json)({
                    error: {
                        message: error.message,
                        code: error.code,
                    },
                });
            }
            const session = await this.getSession(request);
            session.set("user", user);
            session.set("metadata", { userAgent: String(request.headers.get("User-Agent")) });
            return (0, node_1.redirect)(options.redirectTo, {
                headers: await this.getCommittedSessionHeaders(session),
            });
        },
    };
}
exports.createBreezeAuth = createBreezeAuth;
