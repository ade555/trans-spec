# Trans-Spec

**Translate your API documentation into any language in seconds.**

Trans-Spec automatically translates OpenAPI/Swagger specifications into multiple languages using AI, then provides a beautiful local viewer to browse your multilingual API docs.

---

## Why Trans-Spec?

Your API is ready. Your docs are in English. But your users speak Spanish, French, German, Japanese...

**Traditional approach:**

- Manually translate every endpoint description
- Maintain separate doc files per language
- Update each translation every time your API changes
- Expensive, slow, error-prone

**Trans-Spec approach:**

```bash
npx trans-spec generate --spec api.yaml --languages es,fr,de,ja --source en
npx trans-spec serve
```

Done. Your API docs are now available in 5 languages with a beautiful, browsable interface.

---

## Demo Video

Watch a video of how trans-spec works on [Youtube](https://youtu.be/PtnwsQRQzec).

## Features

- **AI-Powered Translation** - Uses [Lingo.dev](https://lingo.dev) for high-quality, context-aware translations
- **One Command Setup** - No configuration files, no complex setup
- **Multiple Specs Support** - Translate and view multiple API specifications
- **20+ Languages** - Supports all major languages out of the box
- **Beautiful Viewer** - Clean, professional UI automatically generated
- **Customizable Viewer** - Eject and modify the viewer to match your brand
- **Incremental Updates** - Only retranslates what changed
- **Persistent Translations** - Cached locally, version-controlled
- **Smart Term Preservation** - Keeps technical terms like `user_id` untouched

---

## Quick Start

### Prerequisites

- Node.js 18+
- An OpenAPI/Swagger spec file (YAML)
- Lingo.dev API key ([Get one free](https://lingo.dev))

### Installation

No installation required! Use `npx`:

```bash
npx trans-spec generate --spec openapi.yaml --languages es,fr,de
```

**First run?** On Windows, the initial setup may take 1-2 minutes as npm downloads dependencies. This only happens once. Subsequent runs are instant.

### 1. Translate Your API Spec

```bash
npx trans-spec generate --spec openapi.yaml --languages es,fr,de
```

**What happens:**

- Trans-Spec reads your OpenAPI spec
- Extracts all human-readable content (descriptions, parameters, responses)
- Translates to Spanish, French, and German using AI
- Saves translations to `.trans-spec/i18n/`

**First time?** You'll be prompted for your Lingo.dev API key. Get one at [lingo.dev](https://lingo.dev) (free tier: 10,000 words/month).

### 2. View Your Multilingual Docs

```bash
npx trans-spec serve
```

Opens `http://localhost:3000` with your translated API documentation.

Use the language switcher to toggle between languages instantly.

---

## Commands

### `generate`

Translate your OpenAPI spec into multiple languages.

```bash
npx trans-spec generate --spec <path> --languages <langs> [--source <lang>]
```

**Options:**

- `--spec` (required) - Path to your OpenAPI/Swagger file
- `--languages` - Comma-separated language codes (e.g., `es,fr,de`). Required for the first translation.
- `--source` - Source language of your spec (default: `en`)

**Examples:**

```bash
# Translate to one language
npx trans-spec generate --spec api.yaml --languages es

# Translate to multiple languages
npx trans-spec generate --spec api.yaml --languages es,fr,de,ja,zh

# Specify source language (if not English)
npx trans-spec generate --spec api.yaml --source pt --languages en,es,fr

# Add more languages to existing translations
npx trans-spec generate --spec api.yaml --languages de,ja  # Adds to existing es,fr
```

### `serve`

Start the local documentation viewer.

```bash
npx trans-spec serve [--port <number>]
```

**Options:**

- `--port` - Port to run server on (default: `3000`)

**Examples:**

```bash
# Start on default port 3000
npx trans-spec serve

# Start on custom port
npx trans-spec serve --port 8080
```

**First time running serve?** You'll be prompted to enter your Lingo.dev API key. This is needed to translate the viewer's UI labels (buttons, headers, etc.) to match your API spec's languages. The key is saved to `.env` for future use. DO NOT COMMIT THIS KEY TO GIT.

### `eject`

Copy the viewer source code into your project for full customization.

```bash
npx trans-spec eject
```

**What it does:**

- Copies the entire React viewer into `./trans-spec-viewer/`
- Gives you complete control over the UI
- The ejected viewer is automatically detected and used by `serve`

**After ejecting:**

```bash
cd trans-spec-viewer
npm install

# Customize the code in src/
# Modify components, styling, layout, etc.

# Then serve uses your customized version automatically
npx trans-spec serve
```

**Use cases for ejecting:**

- **Branding** - Add your logo, colors, and company styling
- **Custom Features** - Add authentication, analytics, search, etc.
- **Layout Changes** - Modify the sidebar, add tabs, change structure
- **Deployment** - Build and deploy as a standalone documentation site
- **Integration** - Embed into existing docs or portals

**Example customizations:**

```jsx
// trans-spec-viewer/src/App.jsx
// Add your logo
<header className="...">
  <img src="/logo.png" alt="Company" />
  <h1>{spec?.info?.title}</h1>
</header>

// trans-spec-viewer/src/components/Sidebar.jsx
// Change colors to match your brand
<button className="bg-blue-600 hover:bg-blue-700">
  {/* Your custom styling */}
</button>
```

**Building for production:**

```bash
cd trans-spec-viewer
npm run build
# Outputs to dist/ - deploy to Vercel, Netlify, GitHub Pages, etc.
```

---

## Usage

### Basic Translation

```bash
# Translate to one language
npx trans-spec generate --spec api.yaml --languages es

# Translate to multiple languages
npx trans-spec generate --spec api.yaml --languages es,fr,de,ja,zh
```

### Specify Source Language

By default, Trans-Spec assumes your spec is in English. If it's in another language:

```bash
npx trans-spec generate --spec api.yaml --source pt --languages en,es,fr
```

### Add More Languages Later

```bash
# Already translated to Spanish and French
# Now add German and Japanese
npx trans-spec generate --spec api.yaml --languages de,ja
```

Trans-Spec automatically **merges** new languages with existing ones. Your previous translations stay intact.

### Multiple API Specs

```bash
npx trans-spec generate --spec api-v1.yaml --languages es,fr
npx trans-spec generate --spec api-v2.yaml --languages es,fr
```

Both specs are translated and viewable. The viewer shows a dropdown to switch between them.

### Update Your Spec

Made changes to your API? Just re-run the generate command without specifying languages:

```bash
npx trans-spec generate --spec api.yaml
```

Trans-Spec automatically:

- Uses your existing language configuration
- Only retranslates what changed
- Saves time and API credits

Want to add more languages? Include the --languages flag:

```bash
npx trans-spec generate --spec api.yaml --languages de,ja
```

This adds German and Japanese to your existing translations without affecting the others.

---

## How It Works

### 1. **Intelligent Extraction**

Trans-Spec parses your OpenAPI spec and identifies what needs translation:

- ✅ Endpoint summaries and descriptions
- ✅ Parameter descriptions
- ✅ Response descriptions
- ✅ Error messages
- ❌ Parameter names (e.g., `user_id` stays as-is)
- ❌ Enum values (e.g., `draft`, `active`)
- ❌ Code examples
- ❌ URLs and paths

### 2. **AI Translation**

Uses Lingo.dev's specialized translation engine:

- Context-aware (understands it's API documentation)
- Preserves technical terms automatically
- Maintains formatting (markdown, code blocks)
- Consistent terminology across endpoints

### 3. **Smart Caching**

- Translations stored in `.trans-spec/i18n/`
- Version-controlled alongside your spec
- Only changed content gets retranslated
- Works offline after initial translation

### 4. **Beautiful Viewer**

- Automatically generates a browsable interface
- Sidebar navigation by endpoint
- Language switcher (UI and API docs stay in sync)
- Clean, professional design
- Responsive (works on mobile)
- Fully customizable via `eject` command

---

## Supported Languages

Trans-Spec supports 20+ languages including:

🇪🇸 Spanish (es) • 🇫🇷 French (fr) • 🇩🇪 German (de) • 🇮🇹 Italian (it) • 🇵🇹 Portuguese (pt, pt-BR)  
🇯🇵 Japanese (ja) • 🇨🇳 Chinese (zh, zh-Hans, zh-Hant) • 🇰🇷 Korean (ko)  
🇷🇺 Russian (ru) • 🇸🇦 Arabic (ar) • 🇮🇳 Hindi (hi) • 🇳🇱 Dutch (nl) • 🇵🇱 Polish (pl) • 🇹🇷 Turkish (tr)

See [Lingo.dev's supported locales](https://lingo.dev/cli/commands/show#locale-sources) for the full list.

---

## Customization

### Eject the Viewer

Want complete control over the UI? Eject the viewer:

```bash
npx trans-spec eject
```

This creates `./trans-spec-viewer/` with the full React source. You can now:

**1. Customize the Design:**

```bash
cd trans-spec-viewer/src
# Edit App.jsx, components/, or styles
```

**2. Add Features:**

- Authentication/authorization
- Analytics tracking
- Custom navigation
- API key management
- Rate limiting display
- Webhook integration

**3. Deploy Independently:**

```bash
cd trans-spec-viewer
npm run build
# Deploy dist/ to your hosting platform
```

**4. Version Control:**

- Commit `trans-spec-viewer/` to your repo
- Your team gets the same customized viewer
- Track changes over time

The ejected viewer is **automatically used** by `npx trans-spec serve` - no additional configuration needed.

### Manual Translation Edits

Translations are stored as YAML files:

```
.trans-spec/
  i18n/
    en/
      api.yaml
    es/
      api.yaml
    fr/
      api.yaml
```

Edit them directly:

```yaml
# .trans-spec/i18n/es/api.yaml
paths:
  /users:
    get:
      summary: Obtener lista de usuarios
      description: Recupera todos los usuarios del sistema
```

Restart the viewer to see changes.

---

## Platform-Specific Notes

### Windows

**First run may take time:** The initial `npx trans-spec generate` command downloads dependencies. On Windows, this can take 1-2 minutes due to npm package resolution. You'll see:

```
🌍 Trans-Spec
⠋ Checking authentication (downloading dependencies on first run, this may take a minute)...
```

**This only happens once.** Subsequent runs are instant.

**PowerShell users:** If you see execution policy errors:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

**Git Bash users:** Commands work as-is.

### macOS/Linux

No special setup required. Commands work out of the box.

---

## Troubleshooting

### Command hangs at "Checking authentication..."

**Symptom:** First run shows spinning loader for 1-2 minutes

**Cause:** npm is downloading dependencies (one-time setup on Windows)

**Solution:** Wait for completion. Message explains this is expected. Subsequent runs are instant.

### "No .trans-spec folder found"

**Solution:** Run `npx trans-spec generate --spec api.yaml --languages es,fr` first to create translations.

### "Authentication failed"

**Solution:**

1. Get your API key from [lingo.dev](https://lingo.dev) → Settings
2. You'll be prompted to enter it when running commands
3. It's saved locally for future use

### "Translation failed"

**Possible causes:**

- No internet connection
- API rate limit exceeded (free tier: 10,000 words/month)
- Invalid OpenAPI spec format

**Solution:** Check the error message.

### Translations look wrong

**Solution:**

- Delete `.trans-spec/` folder
- Run `npx trans-spec generate` again for fresh translations
- Or manually edit `.trans-spec/i18n/{lang}/api.yaml`

### Viewer won't start after eject

**Solution:**

```bash
cd trans-spec-viewer
rm -rf node_modules package-lock.json
npm install
npx trans-spec serve
```

### "API key not found" when running serve

**Solution:** You'll be prompted to enter your Lingo.dev API key. This is saved to the viewer's `.env` file for future use. The key is needed to translate the viewer's UI labels to match your spec's languages.

---

## FAQ

**Q: Is this free?**  
A: Trans-Spec itself is free and open source. Translation costs depend on your Lingo.dev plan. Free tier: 10,000 words/month (enough for most small-medium APIs).

**Q: Can I use my own translation service?**  
A: Currently, Trans-Spec uses Lingo.dev exclusively for best results. Support for other providers may be added in the future.

**Q: Does this work with Swagger 2.0?**  
A: Yes! Trans-Spec supports both OpenAPI 3.x and Swagger 2.0.

**Q: Can I edit translations manually?**  
A: Yes. Translations are in `.trans-spec/i18n/{lang}/api.yaml`. Edit directly and restart the viewer.

**Q: Will my API calls still work in other languages?**  
A: Your API itself doesn't change. Only the **documentation** is translated. Endpoints, parameter names, and code examples remain unchanged.

**Q: How accurate are the translations?**  
A: Lingo.dev uses specialized AI models for technical documentation. Accuracy is very high, but always review critical content.

**Q: Can I deploy the docs as a public website?**  
A: Yes! Run `npx trans-spec eject`, then:

```bash
cd trans-spec-viewer
npm run build
# Deploy dist/ to Vercel, Netlify, GitHub Pages, etc.
```

**Q: Does this modify my original spec file?**  
A: No. Your original spec is never touched. Translations are stored separately in `.trans-spec/`.

**Q: What happens if I eject and then update Trans-Spec?**  
A: Your ejected viewer is independent. It won't be affected by Trans-Spec updates. You maintain full control.

**Q: Can I eject multiple times?**  
A: No. Once ejected, the `trans-spec-viewer/` folder exists. Delete it first if you want to eject again with a fresh copy.

---

## Contributing

Contributions are welcome! Please open an issue or PR on [GitHub](https://github.com/ade555/trans-spec).

---

## License

MIT © Ademola Thompson

---

## Credits

Built with:

- [Lingo.dev](https://lingo.dev) - AI translation engine
- [Swagger Parser](https://github.com/APIDevTools/swagger-parser) - OpenAPI parsing
- [React](https://react.dev) - UI framework
- [Vite](https://vitejs.dev) - Build tool
- [Tailwind CSS](https://tailwindcss.com) - Styling

---

**Made with ❤️ for developers building global APIs**
