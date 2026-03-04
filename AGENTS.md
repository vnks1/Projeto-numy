# Coding Rules

- Do not force types.
- Rely on React Query for queries and mutations.
- Always run `npm run lint` at the end of each implementation.
- Never change ESLint rules; always fix lint violations instead.
- Never add lint ignores (for example `eslint-disable-next-line`) without asking first.
- In Pino `error` logs, pass the `Error` object as the first argument (not a custom object wrapper).
- Never modify `.jscpd.json`; fix duplication by refactoring code instead.
- For OpenAI structured outputs, all fields in the output schema (including nested object fields) must be required.
