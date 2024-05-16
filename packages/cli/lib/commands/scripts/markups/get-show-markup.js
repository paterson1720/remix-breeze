const { normalizeRessourceName } = require("../utils");

function getShowMarkup({ ressourceName, parent }) {
  const { singularResource, capitalSingularResource, lowerSingularResource } =
    normalizeRessourceName(ressourceName);

  return `import { get${capitalSingularResource}ById } from "@/services/${lowerSingularResource}.service";
  import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
  import { Link, useLoaderData } from "@remix-run/react";
  
  export const meta: MetaFunction = () => {
    return [{ title: "${capitalSingularResource} View" }];
  };
  
  export async function loader({ params }: LoaderFunctionArgs) {
    const id = String(params.id);
    const data = await get${capitalSingularResource}ById(id);
    if (!data) throw new Error("${capitalSingularResource} not found");
    return json({ data });
  }
  
  export default function AdminAnnouncements() {
    const loaderData = useLoaderData<typeof loader>();
  
    return (
      <section className="w-full">
        <div className="w-full mx-auto px-4 md:px-6 flex flex-col items-center space-y-4">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Single ${capitalSingularResource} View</h1>
            <p className="text-gray-500 md:text-xl dark:text-gray-400">
              This is a single ${singularResource} view.
            </p>
          </div>
          <div>
            <Link to="${parent}${ressourceName}">Back to list</Link>&nbsp;|&nbsp;
            <Link to={\`${parent}${ressourceName}/\${loaderData.data.id}/edit\`}>Edit</Link>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-4 border">
            <pre>
              <code>{JSON.stringify(loaderData.data, null, 2)}</code>
            </pre>
          </div>
        </div>
      </section>
    );
  }     
  `;
}

module.exports = { getShowMarkup };