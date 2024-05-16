const { normalizeRessourceName } = require("../utils");

function getDeleteMarkup({ ressourceName, parent }) {
  const { capitalSingularResource, lowerSingularResource } = normalizeRessourceName(ressourceName);

  return `import serverToast from "@/lib/breeze-toast.server";
    import { delete${capitalSingularResource} } from "@/services/${lowerSingularResource}.service";
    import { ActionFunctionArgs } from "@remix-run/node";
    
    export async function action({ params }: ActionFunctionArgs) {
      const id = String(params.id);
      await delete${capitalSingularResource}(id);
      return serverToast.successRedirect({
        to: "${parent}${ressourceName}",
        message: "${capitalSingularResource} deleted successfully",
      });
    }
    `;
}

module.exports = { getDeleteMarkup };
