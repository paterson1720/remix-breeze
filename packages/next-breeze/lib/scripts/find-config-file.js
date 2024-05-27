const fs = require("fs");
const path = require("path");

function findConfigFile(...args) {
  const rel = path.join.apply(null, [].slice.call(args));
  return findStartingWith(process.cwd(), rel);
}

function findStartingWith(start, rel) {
  const file = path.join(start, rel);
  try {
    fs.statSync(file);
    return file;
  } catch (err) {
    if (path.dirname(start) !== start) {
      return findStartingWith(path.dirname(start), rel);
    }
  }
}

function parse(content) {
  if (/^\s*{/.test(content)) {
    return JSON.parse(content);
  }
  return undefined;
}

function file(...args) {
  const nonNullArgs = [].slice.call(args).filter((arg) => arg != null);

  for (let i = 0; i < nonNullArgs.length; i++) {
    if (typeof nonNullArgs[i] !== "string") {
      return;
    }
  }

  const file = path.join.apply(null, nonNullArgs);
  try {
    return fs.readFileSync(file, "utf-8");
  } catch (err) {
    return undefined;
  }
}

function json(...args) {
  const content = file.apply(null, args);
  return content ? parse(content) : null;
}

module.exports = { findConfigFile, json, file, parse };
