const { normalizeRessourceName } = require("../utils");

function getDeleteMarkup({ ressourceName, parent }) {
  const { capitalSingularResource, lowerRessourceName } = normalizeRessourceName(ressourceName);

  return `"use client";

  import React from "react";
  import { delete${capitalSingularResource} } from "../_actions";
  
  export default function DeleteForm({ id }: { id: string }) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      /** You can replace this with a nicer confirmation model if you wish */
      if (confirm("Are you sure you want to delete this record?")) {
        delete${capitalSingularResource}(id);
      }
    };
  
    return (
      <form onSubmit={handleSubmit} className="inline">
        <button type="submit" className="text-red-500">
          Delete
        </button>
      </form>
    );
  }
  `;
}

module.exports = { getDeleteMarkup };
