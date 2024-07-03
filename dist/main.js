#!/usr/bin/env node

// lib/cli.js
import { spawn } from "child_process";

// index.js
import logSymbols2 from "log-symbols";

// lib/install.js
import path2 from "path";
import fs2 from "fs";
import { fileURLToPath as fileURLToPath2 } from "url";
import downloader from "careful-downloader";
import logSymbols from "log-symbols";

// lib/utils.js
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import { readPackageUpSync } from "read-pkg-up";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
function getPkgVersion() {
  const { packageJson } = readPackageUpSync({ cwd: __dirname });
  return packageJson.hugoVersion || packageJson.version;
}
function getReleaseUrl(version, filename) {
  return `https://github.com/gohugoio/hugo/releases/download/v${version}/${filename}`;
}
function getBinFilename() {
  return process.platform === "win32" ? "hugo.exe" : "hugo";
}
function getBinPath() {
  return path.join(
    __dirname,
    "..",
    "vendor",
    getBinFilename(),
  );
}
function getBinVersion(bin) {
  const stdout = execFileSync(bin, ["version"]);
  return stdout.toString().trim();
}
function doesBinExist(bin) {
  try {
    if (fs.existsSync(bin))
      return true;
  } catch (error) {
    if (error.code !== "ENOENT")
      throw error;
    return false;
  }
}
function getReleaseFilename(version) {
  const { platform, arch } = process;
  const filename = (
    // macOS: as of 0.102.0, binaries are universal
    platform === "darwin" && arch === "x64" ? `hugo_extended_${version}_darwin-universal.tar.gz` : platform === "darwin" && arch === "arm64" ? `hugo_extended_${version}_darwin-universal.tar.gz` : (
      // Windows
      platform === "win32" && arch === "x64" ? `hugo_extended_${version}_windows-amd64.zip` : platform === "win32" && arch === "arm64" ? `hugo_${version}_windows-arm64.zip` : (
        // Linux
        platform === "linux" && arch === "x64" ? `hugo_extended_${version}_linux-amd64.tar.gz` : platform === "linux" && arch === "arm64" ? `hugo_extended_${version}_linux-arm64.tar.gz` : (
          // FreeBSD
          platform === "freebsd" && arch === "x64" ? `hugo_${version}_freebsd-amd64.tar.gz` : (
            // OpenBSD
            platform === "openbsd" && arch === "x64" ? `hugo_${version}_openbsd-amd64.tar.gz` : (
              // not gonna work :(
              null
            )
          )
        )
      )
    )
  );
  return filename;
}
function getChecksumFilename(version) {
  return `hugo_${version}_checksums.txt`;
}
function isExtended(releaseFile) {
  return releaseFile.startsWith("hugo_extended_");
}

// lib/install.js
const __dirname2 = path2.dirname(fileURLToPath2(import.meta.url));
async function install() {
  try {
    const version = getPkgVersion();
    const releaseFile = getReleaseFilename(version);
    const checksumFile = getChecksumFilename(version);
    const binFile = getBinFilename();
    if (!releaseFile)
      throw new Error(`Are you sure this platform is supported? See: https://github.com/gohugoio/hugo/releases/tag/v${version}`);
    if (!isExtended(releaseFile))
      console.warn(`${logSymbols.info} Hugo Extended isn't supported on this platform, downloading vanilla Hugo instead.`);
    const download = await downloader(getReleaseUrl(version, releaseFile), {
      checksumUrl: getReleaseUrl(version, checksumFile),
      filename: releaseFile,
      destDir: path2.join(__dirname2, "..", "vendor"),
      algorithm: "sha256",
      extract: true,
    });
    const installedToPath = path2.join(download, binFile);
    fs2.chmodSync(installedToPath, 493);
    console.info(`${logSymbols.success} Hugo installed successfully!`);
    console.info(getBinVersion(installedToPath));
    return installedToPath;
  } catch (error) {
    console.error(`${logSymbols.error} Hugo installation failed. :(`);
    throw error;
  }
}
const install_default = install;

// index.js
const hugo = async () => {
  const bin = getBinPath();
  if (!doesBinExist(bin)) {
    console.info(`${logSymbols2.info} Hugo is missing, reinstalling now...`);
    await install_default();
  }
  return bin;
};
const hugo_extended_default = hugo;

// lib/cli.js
(async () => {
  try {
    const args = process.argv.slice(2);
    const bin = await hugo_extended_default();
    console.log("Initialized 'hugo-extended' Node CLI.");
    console.log(`##[cmd] "${bin}" ${args.join(" ")}`);
    spawn(bin, args, { stdio: "inherit" }).on("exit", (code) => {
      process.exitCode = code;
    });
  } catch (error) {
    console.error(`Failed to initialize 'hugo-extended' Node CLI. ${error.message}`);
  }
})();
