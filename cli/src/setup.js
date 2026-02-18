import fs from "fs";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import dotenv from "dotenv";

dotenv.config();

const GLOSSIA_DIR = process.env.GLOSSIA_DIR;
const I18N_DIR = path.join(GLOSSIA_DIR, "i18n");

export async function setup(apiSpecPath, sourceLanguage) {
  const spinner = ora("Setting up project...").start();

  try {
    // Resolve the spec file path
    const resolvedSpecPath = path.resolve(apiSpecPath);

    // Check if specfication file exists
    if (!fs.existsSync(resolvedSpecPath)) {
      spinner.fail(chalk.red(`Spec file not found: ${apiSpecPath}`));
      process.exit(1);
    }

    const sourceDir = path.join(I18N_DIR, sourceLanguage);

    // Create folder structure if it doesn't exist
    if (!fs.existsSync(GLOSSIA_DIR)) {
      fs.mkdirSync(sourceDir, { recursive: true });
      spinner.text = "Created .glossia folder structure";
    }

    // Always update the spec file
    const destinationPath = path.join(sourceDir, "api.yaml");
    fs.copyFileSync(resolvedSpecPath, destinationPath);

    spinner.succeed(chalk.green("Project setup complete"));
  } catch (err) {
    spinner.fail(chalk.red("Setup failed: " + err.message));
    process.exit(1);
  }
}
