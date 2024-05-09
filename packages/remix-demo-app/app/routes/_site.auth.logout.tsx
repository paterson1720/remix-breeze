import { ActionFunctionArgs } from "@remix-run/node";
import auth from "../auth.server";

export async function loader({ request }: ActionFunctionArgs) {
  return auth.logout(request, {
    redirectTo: "/",
  });
}
