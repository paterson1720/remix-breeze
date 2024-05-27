const { normalizeRessourceName } = require("../utils");

function getServiceMarkup({ ressourceName, parent }) {
  const {
    capitalSingularResource,
    capitalRessourceName,
    lowerRessourceName,
    lowerSingularResource,
  } = normalizeRessourceName(ressourceName);

  const serviceContent = `"use server";

    import prisma from "@/lib/prisma";
    import { revalidatePath } from "next/cache";
    import { redirect } from "next/navigation";
    import { FormType } from "../_types";

    export async function create${capitalSingularResource}(params: FormType) {
      const data = await prisma.${lowerSingularResource}.create({
        data: params,
      });
      redirect(\`${parent}${lowerRessourceName}/\${data.id}\`);
    }

    export async function get${capitalSingularResource}ById(id: string) {
      return await prisma.${lowerSingularResource}.findUnique({
        where: { id },
      });
    }
    
    export async function getAll${capitalRessourceName}() {
      return await prisma.${lowerSingularResource}.findMany({ 
        orderBy: { createdAt: "desc" } 
      });
    }

    export async function update${capitalSingularResource}(id: string, params: Partial<FormType>) {
      const data = await prisma.${lowerSingularResource}.update({
        where: { id },
        data: params,
      });
      redirect(\`${parent}${lowerRessourceName}/\${data.id}\`);
    }
    
    export async function delete${capitalSingularResource}(id: string) {
      await prisma.${lowerSingularResource}.delete({
        where: { id },
      });
      revalidatePath("${parent}${lowerRessourceName}");
      redirect("${parent}${lowerRessourceName}");
    }
    `;

  return serviceContent;
}

module.exports = { getServiceMarkup };
