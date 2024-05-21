const { normalizeRessourceName } = require("../utils");
const { getInputField } = require("./get-input-field");

function getEditMarkup({ ressourceName, parent, modelFieldsObject }) {
  const { capitalSingularResource, lowerSingularResource } = normalizeRessourceName(ressourceName);

  return `import serverToast from "@/lib/breeze-toast.server";
import { get${capitalSingularResource}ById, update${capitalSingularResource} } from "@/services/${lowerSingularResource}.service";
import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { AppLayout } from "@/pages/_layouts/app-layout";

export const meta: MetaFunction = () => {
  return [{ title: "Edit ${capitalSingularResource}" }];
};

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();

  const formDataEntries = Object.fromEntries(formData.entries()) as any;
  // Convert _YES_ and _NO_ to boolean
  Object.keys(formDataEntries).forEach((key) => {
    if (formDataEntries[key] === "_YES_") formDataEntries[key] = true;
    else if (formDataEntries[key] === "_NO_") formDataEntries[key] = false;
  });

  const id = String(params.id);
  await update${capitalSingularResource}(id, formDataEntries);
  return serverToast.successRedirect({
    to: \`${parent}${ressourceName}/\${id}\`,
    message: "${capitalSingularResource} updated successfully",
  });
}

export async function loader({ params }: LoaderFunctionArgs) {
  const id = String(params.id);
  const data = await get${capitalSingularResource}ById(id);
  return json({ data });
}

export default function Edit${capitalSingularResource}() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <AppLayout>
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Edit ${capitalSingularResource}</h1>
      </div>
      <Form method="post">
        <div className="w-full flex flex-col gap-4">
        ${Object.entries(modelFieldsObject)
          .map(([fieldName, fieldType]) => {
            if (["string", "string?"].includes(fieldType?.toLowerCase())) {
              return getInputField({
                name: fieldName,
                type: "string",
                required: fieldType.includes("?") ? false : true,
                isEditView: true,
              });
            }
            if (["text", "text?"].includes(fieldType?.toLowerCase())) {
              return getInputField({
                name: fieldName,
                type: "text",
                required: fieldType.includes("?") ? false : true,
                isEditView: true,
              });
            }
            if (["boolean", "boolean?"].includes(fieldType?.toLowerCase())) {
              return getInputField({
                name: fieldName,
                type: "boolean",
                required: fieldType.includes("?") ? false : true,
                isEditView: true,
              });
            }
            if (["number", "number?"].includes(fieldType?.toLowerCase())) {
              return getInputField({
                name: fieldName,
                type: "number",
                required: fieldType.includes("?") ? false : true,
                isEditView: true,
              });
            }
            if (["date", "date?"].includes(fieldType?.toLowerCase())) {
              return getInputField({
                name: fieldName,
                type: "date",
                required: fieldType.includes("?") ? false : true,
                isEditView: true,
              });
            }
            if (["email", "email?"].includes(fieldType?.toLowerCase())) {
              return getInputField({
                name: fieldName,
                type: "email",
                required: fieldType.includes("?") ? false : true,
                isEditView: true,
              });
            }
            if (["password", "password?"].includes(fieldType?.toLowerCase())) {
              return getInputField({
                name: fieldName,
                type: "password",
                required: fieldType.includes("?") ? false : true,
                isEditView: true,
              });
            }
          })
          .join("\n")}    
          <div className="w-full flex flex-col gap-1">
            <button type="submit" className="border p-2 rounded-md">
              Save
            </button>
          </div>
        </div>
      </Form>
    </AppLayout>
  );
}`;
}

module.exports = { getEditMarkup };
