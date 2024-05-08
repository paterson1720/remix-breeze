import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import auth from "../auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Reset Password Email Sent" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }: ActionFunctionArgs) {
  const session = await auth.requireAuth(request, {
    withRoles: ["admin"],
    ifNotAuthenticatedRedirectTo: "/auth/login",
    ifNotAuthorizedRedirectTo: "/auth/unauthorized",
  });
  return { user: session.get("user")! };
}

export default function AdminPage() {
  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Admin Dashboard
            </h1>
            <p className="space-y-4 md:space-y-6">
              <span className="text-gray-900 dark:text-white">
                You are logged in as an admin and viewing the admin dashboard.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
