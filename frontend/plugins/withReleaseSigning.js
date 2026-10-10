// Release signing without committing a key. `android/` is generated (prebuild), so this plugin writes the
// signing config into app/build.gradle each time. It reads frontend/keystore.properties (git-ignored):
//   storeFile=/absolute/or/relative/to/frontend/kept-release.keystore
//   storePassword=…  keyAlias=…  keyPassword=…
// Without that file, release builds stay signed with the debug key, as before (fine for the emulator,
// not for a store or a phone you'll update later). See README › Release signing.
const { withAppBuildGradle } = require("expo/config-plugins");

const MARK = "// kept: release signing (plugins/withReleaseSigning.js)";

const LOADER = `${MARK}
def keptSigning = null
def keptSigningFile = new File(rootDir, "../keystore.properties")
if (keptSigningFile.exists()) {
    keptSigning = new Properties()
    keptSigningFile.withInputStream { keptSigning.load(it) }
    ["storeFile", "storePassword", "keyAlias", "keyPassword"].each { k ->
        if (!keptSigning[k]) throw new GradleException("keystore.properties is missing " + k)
    }
    def store = new File(keptSigning["storeFile"])
    keptSigning["storeFile"] = (store.isAbsolute() ? store : new File(keptSigningFile.parentFile, keptSigning["storeFile"])).absolutePath
} else {
    logger.warn("keystore.properties not found: release builds are signed with the debug key")
}
`;

const RELEASE_CONFIG = `
        if (keptSigning != null) {
            release {
                storeFile file(keptSigning["storeFile"])
                storePassword keptSigning["storePassword"]
                keyAlias keptSigning["keyAlias"]
                keyPassword keptSigning["keyPassword"]
            }
        }`;

function apply(src) {
  if (src.includes(MARK)) return src;
  let out = src.replace(/\nandroid \{/, `\n${LOADER}\nandroid {`);
  out = out.replace(/signingConfigs \{/, `signingConfigs {${RELEASE_CONFIG}`);
  // The release build type: the debug key only when there's no keystore.properties.
  out = out.replace(/(buildTypes \{[\s\S]*?release \{[\s\S]*?)signingConfig signingConfigs\.debug/,
    "$1signingConfig keptSigning != null ? signingConfigs.release : signingConfigs.debug");
  if (out === src || !out.includes("signingConfigs.release : signingConfigs.debug")) {
    throw new Error("withReleaseSigning: app/build.gradle didn't have the expected shape");
  }
  return out;
}

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (c) => {
    c.modResults.contents = apply(c.modResults.contents);
    return c;
  });
};
module.exports.apply = apply;
