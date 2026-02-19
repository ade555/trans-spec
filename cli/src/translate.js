import { spawn } from "child_process";
import chalk from "chalk";
import ora from "ora";
import path from "path";

const GLOSSIA_DIR = ".glossia";
const MAX_RETRIES = 2;

async function runTranslation() {
  return new Promise((resolve, reject) => {
    let output = "";
    let hasErrors = false;

    const process = spawn("npx", ["lingo.dev@latest", "run"], {
      cwd: path.resolve(GLOSSIA_DIR),
      shell: true,
      stdio: "pipe",
    });

    // Capture stdout
    process.stdout.on("data", (data) => {
      const text = data.toString();
      output += text;
      console.log(text);
      // Check for failure indicators
      if (text.includes("❌") || text.includes("[Failed Files]")) {
        hasErrors = true;
      }
    });

    process.on("close", (code) => {
      if (code !== 0 || hasErrors) {
        reject(new Error("Translation had errors or failures"));
      } else {
        resolve();
      }
    });

    process.on("error", (err) => {
      reject(err);
    });
  });
}

export async function translate(targets) {
  const spinner = ora("Translating...").start();
  spinner.stop();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await runTranslation();
      console.log(chalk.green("\n✔ Translation complete"));
      return;
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        console.log(
          chalk.yellow(
            `Translation failed. Retrying (${attempt}/${MAX_RETRIES})...`,
          ),
        );
      }
    }
  }

  console.log(chalk.red("Translation failed after 2 attempts."));
  // console.log(chalk.red("Check the errors above for details."));
  console.log(
    chalk.white("Please try running manually: npx lingo.dev@latest run"),
  );
  process.exit(1);
}
