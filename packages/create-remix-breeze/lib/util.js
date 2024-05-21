const spawn = require("child_process").spawn;

function git(opts) {
  return opts.git || "git";
}

function buildCloneCommand(repo, targetPath, options) {
  let args = ["clone"];
  const userArgs = options.args || [];

  if (options.shallow) {
    if (userArgs.indexOf("--depth") >= 0) {
      throw new Error("'--depth' cannot be specified when shallow is set to 'true'");
    }
    args.push("--depth", "1");
  }

  args = args.concat(userArgs);
  args.push("--", repo, targetPath);

  return [git(options), args];
}

function buildCheckoutCommand(ref, opts) {
  return [git(opts), ["checkout", ref]];
}

function clone(repo, targetPath, opts, onSuccess, onError) {
  const [cmd, args] = buildCloneCommand(repo, targetPath, opts);
  const process = spawn(cmd, args);
  process.on("close", (status) => {
    if (status == 0) {
      if (opts.checkout) {
        _checkout();
      } else {
        onSuccess();
      }
    } else {
      onError(new Error("'git clone' failed with status " + status));
    }
  });

  function _checkout() {
    const [cmd, args] = buildCheckoutCommand(opts.checkout, opts);
    const proc = spawn(cmd, args, { cwd: targetPath });
    proc.on("close", function (status) {
      if (status == 0) {
        onSuccess();
      } else {
        onError(new Error("'git checkout' failed with status " + status));
      }
    });
  }
}

exports.gitClone = function (repo, targetPath, opts, cb) {
  if (typeof opts === "function") {
    cb = opts;
    opts = null;
  }

  opts = opts || {};
  cb = cb || function () {};

  clone(repo, targetPath, opts, cb, cb);
};
