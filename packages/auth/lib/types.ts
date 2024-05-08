import { SessionStorage } from "@remix-run/node";

export interface BreezeAuthUser {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  emailVerified: boolean;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
}

export type BreezeAuthSessionUser = Omit<BreezeAuthUser, "password" | "createdAt" | "updatedAt">;

export type ExtendedBreezeAuthSessionUser<T = object> = BreezeAuthSessionUser & T;

export interface BreezeAuthSessionFlashData {
  error: {
    message: string;
    code: string;
  };
}

export interface CreateBreezeAuthOptions<T> {
  /**
   * The database adapter to use for BreezeAuth to interact with the database
   * @example
   * ```ts
   * import { PrismaAdapter } from "./breeze-auth/adapters/prisma-adapter";
   * import { prisma } from "prisma/client";
   *
   * const auth = createBreezeAuth({
   *   databaseAdapter: PrismaAdapter(prisma),
   *   // other options
   * });
   * ```
   */
  databaseAdapter: DatabaseAdapter<T>;
  /**
   * The cookie configuration for the session
   * @example
   * ```ts
   * const auth = createBreezeAuth({
   *   cookie: {
   *     name: "__breeze-auth-session__",
   *     secret: process.env.COOKIE_SECRET,
   *     maxAge: 30 * 24 * 60 * 60, // 30 days
   *   },
   *  // other options
   * });
   * ```
   */
  cookie: {
    name: string;
    secret: string;
    maxAge: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
  };
}

export interface CreateBreezeAuthWithCustomSessionStorageOptions<T> {
  /**
   * The database adapter to use for BreezeAuth to interact with the database
   * @example
   * ```ts
   * import { PrismaAdapter } from "./breeze-auth/adapters/prisma-adapter";
   * import { prisma } from "prisma/client";
   *
   * const auth = createBreezeAuth({
   *   databaseAdapter: PrismaAdapter(prisma),
   *   // other options
   * });
   * ```
   */
  databaseAdapter: DatabaseAdapter<T>;
  /**
   * A custom session storage to use for BreezeAuth if you want to use a different session storage
   * other than the default cookie session storage.
   * @example
   * ```ts
   * import { createDatabaseSessionStorage } from "./breeze-auth/session-storage";
   *
   * const auth = createBreezeAuth({
   *   databaseAdapter: PrismaAdapter(prisma),
   *   sessionStorage: createDatabaseSessionStorage({
   *     cookie: {
   *       name: "__session",
   *       maxAge: 30 * 24 * 60 * 60,
   *       httpOnly: true,
   *       sameSite: "lax",
   *       secure: process.env.NODE_ENV === "production",
   *     },
   *   }),
   * });
   * ```
   */
  sessionStorage: SessionStorage<
    { user: ExtendedBreezeAuthSessionUser<T> },
    BreezeAuthSessionFlashData
  >;
}

export type RequireAuthOptions = {
  /**
   * The URL to redirect to if the user is not authenticated
   * Example: /auth/login
   */
  ifNotAuthenticatedRedirectTo: string;
  /**
   * The roles required to access the page
   * By default, any authenticated user can access the page
   */
  withRoles?: string[];
  /**
   * The URL to redirect to if the user is authenticated but not authorized to access the page
   * Example: /auth/unauthorized
   */
  ifNotAuthorizedRedirectTo?: string;
};

export interface RequireRoleOptions {
  /**
   * The URL to redirect to if the user does not have the required role to access the page
   * Default: /auth/unauthorized
   */
  redirectTo: string;
}

export interface BreezeAuthProvider {
  /**
   * The type of the authentication provider.
   * Example: "credentials"
   */
  type: "credentials";
  /**
   * The URL to your password reset page. This is used to redirect the user to the password reset page
   * when they click the reset password link in the password reset email.
   *
   * Example: /auth/reset-password
   */
  resetPasswordPageUrl?: string;
  /**
   * A function that sends a password reset email to the user.
   * @param options - The options object containing the user's email and the password reset link.
   * @param options.user - The user object containing the user's id and email.
   * @param options.resetLink - The password reset link that the user can click to reset their password.
   * @returns An object containing an error flag and an optional message.
   */
  sendResetPasswordEmail?: (options: {
    user: { id: string; email: string; firstName?: string; lastName?: string };
    resetLink: string;
  }) => Promise<{
    error: {
      message: string;
      code: string;
      meta?: object;
    } | null;
  }>;
}

/*
 * Database Adapter
 */
export interface UserCredentials {
  email: string;
  password: string;
}

export interface ErrorObject {
  message: string;
  code: string;
  meta?: object;
}

export interface UserDataSuccess<T> {
  user: T;
  error: null;
}

export interface UserDataError {
  user: null;
  error: ErrorObject;
}

export interface TokenDataSuccess {
  error: null;
  token: string;
}

export interface TokenDataError {
  error: ErrorObject;
  token: null;
}

export interface TokenValidationSuccess {
  error: null;
  tokenData: {
    token: string;
    identifier: string;
    type: string;
    expires: Date | string;
  };
}

export interface TokenValidationError {
  error: ErrorObject;
  tokenData: null;
}

export interface DatabaseAdapter<T> {
  getUserByEmail: (email: string) => Promise<UserDataSuccess<T> | UserDataError>;
  loginUser: (credentials: UserCredentials) => Promise<UserDataSuccess<T> | UserDataError>;
  registerUser: (request: Request) => Promise<UserDataSuccess<T> | UserDataError>;
  /**
   * -----------------------------------------
   * generatePasswordResetToken
   * -----------------------------------------
   * Generate a password reset token for the user.
   * @param email - The user's email address
   * @param options - The options object
   * @param options.expiresAfterMinutes - After how many minutes the token should expire
   * @returns An object containing the token or an error object with a message and code if an error occurred
   */
  generatePasswordResetToken: (
    email: string,
    options: { expiresAfterMinutes: number }
  ) => Promise<TokenDataSuccess | TokenDataError>;
  deletePasswordResetToken: (token: string) => Promise<{ error: ErrorObject | null }>;
  validatePasswordResetToken: (
    token: string
  ) => Promise<TokenValidationSuccess | TokenValidationError>;
  resetUserPassword: (options: {
    token: string;
    newPassword: string;
  }) => Promise<UserDataError | UserDataSuccess<T>>;
}
