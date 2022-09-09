const core = require("@actions/core");
const tc = require("@actions/tool-cache");
const os = require("os");
const { Octokit } = require("@octokit/action");
const path = require("path");

const octokit = new Octokit();
const downloadURL = "https://github.com/spacelift-io/spacectl/releases/download";

async function getBinaryFromCacheOrDownload() {
  const version = await getVersion();
  const arch = getArchitecture();

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

  await cacheFolder(extractedFolder, version, arch);

  return extractedFolder;
}

async function cacheFolder(extractedFolder, version, arch) {
  const cachedPath = await tc.cacheDir(extractedFolder, "spacectl", version, arch);

  core.info(`Cached Spacectl to ${cachedPath}`);
}

async function getAssetURL(version, arch) {
  const versionWithoutLeadingV = version.substring(1);
  const platform = getPlatform();

  return `${downloadURL}/${version}/spacectl_${versionWithoutLeadingV}_${platform}_${arch}.zip`;
}

async function getVersion() {
  let version = core.getInput("version");

  // If version is specified, let's prepend a "v" to it
  if (version && version[0] !== "v") {
    version = `v${version}`;
  }

  // If version is not specified, we default to the latest
  if (!version || version === "latest") {
    version = await getLatestVersion();
  }

  core.info(`Installing version ${version} of Spacectl`);

  return version;
}

async function getLatestVersion() {
  const releaseResponse = await octokit.repos.listReleases({
    owner: "spacelift-io",
    repo: "spacectl",
  });
  const releaseList = releaseResponse.data;

  if (!releaseList) {
    const errMsg = "Could not find any releases for Spacectl";
    core.setFailed(errMsg);
    throw new Error(errMsg);
  }

  return releaseList[0].tag_name;
}

// Copy-pasta of:
// https://github.com/actions/setup-go/blob/30b9ddff1180797dbf0efc06837929f98bdf7af7/src/system.ts
function getPlatform() {
  let plat = os.platform().toString();

  if (plat === "win32") {
    plat = "windows";
  }

  return plat;
}

// Copy-pasta of:
// https://github.com/actions/setup-go/blob/30b9ddff1180797dbf0efc06837929f98bdf7af7/src/system.ts
function getArchitecture() {
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

module.exports = getBinaryFromCacheOrDownload;
