# `next-breeze`

> Generate CRUD scaffold for Next.js apps

Requirements

To use this CLI your app should be configured to use Shadcn UI and Prisma

## Usage

```bash
npx next-breeze scaffold-crud -r posts -f "app/(admin-layout)/admin" -m "title:string content:text slug:string? isPublished:boolean"
```

### CLI Options

- -r, --ressource (Required): The ressource you want to generate the CRUD scaffolding for. Ex.: -r users
- -f, --folder (optional): The folder where the create, read, update and delete routes will be generated
- -m, --model (Required): The fields for the model. Fields is defined using this pattern `"fieldName:type"` for required field and `"fieldName:type?"` for optional field, type
can be `string`, `text`, `boolean`, `email`, `password`, `date`, `email`