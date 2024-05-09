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
  if (process.env.IS_DEMO_MODE) {
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
