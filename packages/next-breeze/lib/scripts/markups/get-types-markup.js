function getTypesMarkup({ modelFieldsObject }) {
  return `import { z } from "zod";

  export const FormSchema = z.object({
    ${Object.entries(modelFieldsObject)
      .map(([fieldName, fieldType]) => {
        if (
          ["string", "string?", "text", "text?", "password", "password?"].includes(
            fieldType?.toLowerCase()
          )
        ) {
          return fieldType.includes("?")
            ? `${fieldName}: z.string().optional().nullable().default(null),`
            : `${fieldName}: z.string(),`;
        }
        if (["boolean", "boolean?"].includes(fieldType?.toLowerCase())) {
          return fieldType.includes("?")
            ? `${fieldName}: z.boolean().optional().nullable().default(null),`
            : `${fieldName}: z.boolean(),`;
        }
        if (["number", "number?"].includes(fieldType?.toLowerCase())) {
          return fieldType.includes("?")
            ? `${fieldName}: z.number().optional().nullable().default(null),`
            : `${fieldName}: z.number(),`;
        }
        if (["date", "date?"].includes(fieldType?.toLowerCase())) {
          return fieldType.includes("?")
            ? `${fieldName}: z.date().optional().nullable().default(null),`
            : `${fieldName}: z.date(),`;
        }
        if (["email", "email?"].includes(fieldType?.toLowerCase())) {
          return fieldType.includes("?")
            ? `${fieldName}: z.string().optional().nullable().default(null),`
            : `${fieldName}: z.string().email(),`;
        }
        if (["password", "password?"].includes(fieldType?.toLowerCase())) {
          return fieldType.includes("?")
            ? `${fieldName}: z.string().optional().nullable().default(null),`
            : `${fieldName}: z.string(),`;
        }
      })
      .join("\n")}
  });

  export type FormType = z.infer<typeof FormSchema>;
 `;
}

module.exports = { getTypesMarkup };
