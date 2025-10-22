#!/usr/bin/env node
//application must support the following commands: help, init, greet, add, now, version, get, set

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const os = require("os");
const pkg = require("../package.json");

const argv = process.argv.slice(2);
const [command, ...rest] = argv;

const CONFIG_PATH = path.join(os.homedir(), "hello_cli.js");

function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), "utf-8");
}

function printHelp() {
  console.log("Usage:");
  console.log(" hello <command> [options]\n");
  console.log("Commands:");
  console.log(" help                        show help");
  console.log(" init                        create or update config");
  console.log(" greet [--name|n]            Greet");
  console.log(" add [a b c ...]             Add numbers");
  console.log(" now                         show current date and time");
  console.log(" version                     show cli version");
  console.log(" config get                  show current configuration");
  console.log(" config set <key> <value>    update a configuration value");
}

function parseFlags(args) {
  const flags = { _: [] };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--name" || args[i] === "n") {
      flags.name = args[i + 1];
    } else if (args[i].startsWith("--name")) {
      flags.name = args[i].split("=")[1];
    } else if (args[i].startsWith("-")) {
      if (!flags.unknown) {
        flags.unknown = [];
      }
      flags.unknown.push(args[i]);
    } else {
      flags._.push(args[i]);
    }
  }

  return flags;
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => rl.question(question, resolve)).finally(() =>
    rl.close()
  );
}

async function main() {
  if (
    command === "help" ||
    command === "-help" ||
    rest.includes("-help") ||
    rest.includes("-h")
  ) {
    printHelp();
  }

  const flags = parseFlags(rest);

  if (flags.unknown && flags.unknown.length) {
    console.warn(`Warn: unknown flags: ${flags.unknown.join(", ")}`);
  }

  const config = loadConfig();

  switch (command) {
    case "version": {
      console.log(pkg.version);
      break;
    }

    case "now": {
      console.log(new Date().toString());
      break;
    }

    case "init": {
      let name = flags.name;
      if (!name) {
        name = await prompt("How can I call you?");
      }
      const next = { ...config, name };
      saveConfig(next);
      console.log(`Ready! Config is saved to ${CONFIG_PATH}`);
      break;
    }

    case "greet": {
      const name = flags.name || cfg.name || "user";
      console.log(`Hello, ${name}!`);

      if (!cfg.name && flags.name) {
        console.log(
          "Tip: please save name using command init `hello init --name Ivan"
        );
      }

      break;
    }

    case "add": {
      let nums = flags._.length ? flags._ : null;

      if (!nums) {
        const line = await prompt("Input numbers via space: ");
        nums = line.split(/\s+/).filter(Boolean);
      }

      const values = nums.map(Number);

      if (values.some(Number.isNaN)) {
        console.error("Error: all arguments must be numbers");
        process.exitCode = 1;
        return;
      }

      const sum = values.reduce((acc, currVal) => acc + currVal, 0);
      console.log(`Sum: ${sum}`);
      break;
    }

    case "config": {
      const sub = rest[0];
      if (sub === "get") {
        console.log(loadConfig());
      } else if (sub === "set") {
        const answer = await prompt(
          "Please, write new config in format key=value:"
        );

        const key = answer.split("=")[0];
        const value = answer.split("=")[1];

        if (!key || !value) {
          console.error(
            "Please write config in valid format: key=value e.g. name=user"
          );
          process.exitCode = 1;
          return;
        }

        const next = { ...config, [key]: value };
        saveConfig(next);
        console.log(`Ready! Config is saved to ${CONFIG_PATH}`);
      } else {
        console.error(
          "Unknown sub command, please write config get or config set"
        );
        process.exitCode = 1;
        return;
      }

      break;
    }

    default:
      console.warn(`Unknown commmand: ${command}`);
      printHelp();
      process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e.stack || String(e));
  process.exit(1);
});
