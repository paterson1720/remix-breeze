const { normalizeRessourceName } = require("../utils");

function getListMarkup({ ressourceName, parent }) {
  const { lowerRessourceName, capitalRessourceName } = normalizeRessourceName(ressourceName);

  return `import { getAll${capitalRessourceName} } from "./_actions";
  import Link from "next/link";
  import DeleteForm from "./_components/delete-form";
  
  export default async function Page() {
    const data = await getAll${capitalRessourceName}();
  
    return (
      <section className="bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center lg:mb-16 mb-8">
          <h2 className="mb-4 text-3xl lg:text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            All ${capitalRessourceName}
          </h2>
          <p className="font-light text-gray-500 sm:text-xl dark:text-gray-400 mb-4">
            Here you can view all ${lowerRessourceName} records. Feel free to change the design and layout to fit your needs.
          </p>
          <Link
            className="text-blue-500 block border p-2 px-4 rounded-md hover:underline"
            href="${parent}${lowerRessourceName}/create"
          >
            Create Record
          </Link>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
            {data.map((item) => (
              <div key={item.id} className="border border-muted rounded-md shadow-md p-4">
                <pre className="max-w-5xl overflow-hidden">{JSON.stringify(item, null, 2)}</pre>
                <div>
                  <Link className="text-blue-500" href={\`${parent}${lowerRessourceName}/\${item.id}\`}>
                    View
                  </Link>
                  &nbsp;|&nbsp;
                  <Link className="text-yellow-500" href={\`${parent}${lowerRessourceName}/\${item.id}/edit\`}>
                    Edit
                  </Link>
                  &nbsp;|&nbsp;
                  <DeleteForm id={item.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  `;
}

module.exports = { getListMarkup };
