const { normalizeRessourceName } = require("../utils");

function getListMarkup({ ressourceName, parent }) {
  const { lowerRessourceName, capitalRessourceName } = normalizeRessourceName(ressourceName);

  return `import { getAll${capitalRessourceName} } from "./_actions";
  import Link from "next/link";
  import DeleteForm from "./_components/delete-form";
  
  export default async function Page() {
    const data = await getAll${capitalRessourceName}();
  
    return (
      <section className="w-full flex flex-col">
        <div className="w-full max-w-7xl mx-auto gap-3 flex flex-col items-center py-12">
          <h1 className="text-2xl md:text-4xl font-bold">All ${capitalRessourceName}</h1>
          <p>A list of all records.</p>
          <Link
            className="text-blue-500 block border p-2 px-4 rounded-md hover:underline"
            href="${parent}${lowerRessourceName}/create"
          >
            Create Record
          </Link>
          <div className="flex flex-col gap-4">
            {data.map((item) => (
              <div key={item.id} className="border border-muted rounded-md shadow-md p-4">
                <pre>{JSON.stringify(item, null, 2)}</pre>
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
