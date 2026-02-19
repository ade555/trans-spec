#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import path from "path";
import { checkAuth } from "./src/auth.js";
import { setup } from "./src/setup.js";
import { generateConfig } from "./src/config.js";
import { translate } from "./src/translate.js";
const GLOSSIA_DIR = ".glossia";
const EJECTED_VIEWER_DIR = "glossia-viewer";

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

program
  .command("eject")
  .description(
    `Copy the viewer source into ./${EJECTED_VIEWER_DIR} so you can customize and deploy it`,
  )
  .action(async () => {
    const fs = await import("fs");
    const { fileURLToPath } = await import("url");

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const packageViewerDir = path.resolve(__dirname, "../viewer");
    const ejectedViewerDir = path.join(process.cwd(), EJECTED_VIEWER_DIR);

    console.log(chalk.bold("\n📦 Glossia Eject\n"));

    if (!fs.existsSync(packageViewerDir)) {
      console.log(
        chalk.red("✖ Could not find the viewer source inside the package."),
      );
      console.log(chalk.gray(`  Looked in: ${packageViewerDir}`));
      process.exit(1);
    }

    if (fs.existsSync(ejectedViewerDir)) {
      console.log(
        chalk.red(
          `✖ ${EJECTED_VIEWER_DIR}/ already exists. Remove it first if you want to eject again.\n`,
        ),
      );
      process.exit(1);
    }

    console.log(
      chalk.white(
        `Copying viewer into ${chalk.cyan(EJECTED_VIEWER_DIR + "/")}...\n`,
      ),
    );

    try {
      console.log(chalk.gray(`  From: ${packageViewerDir}`));
      console.log(chalk.gray(`  To:   ${ejectedViewerDir}`));
      fs.cpSync(packageViewerDir, ejectedViewerDir, {
        recursive: true,
        filter: (src) => {
          const parts = src.replace(packageViewerDir, "").split(path.sep);
          return !parts.includes("node_modules");
        },
      });
    } catch (err) {
      console.log(chalk.red("\n✖ Failed to copy viewer files:"));
      console.log(err);
      process.exit(1);
    }

    console.log(chalk.green(`✔ Viewer ejected to ${EJECTED_VIEWER_DIR}/\n`));
    console.log(chalk.white("Next steps:"));
    console.log(chalk.cyan(`  cd ${EJECTED_VIEWER_DIR} && npm install`));
    console.log(
      chalk.white("\nThe viewer will be used automatically when you run:"),
    );
    console.log(chalk.cyan("  npx glossia serve\n"));
    console.log(chalk.white("Or run it directly for full control:"));
    console.log(chalk.cyan(`  cd ${EJECTED_VIEWER_DIR} && npm run dev\n`));
  });

