import { FilesetResolver, HandLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import { clasificar, Estabilizador } from "./signs.js";
import { AREAS, PREGUNTAS, CARRERAS } from "./data.js";

const MODELO_LOCAL = "./models/hand_landmarker.task";
const MODELO_REMOTO =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const $ = (id) => document.getElementById(id);
const video = $("video");
const lienzo = $("lienzo");
const ctx = lienzo.getContext("2d");
const dibujo = new DrawingUtils(ctx);
const CIRC = 2 * Math.PI * 44;

let detector = null;
let corriendo = false;
let ultimoTiempo = -1;
let indice = 0;
let respuestas = [];
let bloqueado = false;
let debug = false;
const estabilizador = new Estabilizador();

// ---------- Pantallas ----------
function mostrar(id) {
  document.querySelectorAll(".pantalla").forEach((p) => p.classList.toggle("activa", p.id === id));
}

// ---------- Carga de MediaPipe ----------
async function rutaModelo() {
  try {
    const r = await fetch(MODELO_LOCAL, { method: "HEAD" });
    if (r.ok) return MODELO_LOCAL;
  } catch {}
  return MODELO_REMOTO;
}

async function crearDetector() {
  const vision = await FilesetResolver.forVisionTasks("./wasm");
  const modelAssetPath = await rutaModelo();
  const opts = (delegate) => ({
    baseOptions: { modelAssetPath, delegate },
    runningMode: "VIDEO",
    numHands: 1,
    minHandDetectionConfidence: 0.6,
    minTrackingConfidence: 0.5,
  });
  try {
    return await HandLandmarker.createFromOptions(vision, opts("GPU"));
  } catch {
    return await HandLandmarker.createFromOptions(vision, opts("CPU"));
  }
}

async function iniciarCamara() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();
}

function detenerCamara() {
  corriendo = false;
  video.srcObject?.getTracks().forEach((t) => t.stop());
  video.srcObject = null;
}

// ---------- Bucle de detección ----------
function bucle() {
  if (!corriendo) return;
  if (video.readyState >= 2 && video.currentTime !== ultimoTiempo) {
    ultimoTiempo = video.currentTime;
    if (lienzo.width !== video.videoWidth) {
      lienzo.width = video.videoWidth;
      lienzo.height = video.videoHeight;
    }
    const res = detector.detectForVideo(video, performance.now());
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);

    let letra = null;
    if (res.landmarks?.length) {
      const lm = res.landmarks[0];
      dibujo.drawConnectors(lm, HandLandmarker.HAND_CONNECTIONS, { color: "#f4b63f", lineWidth: 4 });
      dibujo.drawLandmarks(lm, { color: "#ffffff", radius: 3 });
      const r = clasificar(res.worldLandmarks?.[0] ?? lm);
      letra = r.letra;
      if (debug) $("debug").textContent = JSON.stringify({ letra, ...r.m }, null, 1);
    } else if (debug) {
      $("debug").textContent = "sin mano";
    }
    procesar(letra);
  }
  requestAnimationFrame(bucle);
}

function procesar(letraCruda) {
  if (bloqueado) return;
  const { letra, progreso, confirmada } = estabilizador.actualizar(letraCruda);

  $("letraDetectada").textContent = letra ?? "✋";
  $("anillo").style.strokeDashoffset = CIRC * (1 - progreso);
  document.querySelectorAll(".opcion").forEach((o) => o.classList.toggle("viendo", o.dataset.letra === letra));

  if (confirmada) responder(letra);
}

// ---------- Test ----------
function pintarPregunta() {
  const p = PREGUNTAS[indice];
  $("numPregunta").textContent = `Pregunta ${indice + 1} de ${PREGUNTAS.length}`;
  $("textoPregunta").textContent = p.texto;
  $("barra").style.width = `${(indice / PREGUNTAS.length) * 100}%`;
  $("opciones").innerHTML = "";
  for (const [letra, op] of Object.entries(p.opciones)) {
    const b = document.createElement("button");
    b.className = "opcion";
    b.dataset.letra = letra;
    b.innerHTML = `<b>${letra}</b><span>${op.texto}</span>`;
    b.onclick = () => !bloqueado && responder(letra); // respaldo táctil
    $("opciones").appendChild(b);
  }
  $("detectada").classList.remove("lista");
  $("anillo").style.strokeDashoffset = CIRC;
  estabilizador.reset();
}

function responder(letra) {
  bloqueado = true;
  respuestas.push(letra);
  navigator.vibrate?.(80);
  $("detectada").classList.add("lista");
  $("letraDetectada").textContent = letra;
  document.querySelector(`.opcion[data-letra="${letra}"]`)?.classList.add("elegida");

  setTimeout(() => {
    indice++;
    bloqueado = false;
    if (indice < PREGUNTAS.length) pintarPregunta();
    else terminar();
  }, 900);
}

function terminar() {
  detenerCamara();
  const puntos = Object.fromEntries(Object.keys(AREAS).map((a) => [a, 0]));
  respuestas.forEach((letra, i) => {
    for (const [area, n] of Object.entries(PREGUNTAS[i].opciones[letra].puntos)) puntos[area] += n;
  });
  const ranking = Object.keys(puntos).sort((a, b) => puntos[b] - puntos[a]);
  const [primera, segunda] = ranking;

  $("areaPrincipal").textContent = AREAS[primera];
  $("areaSecundaria").textContent = `También tienes afinidad con ${AREAS[segunda]}. Estas carreras podrían ser para ti:`;

  const lista = $("listaCarreras");
  lista.innerHTML = "";
  const vistas = new Set();
  for (const area of [primera, segunda]) {
    const nuevas = (CARRERAS[area] ?? []).filter((c) => !vistas.has(c.nombre));
    if (!nuevas.length) continue;
    const g = document.createElement("p");
    g.className = "grupo";
    g.textContent = AREAS[area];
    lista.appendChild(g);
    for (const c of nuevas) {
      vistas.add(c.nombre);
      const d = document.createElement("div");
      d.className = "carrera";
      d.innerHTML = `<small>${c.tipo}</small><p>${c.nombre}</p>`;
      lista.appendChild(d);
    }
  }
  mostrar("resultado");
}

async function comenzar() {
  const btn = $("btnComenzar");
  btn.disabled = true;
  try {
    $("estadoCarga").textContent = "Cargando detector de manos…";
    detector ??= await crearDetector();
    $("estadoCarga").textContent = "Abriendo cámara…";
    await iniciarCamara();
    $("estadoCarga").textContent = "";
    indice = 0;
    respuestas = [];
    mostrar("test");
    pintarPregunta();
    corriendo = true;
    bucle();
  } catch (e) {
    console.error(e);
    $("estadoCarga").textContent =
      e.name === "NotAllowedError"
        ? "Necesitamos permiso de cámara para leer tus señas."
        : `No se pudo iniciar: ${e.message}`;
  } finally {
    btn.disabled = false;
  }
}

$("btnComenzar").onclick = comenzar;
$("btnReiniciar").onclick = comenzar;
$("btnDebug").onclick = () => {
  debug = !debug;
  $("debug").classList.toggle("oculto", !debug);
};
