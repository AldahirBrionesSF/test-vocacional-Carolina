# Test Vocacional en Lengua de Señas (LSM) 🤟

App Android: test vocacional de 4 preguntas que se responde haciendo **A, B o C en LSM** frente a la cámara.
Detección de mano con **MediaPipe** (funciona sin internet), empaquetada como APK con **Capacitor**.

## Requisitos
- [Node.js 22+](https://nodejs.org)
- VS Code
- Para generar la APK en tu compu: **JDK 21** + **Android SDK** (lo más fácil: instalar Android Studio una vez solo para que baje el SDK).
  ¿No quieres instalar eso? Usa la opción de GitHub Actions (abajo).

## 1. Probar en la compu (con tu webcam)
```bash
npm install        # también descarga el modelo de manos
npm run dev
```
Abre `http://localhost:5173` en Chrome. Toca 🔧 para ver los valores del detector en vivo.

## 2. Generar la APK
Primera vez:
```bash
npm run android:init
```
Luego, cada vez que cambies algo:
```bash
npm run apk:win    # Windows
npm run apk        # Mac / Linux
```
La APK queda en `android/app/build/outputs/apk/debug/app-debug.apk` → pásala al cel e instálala.

### Opción sin Android SDK: GitHub Actions
1. Sube la carpeta a un repo de GitHub (rama `main`).
2. Ve a la pestaña **Actions** → espera a que termine "Build APK".
3. Descarga el artefacto **test-vocacional-apk**.

## Editar preguntas y carreras
Todo está en **`src/data.js`**:
- `PREGUNTAS`: texto y opciones A/B/C, cada opción suma puntos a áreas.
- `CARRERAS`: lista por área con `tipo: "Licenciatura"` o `"Ingeniería"`. Ya tiene las 11 carreras de la Universidad Carolina.

## Ajustar la detección de señas
En **`src/signs.js`** → `UMBRALES`. Activa 🔧 en la app, haz cada seña y mira los números:
- `dedos`: rectitud de cada dedo (≈360 recto, ≈180 doblado).
- `pulgarMenique`, `pulgarIndice`: distancias del pulgar normalizadas al tamaño de la palma.
- `pulgarLateral`: dónde está el pulgar (0 = lado del meñique, 1 = índice, >1 = al costado del índice, como en la A).

| Seña | Regla |
|---|---|
| **A** | 4 dedos cerrados + pulgar estirado al costado |
| **B** | 4 dedos rectos + pulgar doblado sobre la palma |
| **C** | dedos curvos + hueco entre pulgar e índice |

Tip: también se puede tocar la opción en pantalla como respaldo.

## Estructura
```
index.html            pantallas (inicio, test, resultado)
src/main.js           cámara, MediaPipe y flujo del test
src/signs.js          clasificador A/B/C + estabilizador (sostener 1.2 s)
src/data.js           preguntas, áreas y carreras  ← edita aquí
src/style.css         estilos
scripts/              descarga del modelo y permiso de cámara en Android
```
