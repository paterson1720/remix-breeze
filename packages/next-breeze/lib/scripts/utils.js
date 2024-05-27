const { detect } = require("@antfu/ni");
const pluralize = require("./pluralize");

function normalizeRessourceName(ressourceName) {
  ressourceName = ressourceName.replace(/[^a-zA-Z0-9]/g, "");
  const singularResource = singularize(ressourceName);
  const lowerRessourceName = lowerize(ressourceName);
  const capitalRessourceName = capitalize(ressourceName);
  const capitalSingularResource = capitalize(singularResource);
  const lowerSingularResource = lowerize(singularResource);

  return {
    singularResource,
    lowerRessourceName,
    capitalRessourceName,
    capitalSingularResource,
    lowerSingularResource,
  };
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function lowerize(string) {
  return string.toLowerCase();
}

function singularize(string) {
  return pluralize.singular(string);
}

function titlize(str) {
  return str
    .split(/(?=[A-Z])/)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

async function getPackageManager(targetDir) {
  const packageManager = await detect({ programmatic: true, cwd: targetDir });

  if (packageManager === "yarn@berry") return "yarn";
  if (packageManager === "pnpm@6") return "pnpm";
  if (packageManager === "bun") return "bun";

  return packageManager ?? "npm";
}

module.exports = {
  normalizeRessourceName,
  getPackageManager,
  titlize,
  singularize,
  capitalize,
  lowerize,
};
