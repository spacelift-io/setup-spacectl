import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as github from "@actions/github";
import os from "os";
import path from "path";

const octokit = github.getOctokit(core.getInput("github-token"), {
  baseUrl: "https://api.github.com",
});
const downloadURL = "https://github.com/spacelift-io/spacectl/releases/download";

/**
 * Downloads the Spacectl binary from GitHub.
 * It also caches it, so that subsequent runs of the action can use the cached version.
 * @returns The path of the extracted binary.
 */
export async function installAndGetFolder(): Promise<string> {
  const version = await getVersion();
  const arch = getArchitecture();
  core.setOutput("version", version);

  const cached = tc.find("spacectl", version, arch);
  if (cached) {
    core.info(`Found cached Spacectl at ${cached}`);
    return cached;
  }

  const assetURL = await getAssetURL(version, arch);
  core.info(`Downloading Spacectl from ${assetURL}`);

  const zipPath = await tc.downloadTool(assetURL);
  const extractedFolder = await tc.extractZip(zipPath, path.join(os.homedir(), "spacectl"));
  core.info(`Extracted Spacectl to ${extractedFolder}`);

  await saveToCache(extractedFolder, version, arch);

  return extractedFolder;
}

/**
 * Saves the extracted binary's parent folder to the cache.
 */
async function saveToCache(extractedFolder: string, version: string, arch: string): Promise<void> {
  const cachedPath = await tc.cacheDir(extractedFolder, "spacectl", version, arch);

  core.info(`Cached Spacectl to ${cachedPath}`);
}

/**
 * Returns the URL of the Spacectl zip file for the given version and architecture.
 * @returns The URL of the Spacectl zip file.
 * @example "https://github.com/spacelift-io/spacectl/releases/download/v0.12.0/spacectl_0.12.0_linux_arm64.zip"
 */
async function getAssetURL(version: string, arch: string): Promise<string> {
  const versionWithoutLeadingV = version.substring(1);
  const platform = getPlatform();

  return `${downloadURL}/${version}/spacectl_${versionWithoutLeadingV}_${platform}_${arch}.zip`;
}

/**
 * Determines the version of Spacectl to download.
 * If the user didn't explicitly provide any, we'll use the latest version.
 * @returns The version of Spacectl to download.
 * @example "v0.1.0"
 */
async function getVersion(): Promise<string> {
  let version = core.getInput("version");

  // If version is specified, let's prepend a "v" to it
  if (version && version !== "latest" && version[0] !== "v") {
    version = `v${version}`;
  }

  // If version is not specified, we default to the latest
  if (!version || version === "latest") {
    version = await getLatestVersion();
  }

  core.info(`Installing version ${version} of Spacectl`);

  return version;
}

/**
 * Gets the latest version of Spacectl from GitHub.
 * We filter out drafts and pre-releases.
 * @returns The latest version of Spacectl with a "v" prefix.
 * @example "v0.1.0"
 */
async function getLatestVersion(): Promise<string> {
  const releaseResponse = await octokit.rest.repos.listReleases({
    owner: "spacelift-io",
    repo: "spacectl",
  });
  const releaseList = releaseResponse.data;

  if (!releaseList?.length) {
    const errMsg = "Could not find any releases for Spacectl. GitHub outage perhaps? https://www.githubstatus.com/";
    core.setFailed(errMsg);
    throw new Error(errMsg);
  }

  const filteredReleases = releaseList.filter((release) => !release.draft && !release.prerelease);

  return filteredReleases[0].tag_name;
}

/**
 * Copy-pasta of:
 * https://github.com/actions/setup-go/blob/30b9ddff1180797dbf0efc06837929f98bdf7af7/src/system.ts
 * @returns The platform name.
 * @example "linux"
 */
function getPlatform(): string {
  let platform = os.platform().toString();

  if (platform === "win32") {
    platform = "windows";
  }

  return platform;
}

/**
 * Copy-pasta of:
 * https://github.com/actions/setup-go/blob/30b9ddff1180797dbf0efc06837929f98bdf7af7/src/system.ts
 * @returns The architecture name.
 * @example "amd64"
 */
function getArchitecture(): string {
  let arch = os.arch();

  switch (arch) {
    case "x64":
      arch = "amd64";
      break;
    case "x32":
      arch = "386";
      break;
    case "arm":
      arch = "armv6l";
      break;
  }

  return arch;
}
