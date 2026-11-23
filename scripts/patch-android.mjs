// Agrega el permiso de cámara al AndroidManifest generado por Capacitor.
import { readFileSync, writeFileSync, cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = join(root, "android/app/src/main/AndroidManifest.xml");
let xml = readFileSync(manifest, "utf8");

const perms = [
  '<uses-permission android:name="android.permission.CAMERA" />',
  '<uses-feature android:name="android.hardware.camera" android:required="false" />',
];
for (const p of perms) {
  if (!xml.includes(p)) xml = xml.replace("</manifest>", `    ${p}\n</manifest>`);
}
writeFileSync(manifest, xml);
console.log("✔ Permiso de cámara agregado al AndroidManifest.xml");

// Ícono y splash con el logo de la Universidad Carolina
const res = join(root, "resources/android/res");
if (existsSync(res)) {
  cpSync(res, join(root, "android/app/src/main/res"), { recursive: true });
  console.log("✔ Ícono y splash de la Universidad Carolina copiados");
}
