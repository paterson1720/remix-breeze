const { normalizeRessourceName } = require("../utils");

function getShowMarkup({ ressourceName, parent }) {
  const { lowerRessourceName, capitalSingularResource } = normalizeRessourceName(ressourceName);

  return `import { get${capitalSingularResource}ById } from "../_actions";
  import Link from "next/link";
  import DeleteForm from "../_components/delete-form";
  
  interface Props {
    params: {
      id: string;
    };
  }
  
  export default async function Page({ params }: Props) {
    const data = await get${capitalSingularResource}ById(params.id);
  
    return (
      <section className="w-full flex flex-col">
        <div className="w-full max-w-7xl mx-auto gap-3 flex flex-col items-center py-12">
          <h1 className="text-2xl md:text-4xl font-bold">Single ${capitalSingularResource}</h1>
          <Link className="text-blue-500 underline" href="${parent}${lowerRessourceName}">
            Back to list
          </Link>
          <div className="flex flex-col gap-4">
            <div className="border border-muted rounded-md shadow-md p-4">
              <pre>{JSON.stringify(data, null, 2)}</pre>
              <div>
                <Link className="text-yellow-500" href={\`${parent}${lowerRessourceName}/\${params.id}/edit\`}>
                  Edit
                </Link>
                &nbsp;|&nbsp;
                <DeleteForm id={params.id} />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  `;
}

module.exports = { getShowMarkup };
