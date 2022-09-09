# setup-spacectl

[![build](https://github.com/spacelift-io/setup-spacectl/actions/workflows/test.yml/badge.svg)](https://github.com/spacelift-io/setup-spacectl/actions/workflows/test.yml)

This is a simple GitHub Action to install [spacectl](https://github.com/spacelift-io/spacectl): a utility wrapping Spacelift's [GraphQL API](https://docs.spacelift.io/integrations/api) for easy programmatic access in command-line contexts - either in manual interactive mode (in your local shell), or in a predefined CI pipeline (GitHub actions, CircleCI, Jenkins etc).

## Usage

`GITHUB_TOKEN` environment variable is a **must** because we're using it internally to list all releases of the `spacectl` to find the latest one.

```yaml
steps:
    - name: Install spacectl
      uses: spacelift-io/setup-spacectl@v0.0.1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

    - name: Deploy infrastructure
      env:
        SPACELIFT_API_KEY_ID: ${{ secrets.SPACELIFT_API_KEY_ID }}
        SPACELIFT_API_KEY_SECRET: ${{ secrets.SPACELIFT_API_KEY_SECRET }}
      run: spacectl stack deploy --id my-infra-stack
```

You can optionally provide a specific version:

```yaml
steps:
    - name: Install spacectl
      uses: spacelift-io/setup-spacectl@v0.0.1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        version: v0.12.0
```

### Inputs

| Name | Description | Default |
| --- | --- | --- |
| `version` | Version of spacectl to install. If not specified, the latest version will be installed. | `latest` |

## Contributing

Contributions are welcome!

If you edited a JavaScript file, make sure you format it with `npm run format` and build it with `npm run build`. The Action uses the output of the build (`dist/index.js`) as its entry point.
