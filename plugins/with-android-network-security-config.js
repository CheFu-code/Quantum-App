const { AndroidConfig, withAndroidManifest, withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const NETWORK_SECURITY_CONFIG = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config>
    <domain includeSubdomains="false">api.chefuinc.com</domain>
    <pin-set expiration="2028-06-06">
      <pin digest="SHA-256">MtsYZ7iqObrwKea23+rDYpyl057bSCmJXSAec1Q9JCI=</pin>
      <pin digest="SHA-256">OdSlmQD9NWJh4EbcOHBxkhygPwNSwA9Q91eounfbcoE=</pin>
      <pin digest="SHA-256">hxqRlPTu1bMS/0DITB1SSu0vd4u/8l8TjPgfaAp63Gc=</pin>
    </pin-set>
  </domain-config>

  <domain-config>
    <domain includeSubdomains="false">quantum.chefuinc.com</domain>
    <domain includeSubdomains="false">myaccount.chefuinc.com</domain>
    <pin-set expiration="2028-06-06">
      <pin digest="SHA-256">IPQM0tkpsHow75qFyseq7ekjFQww4Jfyw8PLvY8Fd6s=</pin>
      <pin digest="SHA-256">j6wqpPEXchUEzQOmim2VAznlmQ7VDvbHHMFjZ9KaQV0=</pin>
      <pin digest="SHA-256">kZwN96eHtZftBWrOZUsd6cA4es80n3NzSk/XtYz2EqQ=</pin>
      <pin digest="SHA-256">C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=</pin>
    </pin-set>
  </domain-config>
</network-security-config>
`;

module.exports = function withAndroidNetworkSecurityConfig(config) {
  config = withAndroidManifest(config, (pluginConfig) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(
      pluginConfig.modResults,
    );

    application.$["android:networkSecurityConfig"] = "@xml/network_security_config";
    application.$["android:usesCleartextTraffic"] = "false";

    return pluginConfig;
  });

  return withDangerousMod(config, [
    "android",
    async (pluginConfig) => {
      const xmlDirectory = path.join(
        pluginConfig.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "xml",
      );

      await fs.promises.mkdir(xmlDirectory, { recursive: true });
      await fs.promises.writeFile(
        path.join(xmlDirectory, "network_security_config.xml"),
        NETWORK_SECURITY_CONFIG,
      );

      return pluginConfig;
    },
  ]);
};
