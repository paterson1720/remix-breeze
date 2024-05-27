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
function getInputField({ name, type, required }) {
  if (type === "string") {
    return `
    <FormField
        control={form.control}
        name="${name}"
        render={({ field }) => (
        <FormItem>
            <FormLabel>${titlize(name)} ${required ? "*" : ""}</FormLabel>
            <FormControl>
            <Input
                placeholder="Type here..."
                {...field}
                value={field.value || ""}
                disabled={form.formState.isSubmitting}
            />
            </FormControl>
            <FormMessage />
        </FormItem>
        )}
  />
    `;
  }

  if (type === "text") {
    return `
  <FormField
    control={form.control}
    name="${name}"
    render={({ field }) => (
      <FormItem>
        <FormLabel>${titlize(name)} ${required ? "*" : ""}</FormLabel>
        <FormControl>
          <Textarea
            placeholder="Type here..."
            {...field}
            value={field.value || ""}
            disabled={form.formState.isSubmitting}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
        `;
  }

  if (type === "boolean") {
    return `
    <FormField
    control={form.control}
    name="${name}"
    render={({ field }) => (
      <FormItem>
        <FormControl>
          <div className="flex items-center space-x-2">
            <Switch
              id="${name}"
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              disabled={form.formState.isSubmitting}
            />
            <Label htmlFor="${name}">${titlize(name)} ${required ? "*" : ""}</Label>
          </div>
        </FormControl>

        <FormMessage />
      </FormItem>
    )}
  />
        `;
  }

  if (type === "number") {
    return `
    <FormField
        control={form.control}
        name="${name}"
        render={({ field }) => (
        <FormItem>
            <FormLabel>${titlize(name)} ${required ? "*" : ""}</FormLabel>
            <FormControl>
            <Input
                type="number"
                placeholder="Type here..."
                {...field}
                value={field.value || ""}
                disabled={form.formState.isSubmitting}
            />
            </FormControl>
            <FormMessage />
        </FormItem>
        )}
  />
  `;
  }

  if (type === "date") {
    return `
    <FormField
    control={form.control}
    name="${name}"
    render={({ field }) => (
    <FormItem>
        <FormLabel>${titlize(name)} ${required ? "*" : ""}</FormLabel>
        <FormControl>
        <Input
            type="date"
            placeholder="Type here..."
            {...field}
            value={field.value || ""}
            disabled={form.formState.isSubmitting}
        />
        </FormControl>
        <FormMessage />
    </FormItem>
    )}
/>
        `;
  }

  if (type === "email") {
    return `
    <FormField
        control={form.control}
        name="${name}"
        render={({ field }) => (
        <FormItem>
            <FormLabel>${titlize(name)} ${required ? "*" : ""}</FormLabel>
            <FormControl>
            <Input
                type="email"
                placeholder="Type here..."
                {...field}
                value={field.value || ""}
                disabled={form.formState.isSubmitting}
            />
            </FormControl>
            <FormMessage />
        </FormItem>
        )}
  />
  `;
  }

  if (type === "password") {
    return `
    <FormField
        control={form.control}
        name="${name}"
        render={({ field }) => (
        <FormItem>
            <FormLabel>${titlize(name)} ${required ? "*" : ""}</FormLabel>
            <FormControl>
            <Input
                type="password"
                placeholder="Type here..."
                {...field}
                value={field.value || ""}
                disabled={form.formState.isSubmitting}
            />
            </FormControl>
            <FormMessage />
        </FormItem>
        )}
  />
  `;
  }

  return "";
}

module.exports = { getInputField };
