import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import auth from "../auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
};

export async function loader({ request }: ActionFunctionArgs) {
  const session = await auth.getSession(request);
  return { user: session.get("user") };
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const isAuthenticated = Boolean(loaderData.user);

  return (
    <>
      <section className="w-full py-12">
        <div className="px-4 md:px-6 flex flex-col items-center space-y-4">
          <div className="w-full max-w-[700px] mx-auto text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Remix-Breeze</h1>
            <p className="text-gray-500 md:text-xl dark:text-gray-400">
              Give yourself the toolkit to stop configuring and start innovating. Securely build,
              deploy, and scale the best web experiences with Remix.
            </p>
          </div>
          {!isAuthenticated ? (
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                to="/auth/login"
              >
                Login
              </Link>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-black text-white px-8 text-sm font-medium shadow-sm"
                to="/auth/register"
              >
                Register
              </Link>
            </div>
          ) : (
            <div>
              <p>
                You are logged in as <strong>{loaderData.user?.email}</strong>
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link
                  className="mt-4 w-full text-center p-2 px-8 text-sm font-medium text-white bg-blue-600 rounded-md shadow"
                  to="/dashboard"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
