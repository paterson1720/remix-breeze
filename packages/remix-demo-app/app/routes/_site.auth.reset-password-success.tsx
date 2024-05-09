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
