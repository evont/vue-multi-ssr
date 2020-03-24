const { bold, blue, red, yellow, magenta } = require("kleur");
const webpack = require("webpack");
const clear = require("console-clear");

const main = {
  info: blue("ℹ"),
  warning: yellow("⚠"),
  error: red("✖")
};

const win = {
  info: blue("i"),
  warning: yellow("‼"),
  error: red("×")
};

const symbols = process.platform === "win32" ? win : main;

function warn(text, code) {
  process.stdout.write(`${symbols.warning + yellow(" WARN ") + text}\n`);
  code && process.exit(code);
}

function error(text, code) {
  process.stderr.write(`${symbols.error + red(" ERROR ") + text}\n`);
  code && process.exit(code);
}

function allFields(stats, field, fields = [], name = null) {
  const info = stats.toJson({
    errors: true,
    warnings: false,
    errorDetails: false
  });
  const addCompilerPrefix = msg =>
    name ? bold(magenta(`${name}: `)) + msg : msg;
  if (field === "errors" && stats.hasErrors()) {
    fields = fields.concat(info.errors.map(addCompilerPrefix));
  }
  if (field === "warnings" && stats.hasWarnings()) {
    fields = fields.concat(info.warnings.map(addCompilerPrefix));
  }
  if (stats && stats.compilation && stats.compilation.children) {
    stats.compilation.children.forEach((child, index) => {
      const name = child.name || `Child Compiler ${index + 1}`;
      const stats = child.getStats();
      fields = allFields(stats, field, fields, name);
    });
  }
  return fields;
}

// https://gist.github.com/developit/1a40a6fee65361d1182aaa22ab8c334c
function replaceAll(str, find, replace) {
  let s = "",
    index,
    next;
  while (~(next = str.indexOf(find, index))) {
    s += str.substring(index, next) + replace;
    index = next + find.length;
  }
  return s + str.substring(index);
}

/** Removes all loaders from any resource identifiers found in a string */
function stripLoaderPrefix(str) {
  if (typeof str === "string") {
    str = str.replace(
      /(?:(\()|(^|\b|@))(\.\/~|\.{0,2}\/(?:[^\s]+\/)?node_modules)\/\w+-loader(\/[^?!]+)?(\?\?[\w_.-]+|\?({[\s\S]*?})?)?!/g,
      "$1"
    );
    str = str.replace(/(\.?\.?(?:\/[^/ ]+)+)\s+\(\1\)/g, "$1");
    str = replaceAll(str, process.cwd(), ".");
    return str;
  }
  return str;
}
function showStats(stats) {
  if (stats.hasErrors()) {
    allFields(stats, "errors")
      .map(stripLoaderPrefix)
      .forEach(msg => error(msg));
  }

  if (stats.hasWarnings()) {
    allFields(stats, "warnings")
      .map(stripLoaderPrefix)
      .forEach(msg => warn(msg));
  }

  clear(true);
  return stats;
}
function runCompiler(compiler) {
  return new Promise((res, rej) => {
    compiler.run((err, stats) => {
      showStats(stats);

      if (err || (stats && stats.hasErrors())) {
        rej(red(`Build failed! ${err || ""}`));
      }

      res(stats);
    });
  });
}

module.exports = async (conf, watch = false) => {
  if (conf.domain) delete conf.domain;
  const compiler = webpack(conf);
  if (watch) {
    compiler.watch(
      {
        ignored: /node_modules/
      },
      (err, stats) => {
        if (err) {
          console.error(err.stack || err);
          if (err.details) {
            console.error(err.details);
          }
          return;
        }
        showStats(stats);
      }
    );
  } else {
    await runCompiler(compiler);
  }
};
