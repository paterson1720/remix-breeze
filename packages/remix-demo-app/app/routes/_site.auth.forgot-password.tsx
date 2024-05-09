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
  // In demo mode, we will append the reset link to the redirect URL for demo purposes.
  // You should remove this in your production code and implement the email sending above
  // to send the password reset link to the user's email.
  if (process.env.IS_DEMO_MODE) {
    redirectUrl += `&reset_link_for_demo_purpose=${encodeURIComponent(resetLink)}`;
  }

  return redirect(redirectUrl);

  /**
   * You can also use the following code to send a password reset link more easily.
   * Make sure you setup the "sendResetPasswordEmail" function in your
   * auth.server.ts file so that password reset emails can be sent.
   */
  //   return auth.sendPasswordResetLink(request, {
  //     expireLinkAfterMinutes: 15,
  //     onSuccessRedirectTo: "/auth/reset-password-email-sent",
  //   });
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