program
  .command("serve")
  .description("Start the local docs viewer")
  .option("-p, --port <port>", "Port to run server on", "3000")
  .action(async (options) => {
    const { spawn, execSync } = await import("child_process");
    const path = await import("path");
    const fs = await import("fs");
    const readline = await import("readline");
    const { fileURLToPath } = await import("url");

    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    // Prefer ejected viewer in cwd over the package viewer
    const ejectedViewerDir = path.join(process.cwd(), EJECTED_VIEWER_DIR);
    const packageViewerDir = path.resolve(__dirname, "../viewer");
    const isEjected = fs.existsSync(ejectedViewerDir);
    const viewerDir = isEjected ? ejectedViewerDir : packageViewerDir;

    if (isEjected) {
      console.log(
        chalk.cyan(`\n🔧 Using ejected viewer from ./${EJECTED_VIEWER_DIR}\n`),
      );
    }

    const publicDir = path.join(viewerDir, "public");
    const glossiaSource = path.join(process.cwd(), ".glossia");
    const glossiaDest = path.join(publicDir, "glossia");

    // Check if .glossia exists
    if (!fs.existsSync(glossiaSource)) {
      console.log(
        chalk.red("\n✖ No .glossia folder found in current directory"),
      );
      console.log(
        chalk.white(
          "Run: npx glossia generate --spec api.yaml --languages es,fr first\n",
        ),
      );
      process.exit(1);
    }

    // Read API spec languages
    const i18nConfig = JSON.parse(
      fs.readFileSync(path.join(glossiaSource, "i18n.json"), "utf-8"),
    );
    const sourceLocale = i18nConfig.locale.source;
    const targetLocales = i18nConfig.locale.targets;

    console.log(chalk.cyan("\n🚀 Starting Glossia viewer...\n"));

    // Check for API key and prompt if not found
    let apiKey = process.env.LINGODOTDEV_API_KEY;
    const envPath = path.join(viewerDir, ".env");

    // Check if API key exists in viewer/.env
    if (!apiKey && fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const match = envContent.match(/LINGODOTDEV_API_KEY=(.+)/);
      if (match) {
        apiKey = match[1].trim();
      }
    }

    // Prompt for API key if not found
    if (!apiKey) {
      console.log(chalk.yellow("⚠ Lingo.dev API key not found.\n"));
      console.log(chalk.white("To get your API key:"));
      console.log(chalk.cyan("  1. Visit https://lingo.dev"));
      console.log(chalk.cyan("  2. Sign in and go to Settings"));
      console.log(chalk.cyan("  3. Copy your API key\n"));

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      apiKey = await new Promise((resolve) => {
        rl.question(chalk.white("Enter your Lingo.dev API key: "), (answer) => {
          rl.close();
          resolve(answer.trim());
        });
      });

      if (!apiKey) {
        console.log(chalk.red("\n✖ API key is required to run the viewer"));
        process.exit(1);
      }

      // Save API key to viewer/.env for future use
      let existingEnv = "";
      if (fs.existsSync(envPath)) {
        existingEnv = fs.readFileSync(envPath, "utf-8");
        // Remove existing LINGODOTDEV_API_KEY line if present
        existingEnv = existingEnv
          .split("\n")
          .filter((line) => !line.startsWith("LINGODOTDEV_API_KEY="))
          .join("\n");
      }
      // Add the new API key
      const newEnvContent = existingEnv
        ? `${existingEnv}\nLINGODOTDEV_API_KEY=${apiKey}\n`
        : `LINGODOTDEV_API_KEY=${apiKey}\n`;

      fs.writeFileSync(envPath, newEnvContent);
      console.log(chalk.green("\n✔ API key saved to viewer/.env\n"));
    } else {
      console.log(chalk.green("✔ API key found\n"));
    }

    // Copy .glossia to viewer/public
    if (fs.existsSync(glossiaDest)) {
      fs.rmSync(glossiaDest, { recursive: true });
    }
    fs.cpSync(glossiaSource, glossiaDest, { recursive: true });

    // Create index of available spec files
    const specI18nDir = path.join(glossiaSource, "i18n");
    const languages = fs.readdirSync(specI18nDir);
    const index = {};

    languages.forEach((lang) => {
      const langDir = path.join(specI18nDir, lang);
      const files = fs
        .readdirSync(langDir)
        .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
        .sort();

      index[lang] = files;
    });

    fs.writeFileSync(
      path.join(glossiaDest, "index.json"),
      JSON.stringify(index, null, 2),
    );

    // Generate Vite config with Compiler
    const viteConfigContent = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { lingoCompilerPlugin } from '@lingo.dev/compiler/vite'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    lingoCompilerPlugin({
      sourceRoot: 'src',
      sourceLocale: '${sourceLocale}',
      targetLocales: ${JSON.stringify(targetLocales)},
      models: 'lingo.dev',
      dev: {
        usePseudotranslator: false,
      },
    }),
    react(),
    tailwindcss(),
  ],
})
`;

    fs.writeFileSync(
      path.join(viewerDir, "vite.config.generated.js"),
      viteConfigContent,
    );

    console.log(chalk.green("✔ Setup complete"));
    // Install viewer dependencies if needed
    const viewerNodeModules = path.join(viewerDir, "node_modules");
    if (!fs.existsSync(viewerNodeModules)) {
      console.log(
        chalk.yellow(
          "\n📦 Installing viewer dependencies (one-time setup)...\n",
        ),
      );

      try {
        execSync("npm install", {
          cwd: viewerDir,
          stdio: "inherit",
          shell: true,
        });
        console.log(chalk.green("\n✔ Dependencies installed\n"));
      } catch (err) {
        console.log(chalk.red("\n✖ Failed to install dependencies"));
        console.log(err);
        process.exit(1);
      }
    }
    console.log(
      chalk.cyan(`\nStarting server on http://localhost:${options.port}\n`),
    );

    // Start server
    const server = spawn(
      "npm",
      [
        "run",
        "dev",
        "--",
        "--config",
        "vite.config.generated.js",
        "--port",
        options.port,
      ],
      {
        cwd: viewerDir,
        stdio: "inherit",
        shell: true,
      },
    );

    server.on("error", (err) => {
      console.log(chalk.red("Failed to start viewer:", err.message));
      process.exit(1);
    });
  });

program.parse();
