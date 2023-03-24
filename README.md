# setup-spacectl

[![build](https://github.com/spacelift-io/setup-spacectl/actions/workflows/test.yml/badge.svg)](https://github.com/spacelift-io/setup-spacectl/actions/workflows/test.yml) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

This is a simple GitHub Action to install [spacectl](https://github.com/spacelift-io/spacectl): a utility wrapping Spacelift's [GraphQL API](https://docs.spacelift.io/integrations/api) for easy programmatic access in command-line contexts - either in manual interactive mode (in your local shell), or in a predefined CI pipeline (GitHub Actions, CircleCI, Jenkins etc).

## ✨ Usage

`GITHUB_TOKEN` environment variable is a **must** because we're using it internally to list all releases of `spacectl` to find the latest one.

```yaml
steps:
  - name: Install spacectl
    uses: spacelift-io/setup-spacectl@main
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  - name: Deploy infrastructure
    env:
      SPACELIFT_API_ENDPOINT: https://mycorp.app.spacelift.io
      SPACELIFT_API_KEY_ID: ${{ secrets.SPACELIFT_API_KEY_ID }}
      SPACELIFT_API_KEY_SECRET: ${{ secrets.SPACELIFT_API_KEY_SECRET }}
    run: spacectl stack deploy --id my-infra-stack
```

You can optionally provide a specific version:

```yaml
steps:
  - name: Install spacectl
    uses: spacelift-io/setup-spacectl@main
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    with:
      version: v0.18.0
```

### Inputs

| Name      | Description                                                                                                   | Default  |
| --------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| `version` | Which version of `spacectl` to install. If not specified, the latest version will be installed (recommended). | `latest` |

### Outputs

| Name      | Description                                   |
| --------- | --------------------------------------------- |
| `version` | The version of `spacectl` that was installed. |

## 🛠 Contributing

Contributions are welcome! Three tips.

- If you edited a file in [`./src`](./src) folder, make sure you format it with `npm run format` and build it with `npm run build`. The Action uses the output of the build (`dist/index.js`) as its entry point so contributors must **manually** build it.

- If you use VS Code, it's recommended to install the [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension to automatically format your code on save.

- In order to have a nice changelog in the release section, please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.
