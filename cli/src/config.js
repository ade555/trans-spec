import fs from "fs";
import path from "path";
import chalk from "chalk";
import ora from "ora";

const GLOSSIA_DIR = ".glossia";
const CONFIG_PATH = path.join(GLOSSIA_DIR, "i18n.json");

export async function generateConfig(languages, source = "en") {
  const spinner = ora("Generating config...").start();

  try {
    // Handles both comma and space separated: "es,fr,de" or "es fr de"
    // Parse new languages if provided
    let newTargets = [];
    if (languages) {
      newTargets = languages
        .split(/[\s,]+/)
        .map((lang) => lang.trim())
        .filter(Boolean);
    }

    // Check if config already exists
    let existingTargets = [];
    if (fs.existsSync(CONFIG_PATH)) {
      const existingConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
      existingTargets = existingConfig.locale?.targets || [];
    }

    // Merge: existing + new, remove duplicates
    const allTargets = [...new Set([...existingTargets, ...newTargets])];

    if (allTargets.length === 0) {
      spinner.fail(chalk.red("No target languages provided"));
      process.exit(1);
    }

    const config = {
      $schema: "https://lingo.dev/schema/i18n.json",
      version: "1.12",
      locale: {
        source: source,
        targets: allTargets,
      },
      buckets: {
        yaml: {
          include: ["i18n/[locale]/*.yaml"],
        },
      },
    };

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

    if (newTargets.length > 0) {
      spinner.succeed(
        chalk.green(`Config updated: ${source} → ${allTargets.join(", ")}`),
      );
    } else {
      spinner.succeed(
        chalk.green(
          `Using existing config: ${source} → ${allTargets.join(", ")}`,
        ),
      );
    }
    return allTargets;
  } catch (err) {
    spinner.fail(chalk.red("Config generation failed: " + err.message));
    process.exit(1);
  }
}
