# `@remix-breeze/auth`

> Add email/password authentication to your Remix app like a breeze.

Follow us on [X (Twitter)](https://twitter.com/Paterson1720) to stay in touch and get update when new tools are released.

**@remix-breeze/auth** is an easy to use library with an elegant API to easily add email/password based authentication to your Remix apps.

## Table of Contents

- [Getting Started](#getting-started)
- [Advanced Usage](#advanced-usage)
- [API reference](#api-reference)
- [Types](#types)

## Getting started

Choose one of the options below to get started.

## Starting a new Remix project ?

If you are starting a new Remix project, the easiest way is to use the [Remix-Breeze Starter Template](https://github.com/paterson1720/remix-breeze-starter). It's a simple and easy to use starter template built to get your project started quickly with **@remix-breeze/auth** and Remix.

## Existing project ?

If you have an existing project and you want to add authentication to it, following this tutorial to add a full authentication flow to your app. This tutorial assumes your app is using Prisma ORM and Tailwindcss. If you are not using Prisma, you can still follow along, but you'll need to [configure your own adapter](#advanced-usage-custom-database-adapter).

- Install the library in your Remix app

```bash
npm i @remix-breeze/auth
```

- Create an `auth.server.ts` file in your `/app` directory and copy paste the following content in it.

```ts
import { createBreezeAuth, PrismaAdapter } from "@remix-breeze/auth";
import { prisma } from "../prisma/client";

const auth = createBreezeAuth({
  databaseAdapter: PrismaAdapter(prisma),
  cookie: {
    name: "__session",
    secret: process.env.COOKIE_SECRET!,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

auth.use({ type: "credentials" });

export default auth;
```

As you can see we are using the `PrismaAdapter` to interact with the database, make sure you setup prisma by following the official [prisma documentation](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases-typescript-postgresql) if you haven't already.

After setting up Prisma, a `prisma` folder will be created automatically in your root directory.

- Create a `client.ts` file inside your `prisma` folder and paste that code in it:

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
prisma.$connect();

process.on("beforeExit", () => {
  prisma.$disconnect();
});

export { prisma };
```

- Next, add the following models to your `prisma/schema.prisma` file:

```ts
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String     @id @default(cuid())
  email         String     @unique
  emailVerified Boolean    @default(false)
  fullName      String
  firstName     String
  lastName      String
  avatar        String?
  password      String
  roles         UserRole[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

model Role {
  id        String     @id @default(cuid())
  name      String     @unique
  users     UserRole[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model UserRole {
  id        String   @id @default(cuid())
  userId    String
  roleId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      Role     @relation(fields: [roleId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model VerificationRequest {
  id         String   @id @default(cuid())
  identifier String
  token      String   @unique
  type       String
  expires    DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([identifier, token])
}
```

- Make sure you have the `DATABASE_URL` environment variable in your `.env` file.

```bash
DATABASE_URL="file:./dev.db"
```

**Note**: In this schema file we are using `sqlite` as the prisma db datasource provider for simplicity,
so the `DATABASE_URL` value is set to the local `file:./dev.db` sqlite database. If you are using any other database provider like `postgresql`, `mysql` etc. the `DATABASE_URL` value should be the URL string of your database. You can also use `sqlite` to develop your app and change it when ready to move to prod.

- Regenerate your prisma client so that prisma is aware of these new models

```bash
npx prisma generate
npx prisma db push
```

## Run the prisma studio server

Run the prisma studio to interact with your db models

```bash
npx prisma studio
```

## Add roles to your Role table

Make sure you add at least the `user` role to your `Role` table.
To do that add a new record to your `Role` table and for the `name` column put `user` as the value.

## Registering users

Now you are ready to register user.

- Create a new route called `auth.register.tsx` in your routes folder an copy paste this inside it:

```tsx
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import auth from "../auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "Register" }, { name: "description", content: "Welcome to Remix!" }];
};

export async function action({ request }: ActionFunctionArgs) {
  return auth.registerUser(request, {
    authenticateAndRedirectTo: "/dashboard",
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  await auth.redirectIfAuthenticated(request, { to: "/dashboard" });
  return null;
}

export default function Register() {
  const actionData = useActionData<typeof action>();
  const hasError = actionData?.error;

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            {hasError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {actionData.error.message}</span>
              </div>
            )}
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Register for an account
            </h1>
            <Form method="post" className="space-y-4 md:space-y-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  First Name
                </label>
                <input
                  name="firstName"
                  id="firstName"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Jhon"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Last Name
                </label>
                <input
                  name="lastName"
                  id="lastName"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Doe"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Register
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <a
                  href="/auth/login"
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Sign in
                </a>
              </p>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Note**: We are using tailwindcss for styling so make sure you setup tailwind in your project to reflect the styles.

As you can see we are importing `auth.server` and in the `action` function we are using the `auth.register` function and passing it the `request` object. Your request should have a formData with the following fields:

- firstName
- lastName
- email
- password

The default `PrismaAdapter` will automatically take these fields from the request's formData, validate them and register a user for you. If there is any error, they will be returned and shown in the UI.

## Create a dashboard page

As you can see in the `action` function above we are redirecting to `/dashboard` so let's create this page. Create a `dashboard.tsx` file in your routes folder and copy paste this content inside it:

```tsx
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import auth from "../auth.server";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Reset Password Email Sent" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }: ActionFunctionArgs) {
  const session = await auth.requireAuth(request, {
    ifNotAuthenticatedRedirectTo: "/auth/login",
  });
  return { user: session.get("user")! };
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <section className="bg-gray-50 pt-24 dark:bg-gray-900">
      <div className="flex flex-col items-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Welcome to Your Dashboard
            </h1>
            <p className="space-y-4 md:space-y-6">
              <span className="text-gray-900 dark:text-white">
                You are now logged in and viewing your dashboard.
              </span>
            </p>
            <pre className="text-black dark:text-white">
              <code>{JSON.stringify({ user }, null, 2)}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
```

## Protecting page

Focus on this part of the code in the `loader` function

```ts
export async function loader({ request }: ActionFunctionArgs) {
  const session = await auth.requireAuth(request, {
    ifNotAuthenticatedRedirectTo: "/auth/login",
  });
  return { user: session.get("user")! };
}
```

We are using the `auth.requireAuth` function of Remix Breeze Auth to protect the dashboard page.
This function will verify if the user is authenticated, to allow the user to access the page. if not authenticated the user will be redirected to the `/auth/login` page.

With just that you now have a way for users to register to your app, upon registration user is automatically authenticated and redirected to the `/dashboard` page.

## Create a login page

We don't have a login page yet. So inside your routes folder create an `auth.login.tsx` file and paste the following code inside it:

```tsx
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import auth from "../auth.server";
import { Form, useActionData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [{ title: "Login" }, { name: "description", content: "Welcome to Remix!" }];
};

export async function action({ request }: ActionFunctionArgs) {
  return auth.authenticateWithCredentials(request, {
    redirectTo: "/dashboard",
  });
}

export async function loader({ request }: ActionFunctionArgs) {
  return auth.redirectIfAuthenticated(request, {
    to: "/dashboard",
  });
}

export default function Login() {
  const data = useActionData<typeof action>();
  const hasError = Boolean(data?.error);

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            {hasError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {data?.error.message}</span>
              </div>
            )}
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>
            <Form method="post" className="space-y-4 md:space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <a
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-primary-600 hover:underline dark:text-gray-400"
                >
                  Forgot password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Sign in
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don’t have an account yet?{" "}
                <a
                  href="/auth/register"
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Sign up
                </a>
              </p>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
```

just like the `auth.registerUser` function, we are now using the `auth.authenticateWithCredentials` and passing it the request and tell it to redirect to `/dashboard` after successfully authenticate the user.
If there is an error, it will be returned and display to the UI.

Just like the register form, the `login` form should have the following fields:

- email
- password

Breeze auth adapter will extract those fields automatically from the request's formData validate them and authenticate the user.

We also want to redirect user to his dashboard page, if trying to access the login page while already authenticated. So we use the `auth.redirectIfAuthenticated` function in the loader, this function checks if a user is already authenticated, and redirect the user to the specified `to` URL option.

Now your with just that, your app already support registering users, login users and protect certain pages to only authenticated users.

## Logout user

To logout user, create an `auth.logout.ts` file in your routes folder and paste the following in it:

```ts
import { ActionFunctionArgs } from "@remix-run/node";
import auth from "../auth.server";

export async function loader({ request }: ActionFunctionArgs) {
  return auth.logout(request, {
    redirectTo: "/",
  });
}
```

Now when ever you visit the `/auth/logout` path while authenticated, you should be logged out and redirected to the home page as specified in the `redirectTo` option.

## Password Reset

Now let's allow users to reset their password.

- Create a file named `auth.forgot-password.tsx` in your routes folder, and paste this code in it:

```tsx
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, redirect, useActionData } from "@remix-run/react";
import auth from "../auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "Forgot Password" }, { name: "description", content: "Welcome to Remix!" }];
};

// Mock function to send a password reset email. you should replace this with your own email sending function.
function sendPasswordResetEmail({ to, resetLink }: { to: string; resetLink: string }) {
  try {
    console.log("Sending password reset email to", to, "with reset link", resetLink);
    // sendTransactionEmail({ to, subject: "Password Reset", html: `<a href="${resetLink}">Reset your password</a>` });
    return { error: null };
  } catch (error) {
    return { error: { message: "Error sending email", code: "send_email_error" } };
  }
}

export async function action({ request }: ActionFunctionArgs) {
  /**
   * Sending a password reset link
   */
  const formData = await request.formData();
  const email = formData.get("email") as string;

  const generateTokenResult = await auth.generatePasswordResetToken(email, {
    expiresAfterMinutes: 10,
  });
  if (generateTokenResult.error) return { error: generateTokenResult.error };

  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const resetLink = `${baseUrl}/auth/reset-password?token=${generateTokenResult.token}&email=${email}`;
  const { error: emailError } = await sendPasswordResetEmail({ to: email, resetLink });
  if (emailError) return { error: emailError };

  let redirectUrl = `/auth/reset-password-email-sent?email=${encodeURIComponent(email)}`;
  // In dev mode, we will append the reset link to the redirect URL for demo purposes.
  // You should remove this in your production code and implement the email sending above
  // to send the password reset link to the user's email.
  if (process.env.NODE_ENV !== "production") {
    redirectUrl += `&reset_link_for_demo_purpose=${encodeURIComponent(resetLink)}`;
  }

  return redirect(redirectUrl);
}

export default function ForgotPassword() {
  const actionData = useActionData<typeof action>();
  const hasError = Boolean(actionData?.error);

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            {hasError && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {actionData?.error.message}</span>
              </div>
            )}
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Get a password reset link
            </h1>
            <Form method="post" className="space-y-4 md:space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Send password reset link
              </button>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Improtant**: Here we are adding the reset link as query params and we'll access it in the next page to reset the password. In production you should implement a sendEmail function to send the reset link to the user's email.

Notice we are redirecting to `/auth/reset-password-email-sent` after generating and sending the email to the user's email. That page it to let the user know that an email has been sent, and to check his inbox.

Let's create that page.

- Create a file named `auth.reset-password-email-sent.tsx` in your routes folder and add the below code in it:

```tsx
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, json, useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Reset Password Email Sent" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  if (process.env.NODE_ENV !== "production") {
    const resetLink = url.searchParams.get("reset_link_for_demo_purpose");
    return json({ resetLink, email });
  }
  return json({ resetLink: null, email });
}

export default function ResetPasswordEmailSent() {
  const { resetLink, email } = useLoaderData<typeof loader>();

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Check Your Email
            </h1>
            <p className="space-y-4 md:space-y-6">
              <span className="text-gray-900 dark:text-white">
                We have sent you a password reset link to your email address{" "}
                <strong>{email}</strong>. Please check your email.
              </span>
            </p>
            {resetLink && (
              <>
                <p className="text-orange-500">
                  Note: for this demo app, the email will not actually be sent. Instead, you can use
                  the link below to reset your password.
                </p>
                <Link to={resetLink || ""} className="text-blue-500 underline">
                  Reset My Password
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
```

When user click on the reset link, it will send the user to the `/auth/reset-password` page. So let's add that page.

- Create an `auth.reset-password.tsx` file inside the routes directory and paste this code in it:

```tsx
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import auth from "../auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "Reset Password" }, { name: "description", content: "Welcome to Remix!" }];
};

export async function action({ request }: ActionFunctionArgs) {
  return auth.resetPassword(request, {
    onSuccessRedirectTo: "/auth/reset-password-success",
  });
}

export async function loader({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  return auth.validatePasswordResetToken(token);
}

export default function ResetPassword() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const isInvalidToken = loaderData.error;

  if (isInvalidToken) {
    return (
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Invalid or Expired Token
              </h1>
              <p className="space-y-4 md:space-y-6">
                <span className="text-gray-900 dark:text-white">
                  The token you provided is invalid or has expired. Please request a new password
                  reset link.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            {actionData?.error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {actionData.error.message}</span>
              </div>
            )}
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Reset your password
            </h1>
            <Form method="post" className="space-y-4 md:space-y-6">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  id="newPpassword"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Repeat Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              <input type="hidden" name="token" value={loaderData.tokenData.token} />
              <button
                type="submit"
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Reset Password
              </button>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Focus on this code block:

```ts
export async function action({ request }: ActionFunctionArgs) {
  return auth.resetPassword(request, {
    onSuccessRedirectTo: "/auth/reset-password-success",
  });
}
```

We are using the `auth.resetPassword` and passing it the request object. This function requires the request's formData to have the following fields:

- newPassword
- confirmPassword
- token

The token is the token that is included in the reset link. So it should be extracted in added to the form as a hidden input.

Just by passing these fields, `auth.resetPassword` will handle reseting the user's password and redirect the user to the specified redirect URL: `/auth/reset-password-success`.

We don't have the `/auth/reset-password-success` page yet. Let's create it.

- In your routes folder, create a file `auth.reset-password-success` and paste this code in it:

```tsx
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Password Reset Success" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function PasswordResetSuccess() {
  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Password Reset Success!
            </h1>
            <p className="space-y-4 md:space-y-6">
              <span className="text-gray-900 dark:text-white">
                Your password has been successfully reset. You can now log in with your new
                password.
              </span>
            </p>
            <Link
              to="/auth/login"
              className="text-white block p-2 w-full text-center rounded-md items-center bg-blue-600"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Now you have a full registration, authentication and password reset flow.

## Advanced Usage

The default flow and setups will work with most apps, but if you want more control, @remix-breeze/auth allows you to provide your own adapter, sessionStorage to have full control on your authentication logic and database interaction.

## Provide a Custom Database Adapter

If you want to use a different ORM like Drizzle instead of prisma or even no ORM at all with `@remix-breeze/auth`, you can implement your own database adapter and pass it to the `createBreezeAuth` configuration options.

To create your own adapter, refer to the implementation of the [Prisma Adapter](https://github.com/paterson1720/remix-breeze/blob/main/packages/auth/lib/adapters/prisma.ts) or the [MongoDB Adapter](https://github.com/paterson1720/remix-breeze/blob/main/packages/auth/lib/adapters/mongodb.ts). Re-implement all the methods to interact with your db and return the same data structure for each methods.

Once you have your custom adapter, you can use it in the `createBreezeAuth` function to setup the authenticator instance like so:

```ts
import { createBreezeAuth } from "@remix-breeze/auth";
import MyCustomAdapter from "./my-custom-adapter-fiule-path";

const auth = createBreezeAuth({
  databaseAdapter: MyCustomAdapter(),
  cookie: {
    name: "__session",
    secret: process.env.COOKIE_SECRET!,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

auth.use({ type: "credentials" });

export default auth;
```

Now you are using your own adapter where you have the freedom to implement all the methods to interact with your database, and logic to verify user credentials, hash user passwords etc..

## Provide a Custom Session Storage

By default, Remix-Breeze Auth uses cookie to store session data. If you want to store session
data in your database, you can provide a custom session storage in the `createBreezeAuth`
function options.

Here is an example of how you can store session data in a database.
This example uses MongoDB as the database but you can adapt it to use any other database.

```ts
import { SessionIdStorageStrategy, createSessionStorage } from "@remix-run/node";
import { ObjectId } from "mongodb";
import { BreezeAuthSessionUser } from "./breeze-auth/types";

function createDatabaseSessionStorage({ cookie }: { cookie: SessionIdStorageStrategy["cookie"] }) {
  // Configure your database client...
  async function db() {
    const dbClient = await getMongoClient();
    const db = dbClient.db();
    return {
      Session: db.collection("Session"),
    };
  }

  return createSessionStorage<{ user: BreezeAuthSessionUser }>({
    cookie,
    async createData(data, expires) {
      // `expires` is a Date after which the data should be considered
      // invalid. You could use it to invalidate the data somehow or
      // automatically purge this record from your database.
      const { Session } = await db();
      const { insertedId } = await Session.insertOne({
        data,
        createdAt: new Date(),
        updatedAt: new Date(),
        expires,
      });

      return insertedId.toHexString();
    },
    async readData(id) {
      const { Session } = await db();
      const session = await Session.findOne({ _id: new ObjectId(id) });

      if (!session) {
        return null;
      }

      return session.data;
    },
    async updateData(id, data, expires) {
      const { Session } = await db();
      await Session.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            data,
            updatedAt: new Date(),
            expires,
          },
        }
      );
    },
    async deleteData(id) {
      const { Session } = await db();
      await Session.deleteOne({ _id: new ObjectId(id) });
    },
  });
}

export default createDatabaseSessionStorage;
```

Now in your `auth.server.ts` file you can use the `createDatabaseSessionStorage`to create a custom session storage and pass it to the `createBreezeAuth` function options.

```ts
import { createBreezeAuth, MongoDBAdapter } from "@remix-breeze/auth";
import { getMongoClient } from "./mongo-client";

const breezeAuth = createBreezeAuth({
  databaseAdapter: MongoDBAdapter(getMongoClient),
  sessionStorage: createDatabaseSessionStorage({
    cookie: {
      name: "__session",
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  }),
});
```

## API Reference

Remix-Breeze Auth is a flexible authentication library designed for use with Remix. This documentation provides a detailed reference for initializing the library, managing sessions, user authentication, and handling specific authentication scenarios.

## Setup

Before using BreezeAuth, you must set up and configure the library. Use the `createBreezeAuth` function to initialize an instance with your specific configuration.

### createBreezeAuth

```typescript
import { createBreezeAuth, PrismaAdapter } from "@remix-breeze/auth";
import { prisma } from "prisma/client";

const auth = createBreezeAuth({
  databaseAdapter: PrismaAdapter(prisma),
  cookie: {
    name: "__breeze-auth-session__",
    secret: process.env.COOKIE_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
```

Parameters:

- `breezeAuthOptions`: Configuration options for setting up BreezeAuth.

## Core Functions

Below are the core functions provided by the BreezeAuth instance.

### sessionStorage

Manage user sessions, including retrieval, commitment, and destruction of session data.

```ts
const session = await auth.sessionStorage.getSession(request);
session.set("user", { id: 1, email: "test@email.com" });
await auth.sessionStorage.commitSession(session);
await auth.sessionStorage.destroySession(session);
```

### use

Register an authentication provider.

```typescript
auth.use({
  type: "credentials",
  sendResetPasswordEmail: async ({ user, resetLink }) => {
    // implementation
  },
  resetPasswordPageUrl: "/auth/reset-password",
});
```

### logout

Log out a user and clear session data.

```typescript
await auth.logout(request, { redirectTo: "/auth/login" });
```

### getSession

Retrieve the session from a request.

```typescript
const session = await auth.getSession(request);
```

### registerUser

Register a new user.

```typescript
const registration = await auth.registerUser(request, {
  authenticateAndRedirectTo: "/dashboard",
});
```

### requireAuth

Require authentication for a route.

```typescript
const session = await auth.requireAuth(request, {
  ifNotAuthenticatedRedirectTo: "/auth/login",
});
```

### resetPassword

Reset a user's password.

```typescript
await auth.resetPassword(request, {
  onSuccessRedirectTo: "/auth/reset-password-success",
});
```

### requireRole

Require a specific user role to access a route.

```typescript
await auth.requireRole(request, "admin", {
  redirectTo: "/auth/unauthorized",
});
```

### redirectIfAuthenticated

Redirect already authenticated users.

```typescript
await auth.redirectIfAuthenticated(request, {
  to: "/dashboard",
});
```

### changePassword

Change the user password

```typescript
const { user, error } = await auth.changeUserPassword({
  userId: "1",
  currentPassword: "password",
  newPassword: "M@res3cur3password",
});
```

### Miscellaneous Functions

- `updateSession`: Update session data and potentially redirect.
- `getUserFromSession`: Retrieve user data from the session.
- `sendPasswordResetLink`: Send a password reset link to a user's email.
- `getCommittedSessionHeaders`: Get the Set-Cookie headers after committing a session.

## Database Adapter

BreezeAuth requires a database adapter to interface with your database. The adapter should conform to a specific interface, handling user creation, authentication, password resets, etc.
The library provides a Prisma Adapter and a MongoDB Adapter by default, you can create your own adapter by looking at one of the adapters source code as example.

- [Prisma Adapter](https://github.com/paterson1720/remix-breeze/blob/main/packages/auth/lib/adapters/prisma.ts)
- [MongoDB Adapter](https://github.com/paterson1720/remix-breeze/blob/main/packages/auth/lib/adapters/mongodb.ts)

## Types

````ts
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
  changeUserPassword: (options: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }) => Promise<UserDataError | UserDataSuccess<T>>;
}
````

## Error Handling

Errors are handles by returning an `error` object with `message` and `code` properties when there is an error in each adapter function, the UI can access the error message and code and provide detailed error message to the user.

## Conclusion

Remix-Breeze Auth provides comprehensive tools for managing user authentication and session management efficiently. By configuring it according to your application's needs, you can implement robust auth processes tailored to your requirements.
