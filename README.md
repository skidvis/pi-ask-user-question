# ask-user-question

A [pi](https://github.com/mariozechner/pi-coding-agent) extension that adds an `askUserQuestion` tool, letting the model pause mid-task and ask you a clarifying question before proceeding.

## What it does

Registers a single tool, `askUserQuestion`, into pi's toolset. The tool accepts a required `question` string and an optional `options` array:

- **With `options`:** presents a multiple-choice picker so you can select from predefined answers.
- **Without `options`:** shows a free-text input prompt for open-ended replies.

The extension also injects prompt guidelines that nudge the model to reach for this tool before taking irreversible actions or when the right approach is ambiguous.

## How it works

When the model calls `askUserQuestion`, one of four things happens:

1. **Non-interactive environment** (RPC or print mode): the tool returns immediately, telling the model to proceed with its best judgment.
2. **Options provided:** pi calls `ctx.ui.select(question, options)` and shows a picker.
3. **No options:** pi calls `ctx.ui.input(question, ...)` and shows a free-text field.
4. **User dismisses (Escape):** the tool returns a message asking the model to use its best judgment or ask again.

On a successful answer, the tool returns `"User answered: {answer}"` so the model can continue with full context.

## Installation

> **Security:** pi packages run with full system access. Review the [source](https://github.com/skidvis/pi-ask-user-question) before installing.

**Global (recommended):**

```bash
pi install git:github.com/skidvis/pi-ask-user-question
```

**Project-local** (writes to `.pi/settings.json`, shareable with your team):

```bash
pi install -l git:github.com/skidvis/pi-ask-user-question
```

**Ephemeral** (current session only, nothing written to disk):

```bash
pi -e git:github.com/skidvis/pi-ask-user-question
```

## Usage

Once installed, `askUserQuestion` is available to the model automatically. No extra configuration is needed.

The injected prompt guidelines instruct the model to call `askUserQuestion` when:

- It is about to take an action that cannot be undone.
- Multiple valid approaches exist and the right one depends on your preference.
- A required piece of information is missing or ambiguous.

You can answer with free text or, when the model provides options, pick from the list. Pressing Escape at any prompt tells the model to continue with its best judgment.

## Requirements

This package declares the following peer dependencies, which pi bundles and provides automatically:

- `@mariozechner/pi-coding-agent`
- `@sinclair/typebox`

No separate install step is needed for these.

## License

MIT
