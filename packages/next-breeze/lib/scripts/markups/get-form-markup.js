const { normalizeRessourceName } = require("../utils");
const { getInputField } = require("./get-input-field");

function getFormMarkup({ ressourceName, parent, modelFieldsObject }) {
  const { capitalSingularResource, lowerRessourceName } = normalizeRessourceName(ressourceName);

  function getDefaultValue(fieldType) {
    if (
      ["string", "string?", "password", "password?", "text", "text?", "email", "email?"].includes(
        fieldType?.toLowerCase()
      )
    ) {
      return `""`;
    }
    if (["boolean", "boolean?"].includes(fieldType?.toLowerCase())) {
      return `false`;
    }
    if (["number", "number?"].includes(fieldType?.toLowerCase())) {
      return `0`;
    }
    if (["date", "date?"].includes(fieldType?.toLowerCase())) {
      return `new Date()`;
    }

    return `""`;
  }

  return `"use client";
  import { z } from "zod";
  import Link from "next/link";
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { create${capitalSingularResource}, update${capitalSingularResource} } from "../_actions";
  import { Input } from "@/components/ui/input";
  import { Textarea } from "@/components/ui/textarea";
  import { Label } from "@/components/ui/label";
  import { Switch } from "@/components/ui/switch";
  import { Button } from "@/components/ui/button";
  import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form";
  import { FormType, FormSchema } from "../_types";

  type Props = { action: "create" } | { action: "edit"; item: FormType & { id: string } };
  
  export default function FormComponent(props: Props) {
    const isEdit = props.action === "edit";
  
    const form = useForm<FormType>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        ${Object.entries(modelFieldsObject)
          .map(([fieldName, fieldType]) => {
            return `${fieldName}: isEdit ? props.item.${fieldName} : ${getDefaultValue(
              fieldType
            )},`;
          })
          .join("\n")}
      },
    });
  
    async function onSubmit(values: FormType) {
      if (props.action === "edit") {
        await update${capitalSingularResource}(props.item.id, values);
      } else {
        await create${capitalSingularResource}(values);
      }
    }
  
    return (
      <>
        <Link href="${parent}${lowerRessourceName}" className="inline-block mb-4 text-blue-500 underline">
          &larr; Back to list
        </Link>
        <Form {...form}>
          <h2 className="text-2xl text-secondary-foreground mb-2">
            {props.action === "edit" ? "Edit" : "Create"} ${capitalSingularResource}
          </h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
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
            <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
              {props.action === "edit" ? "Update" : "Create"}
          </Button>
        </form>
      </Form>
    </>
  );
}`;
}

module.exports = { getFormMarkup };
