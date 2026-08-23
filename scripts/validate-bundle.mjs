import { validateBundlePath } from "@tpgames/core-manifest/node";

const input = process.argv[2] ?? "./dist";
const reports = validateBundlePath(input, { supportedSdkVersion: "1.0.0" });
let failed = false;
for (const report of reports) {
  if (report.issues.length === 0) {
    console.log(`✓ ${report.location}`);
    continue;
  }
  failed = true;
  console.error(`✗ ${report.location}`);
  for (const issue of report.issues) console.error(`  ${issue.path}: ${issue.message}`);
}
if (failed) process.exitCode = 1;
