#!/usr/bin/env node

const { program } = require("commander");
const scaffoldCrud = require("./scaffold-crud");

program.addCommand(scaffoldCrud);

program.parse(process.argv);
