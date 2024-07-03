#!/usr/bin/env node

import { spawn } from "child_process";
import hugo from "../index.js";

(async () => {
  try {
    const args = process.argv.slice(2);
    const bin = await hugo();
    console.log("Initialized 'hugo-extended' Node CLI.");

    console.log(`##[cmd] "${bin}" ${args.join(" ")}`);
    spawn(bin, args, { stdio: "inherit" })
      .on("exit", (code) => {
        // forward Hugo's exit code so this module itself reports success/failure
        process.exitCode = code;
      });
  } catch (error) {
    console.error(`Failed to initialize 'hugo-extended' Node CLI. ${error.message}`);
  }
})();
