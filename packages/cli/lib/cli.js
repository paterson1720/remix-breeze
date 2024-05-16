#!/usr/bin/env node

const { program } = require("commander");
const scaffoldAuth = require("./commands/scaffold-auth");
const scaffoldCrud = require("./commands/scaffold-crud");

program.addCommand(scaffoldAuth);
program.addCommand(scaffoldCrud);

program.parse(process.argv);
