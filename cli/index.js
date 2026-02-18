#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import path from "path";
import { checkAuth } from "./src/auth.js";
import { setup } from "./src/setup.js";
import { generateConfig } from "./src/config.js";
import { translate } from "./src/translate.js";
import dotenv from "dotenv";

dotenv.config();

const GLOSSIA_DIR = process.env.GLOSSIA_DIR;

program
  .name("glossia")
  .description("Translate your OpenAPI spec into multiple languages")
  .version("1.0.0");

program
  .command("generate")
  .description("Translate an OpenAPI spec into multiple languages")
  .requiredOption("--spec <path>", "Path to your OpenAPI spec file")
  .option("--languages <languages>", "Target languages e.g. es,fr,de")
  .option("--source <language>", "Source language (default: en)", "en")
  .action(async (options) => {
    console.log(chalk.bold("\n🌍 Glossia\n"));

    // Step 1: Check authentication
    await checkAuth();

    // Step 2: Setup folder structure and copy spec
    await setup(options.spec, options.source);

    // Step 3: Generate i18n.json config
    const targets = await generateConfig(options.languages, options.source);

    // Step 4: Run translations
    await translate(targets);

    // Step 5: Tell user where their files are
    console.log(chalk.bold("\n✔ Done! Your translated specs are in:\n"));
    targets.forEach((lang) => {
      console.log(chalk.cyan(`  ${GLOSSIA_DIR}/i18n/${lang}/api.yaml`));
    });
    console.log(chalk.white("\nTo view your docs, run:"));
    console.log(chalk.cyan("  npx glossia serve\n"));
  });

program.parse();
