const { normalizeRessourceName } = require("../utils");
const { getInputField } = require("./get-input-field");

function getCreateMarkup({ ressourceName, parent, modelFieldsObject }) {
  const { singularResource, capitalSingularResource, lowerSingularResource } =
    normalizeRessourceName(ressourceName);

  return `import { Form } from "@remix-run/react";
    import { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
    import serverToast from "@/lib/breeze-toast.server";
    import { create${capitalSingularResource} } from "@/services/${lowerSingularResource}.service";
    
    export const meta: MetaFunction = () => {
      return [{ title: "Create ${ressourceName}" }];
    };
    
    export async function action({ request }: ActionFunctionArgs) {
      const formData = await request.formData();
    
      const formDataEntries = Object.fromEntries(formData.entries()) as any;
      // Convert _YES_ and _NO_ to boolean
      Object.keys(formDataEntries).forEach((key) => {
        if (formDataEntries[key] === "_YES_") formDataEntries[key] = true;
        else if (formDataEntries[key] === "_NO_") formDataEntries[key] = false;
      });
    
      const result = await create${capitalSingularResource}(formDataEntries);
      return serverToast.successRedirect({
        to: \`${parent}${ressourceName}/\${result.id}\`,
        message: "${capitalSingularResource} created successfully",
      });
    }
    
    export default function Create${capitalSingularResource}() {
      return (
        <section className="w-full">
          <div className="w-full px-4 md:px-6 flex flex-col space-y-4">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Create ${lowerSingularResource}</h1>
              <p className="text-gray-500 md:text-xl dark:text-gray-400">Create a new ${singularResource}.</p>
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
                      });
                    }
                    if (["text", "text?"].includes(fieldType?.toLowerCase())) {
                      return getInputField({
                        name: fieldName,
                        type: "text",
                        required: fieldType.includes("?") ? false : true,
                      });
                    }
                    if (["boolean", "boolean?"].includes(fieldType?.toLowerCase())) {
                      return getInputField({
                        name: fieldName,
                        type: "boolean",
                        required: fieldType.includes("?") ? false : true,
                      });
                    }
                    if (["number", "number?"].includes(fieldType?.toLowerCase())) {
                      return getInputField({
                        name: fieldName,
                        type: "number",
                        required: fieldType.includes("?") ? false : true,
                      });
                    }
                    if (["date", "date?"].includes(fieldType?.toLowerCase())) {
                      return getInputField({
                        name: fieldName,
                        type: "date",
                        required: fieldType.includes("?") ? false : true,
                      });
                    }
                    if (["email", "email?"].includes(fieldType?.toLowerCase())) {
                      return getInputField({
                        name: fieldName,
                        type: "email",
                        required: fieldType.includes("?") ? false : true,
                      });
                    }
                    if (["password", "password?"].includes(fieldType?.toLowerCase())) {
                      return getInputField({
                        name: fieldName,
                        type: "password",
                        required: fieldType.includes("?") ? false : true,
                      });
                    }
                  })
                  .join("\n")}    
                <div className="w-full flex flex-col gap-1">
                  <button type="submit" className="border p-2 rounded-md">
                    Create
                  </button>
                </div>
              </div>
            </Form>
          </div>
        </section>
      );
    }
    `;
}

module.exports = { getCreateMarkup };
