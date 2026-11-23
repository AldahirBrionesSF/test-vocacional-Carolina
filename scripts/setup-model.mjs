// Copia los archivos WASM de MediaPipe y descarga el modelo de manos a /public
// para que la app funcione SIN internet dentro del celular.
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wasmSrc = join(root, "node_modules/@mediapipe/tasks-vision/wasm");
const wasmDst = join(root, "public/wasm");
const modelDir = join(root, "public/models");
const modelPath = join(modelDir, "hand_landmarker.task");
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

if (existsSync(wasmSrc)) {
  cpSync(wasmSrc, wasmDst, { recursive: true });
  console.log("✔ WASM de MediaPipe copiado a public/wasm");
}

mkdirSync(modelDir, { recursive: true });
if (existsSync(modelPath)) {
  console.log("✔ Modelo de manos ya existe");
} else {
  try {
    console.log("↓ Descargando modelo de manos…");
    const res = await fetch(MODEL_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(modelPath, Buffer.from(await res.arrayBuffer()));
    console.log("✔ Modelo guardado en public/models/hand_landmarker.task");
  } catch (e) {
    console.warn(
      `⚠ No se pudo descargar el modelo (${e.message}). La app lo intentará bajar de internet al abrirse.\n` +
        `  O descárgalo a mano desde:\n  ${MODEL_URL}\n  y guárdalo en public/models/hand_landmarker.task`
    );
  }
}
