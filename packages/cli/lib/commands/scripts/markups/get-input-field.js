const { titlize } = require("../utils");

/**
 * Get the input field markup
 * @param {object} options - The options object
 * @param {string} options.name - The name of the field
 * @param {"string" | "text" | "boolean" | "number" | "date" | "email" | "password"} options.type - The type of the field
 * @param {boolean} options.required - If the field is required
 * @param {string} options.defaultValueStr - The default value string
 * @returns {string}
 */
function getInputField({ name, type, required, isEditView }) {
  if (type === "string") {
    return `
<div className="w-full flex flex-col gap-1">
    <label htmlFor="${name}" className="text-sm font-semibold">
        ${titlize(name)} ${required ? "*" : ""}
    </label>
    <input
        id="${name}"
        name="${name}"
        defaultValue={${isEditView ? `loaderData.data?.${name} || ""` : '""'}}
        className="w-full bg-white text-black border p-2 rounded-md"
        placeholder="type here..."
        ${required ? "required" : ""}
    />
</div>
    `;
  }

  if (type === "text") {
    return `
<div className="w-full flex flex-col gap-1">
    <label htmlFor="${name}" className="text-sm font-semibold">
    ${titlize(name)} ${required ? "*" : ""}
    </label>
    <textarea
        id="${name}"
        name="${name}"
        defaultValue={${isEditView ? `loaderData.data?.${name} || ""` : '""'}}
        placeholder="type here..."
        className="w-full bg-white text-black border p-2 rounded-md"
        ${required ? "required" : ""}
    />
</div>
        `;
  }

  if (type === "boolean") {
    return `
<div className="w-full flex flex-col gap-1">
    <label htmlFor="${name}" className="text-sm font-semibold">
    ${titlize(name)} ${required ? "*" : ""}
    </label>
    <select
        id="${name}"
        name="${name}"
        defaultValue={${isEditView ? `loaderData.data?.${name} === true ? "_YES_" : "_NO_"` : '""'}}
        className="w-full bg-white text-black border p-2 rounded-md"
        ${required ? "required" : ""}
    >
    <option value="" disabled>Select</option>
    <option value="_YES_">Yes</option>
    <option value="_NO_">No</option>
    </select>
</div>
        `;
  }

  if (type === "number") {
    return `
<div className="w-full flex flex-col gap-1">
    <label htmlFor="${name}" className="text-sm font-semibold
    ${titlize(name)} ${required ? "*" : ""}
    </label>
    <input
        type="number"
        id="${name}"
        name="${name}"
        defaultValue={${isEditView ? `loaderData.data?.${name} || ""` : '""'}}
        className="w-full bg-white text-black border p-2 rounded-md"
        placeholder="type here..."
        ${required ? "required" : ""}
    />
</div>
  `;
  }

  if (type === "date") {
    return `
<div className="w-full flex flex-col gap-1">
    <label htmlFor="${name}" className="text-sm font-semibold
    ${titlize(name)} ${required ? "*" : ""}
    </label>
    <input
        type="date"
        id="${name}"
        name="${name}"
        defaultValue={${isEditView ? `loaderData.data?.${name} || ""` : '""'}}
        className="w-full bg-white text-black border p-2 rounded-md"
        placeholder="type here..."
        ${required ? "required" : ""}
    />
</div>
        `;
  }

  if (type === "email") {
    return `
<div className="w-full flex flex-col gap-1">
    <label htmlFor="${name}" className="text-sm font-semibold
    ${titlize(name)} ${required ? "*" : ""}
    </label>
    <input
        type="email"
        id="${name}"
        name="${name}"
        defaultValue={${isEditView ? `loaderData.data?.${name} || ""` : '""'}}
        className="w-full bg-white text-black border p-2 rounded-md"
        placeholder="type here..."
        ${required ? "required" : ""}
    />
</div>
  `;
  }

  if (type === "password") {
    return `
<div className="w-full flex flex-col gap-1">
    <label htmlFor="${name}" className="text-sm font-semibold
    ${titlize(name)} ${required ? "*" : ""}
    </label>
    <input
        type="password"
        id="${name}"
        name="${name}"
        defaultValue={${isEditView ? `loaderData.data?.${name} || ""` : '""'}}
        className="w-full bg-white text-black border p-2 rounded-md"
        placeholder="type here..."
        ${required ? "required" : ""}
    />
</div>
  `;
  }

  return "";
}

module.exports = { getInputField };
