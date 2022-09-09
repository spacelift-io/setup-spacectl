const core = require("@actions/core");
const getBinaryFromCacheOrDownload = require("./install");

async function run() {
  let binaryFolder = await getBinaryFromCacheOrDownload();
  core.addPath(binaryFolder);

  core.info("Added spacectl to PATH: " + binaryFolder);
}

run();
