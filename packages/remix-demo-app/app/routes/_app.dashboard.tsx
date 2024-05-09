import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import auth from "../auth.server";
import { Link, useLoaderData } from "@remix-run/react";

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
            <Link
              to="/auth/logout"
              className="bg-red-600 text-white text-center block w-full rounded-md p-3"
            >
              Logout
            </Link>
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
