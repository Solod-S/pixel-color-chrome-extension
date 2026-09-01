import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import archiver from "archiver";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

async function runPackage() {
  // 1. Run build
  console.log("Building extension for packaging...");
  execSync("node scripts/build.js", { cwd: rootDir, stdio: "inherit" });

  // 2. Read version from manifest
  let version = "1.0.0";
  const manifestPath = path.resolve(rootDir, "public/manifest.json");
  try {
    if (fs.existsSync(manifestPath)) {
      const content = fs.readFileSync(manifestPath, "utf8").trim();
      if (content) {
        const manifest = JSON.parse(content);
        version = manifest.version || "1.0.0";
      }
    }
  } catch (e) {
    console.warn(
      "Could not read version from manifest, defaulting to 1.0.0:",
      e.message,
    );
  }

  // 3. Ensure release directory exists
  const releaseDir = path.resolve(rootDir, "release");
  if (!fs.existsSync(releaseDir)) {
    fs.mkdirSync(releaseDir, { recursive: true });
  }

  const zipPath = path.resolve(releaseDir, `pixel-color-v${version}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  await new Promise((resolve, reject) => {
    output.on("close", () => {
      const sizeKb = (archive.pointer() / 1024).toFixed(2);
      console.log(`\n✓ Successfully packaged release zip:`);
      console.log(`-> ${zipPath} (${sizeKb} KB)`);
      resolve();
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(output);

    const distDir = path.resolve(rootDir, "dist");
    archive.directory(distDir, false);
    archive.finalize();
  });
}

runPackage().catch((err) => {
  console.error("Packaging failed:", err);
  process.exit(1);
});
