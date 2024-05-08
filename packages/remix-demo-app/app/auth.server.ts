import { createBreezeAuth, PrismaAdapter } from "auth";
import { prisma } from "../prisma/client";

const auth = createBreezeAuth({
  databaseAdapter: PrismaAdapter(prisma),
  cookie: {
    name: "__session",
    secret: process.env.COOKIE_SECRET!,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

auth.use({
  type: "credentials",
  //   resetPasswordPageUrl: "/auth/reset-password",
  //   sendResetPasswordEmail: async ({ user, resetLink }) => {
  //     const { error } = await sendTransactionalEmail({
  //       to: user.email,
  //       subject: "Password Reset Link",
  //       html: `
  //               <p>Hello ${user.firstName || ""},</p>
  //               <p>You have requested to reset your password. Click the link below to reset your password.</p>
  //               <a href="${resetLink}">Reset Password</a>
  //               <p>If you did not request a password reset, please ignore this email.</p>
  //           `,
  //     });

  //     if (error) {
  //       return {
  //         error: {
  //           message: "Error sending email. Please try again",
  //           code: "send_password_reset_email_error",
  //         },
  //       };
  //     }

  //     return { error: null };
  //   },
});

// function sendTransactionalEmail(options: { to: string; subject: string; html: string }) {
//   // Send email using your email provider
//   // For example, using SendGrid, Resend or nodemailer
//   console.log("Sending email options", options);
//   // If (errorSendingEmail) return { error: { message: "Error sending email", code: "send_email_error" } }
//   return { error: null };
// }

export default auth;
