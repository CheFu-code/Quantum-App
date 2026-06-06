const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withAndroidReleaseHardening(config) {
  return withDangerousMod(config, [
    "android",
    async (pluginConfig) => {
      const androidRoot = pluginConfig.modRequest.platformProjectRoot;

      await patchGradleProperties(path.join(androidRoot, "gradle.properties"));
      await patchAppBuildGradle(path.join(androidRoot, "app", "build.gradle"));
      await patchProguardRules(
        path.join(androidRoot, "app", "proguard-rules.pro"),
      );

      return pluginConfig;
    },
  ]);
};

async function patchGradleProperties(filePath) {
  let contents = await readText(filePath);
  contents = upsertProperty(
    contents,
    "android.enableMinifyInReleaseBuilds",
    "true",
  );
  contents = upsertProperty(
    contents,
    "android.enableShrinkResourcesInReleaseBuilds",
    "true",
  );
  contents = upsertProperty(contents, "android.enableBundleCompression", "true");
  contents = upsertProperty(contents, "EX_DEV_CLIENT_NETWORK_INSPECTOR", "false");
  await fs.promises.writeFile(filePath, contents);
}

async function patchAppBuildGradle(filePath) {
  let contents = await readText(filePath);

  if (!contents.includes('hermesFlags = ["-O"]')) {
    contents = contents.replace(
      /(\s*\/\/ hermesFlags = \["-O", "-output-source-map"\]\r?\n)/,
      '$1    hermesFlags = ["-O"]\n    extraPackagerArgs = ["--minify", "true"]\n',
    );
  }

  if (!contents.includes("def releaseStoreFilePath =")) {
    contents = contents.replace(
      /(def jscFlavor = '.*?'\r?\n)/,
      `$1def releaseStoreFilePath = findProperty('QUANTUM_UPLOAD_STORE_FILE') ?: System.getenv('QUANTUM_UPLOAD_STORE_FILE')
def releaseStorePassword = findProperty('QUANTUM_UPLOAD_STORE_PASSWORD') ?: System.getenv('QUANTUM_UPLOAD_STORE_PASSWORD')
def releaseKeyAlias = findProperty('QUANTUM_UPLOAD_KEY_ALIAS') ?: System.getenv('QUANTUM_UPLOAD_KEY_ALIAS')
def releaseKeyPassword = findProperty('QUANTUM_UPLOAD_KEY_PASSWORD') ?: System.getenv('QUANTUM_UPLOAD_KEY_PASSWORD')
def hasReleaseSigning = releaseStoreFilePath && releaseStorePassword && releaseKeyAlias && releaseKeyPassword
def hasInjectedSigning = findProperty('android.injected.signing.store.file') != null
def requestedReleaseBuild = gradle.startParameter.taskNames.any { it.toLowerCase().contains("release") }
`,
    );
  }

  if (!contents.includes("signingConfigs.release")) {
    contents = contents.replace(
      /(signingConfigs\s*\{\s*debug\s*\{[\s\S]*?\n\s*\}\r?\n)(\s*\})/,
      `$1        release {
            if (hasReleaseSigning) {
                storeFile file(releaseStoreFilePath)
                storePassword releaseStorePassword
                keyAlias releaseKeyAlias
                keyPassword releaseKeyPassword
            }
        }
$2`,
    );
  }

  contents = contents.replace(
    /release\s*\{\s*\/\/ Caution![\s\S]*?signingConfig signingConfigs\.debug/,
    `release {
            if (hasReleaseSigning) {
                signingConfig signingConfigs.release
            } else if (requestedReleaseBuild && !hasInjectedSigning) {
                throw new GradleException("Release signing credentials are required. Set QUANTUM_UPLOAD_* properties or use android.injected.signing.* in CI.")
            }`,
  );

  await fs.promises.writeFile(filePath, contents);
}

async function patchProguardRules(filePath) {
  const rules = `# Production hardening. R8 already obfuscates/shrinks with minifyEnabled=true;
# these rules remove noncritical Android Log calls and avoid leaking original source names.
-assumenosideeffects class android.util.Log {
    public static int d(...);
    public static int i(...);
    public static int v(...);
}
-renamesourcefileattribute SourceFile
`;
  const contents = await readText(filePath);

  if (contents.includes("-renamesourcefileattribute SourceFile")) return;
  await fs.promises.writeFile(filePath, `${contents.trimEnd()}\n\n${rules}`);
}

function upsertProperty(contents, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${escapeRegExp(key)}=.*$`, "m");
  if (pattern.test(contents)) return contents.replace(pattern, line);
  return `${contents.trimEnd()}\n${line}\n`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function readText(filePath) {
  return fs.promises.readFile(filePath, "utf8");
}
