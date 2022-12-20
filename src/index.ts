import * as core from "@actions/core";
import { installAndGetFolder } from "./install";

async function run(): Promise<void> {
  const binaryFolder = await installAndGetFolder();
  core.addPath(binaryFolder);

  core.info("Added spacectl to PATH: " + binaryFolder);
}

run();
