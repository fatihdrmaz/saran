// Monorepo-uyumlu Metro yapılandırması.
// Workspace kökünü izler ve hem app hem kök node_modules'ı çözer; böylece
// @saran/* workspace paketleri (TS kaynağı) doğru bundle edilir.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
// pnpm + hoisted linker ile çakışmayı önlemek için hiyerarşik aramayı kapat
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
