// Reconoce las letras A, B y C de la Lengua de Señas Mexicana (LSM)
// a partir de los 21 puntos 3D de la mano que entrega MediaPipe.
//
//  Puntos: 0 muñeca | pulgar 1-4 | índice 5-8 | medio 9-12 | anular 13-16 | meñique 17-20
//
//  A → puño cerrado, pulgar estirado pegado al costado del índice
//  B → cuatro dedos estirados y juntos, pulgar doblado sobre la palma
//  C → dedos y pulgar curvos formando una "C" (hueco entre pulgar e índice)
//
// Los umbrales se pueden ajustar en UMBRALES (activa el modo 🔧 en la app para ver los valores).

export const UMBRALES = {
  dedoRecto: 300, // suma de ángulos en PIP+DIP (≈360 = totalmente recto)
  dedoCerrado: 215, // por debajo = dedo doblado tipo puño
  pulgarPegadoB: 0.75, // distancia punta-pulgar → base del meñique / tamaño palma (B)
  pulgarLateralA: 0.95, // posición del pulgar en el eje meñique→índice (≥1 = al costado del índice) (A)
  aperturaCmin: 0.35, // hueco pulgar-índice / tamaño palma (C)
  aperturaCmax: 1.3,
};

const DEDOS = [
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
  [17, 18, 19, 20],
];

const sub = (a, b) => [a.x - b.x, a.y - b.y, a.z - b.z];
const len = (v) => Math.hypot(v[0], v[1], v[2]);
const dist = (a, b) => len(sub(a, b));

function angulo(a, b, c) {
  // ángulo en b (grados)
  const u = sub(a, b);
  const v = sub(c, b);
  const cos = (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) / (len(u) * len(v) || 1);
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

/** Devuelve { letra: "A"|"B"|"C"|null, m: métricas } */
export function clasificar(lm) {
  if (!lm || lm.length < 21) return { letra: null, m: null };

  const palma = dist(lm[0], lm[9]) || 1;
  const rectitud = DEDOS.map(([m, p, d, t]) => angulo(lm[m], lm[p], lm[d]) + angulo(lm[p], lm[d], lm[t]));
  const prom = rectitud.reduce((s, x) => s + x, 0) / 4;
  const pulgarMenique = dist(lm[4], lm[17]) / palma;
  const pulgarMedio = dist(lm[4], lm[9]) / palma;
  const pulgarIndice = dist(lm[4], lm[8]) / palma;
  const anguloPulgar = angulo(lm[2], lm[3], lm[4]);
  // Qué tan "afuera" está el pulgar: 0 = sobre el meñique, 1 = sobre el índice, >1 = al costado del índice
  const eje = sub(lm[5], lm[17]);
  const rel = sub(lm[4], lm[17]);
  const pulgarLateral = (eje[0] * rel[0] + eje[1] * rel[1] + eje[2] * rel[2]) / (len(eje) ** 2 || 1);

  const m = {
    dedos: rectitud.map((x) => Math.round(x)),
    prom: Math.round(prom),
    pulgarMenique: +pulgarMenique.toFixed(2),
    pulgarMedio: +pulgarMedio.toFixed(2),
    pulgarIndice: +pulgarIndice.toFixed(2),
    anguloPulgar: Math.round(anguloPulgar),
    pulgarLateral: +pulgarLateral.toFixed(2),
  };
  const U = UMBRALES;

  const todosRectos = rectitud.every((x) => x > U.dedoRecto);
  const todosCerrados = rectitud.every((x) => x < U.dedoCerrado);
  const todosCurvos = rectitud.every((x) => x >= U.dedoCerrado - 15 && x <= U.dedoRecto + 15);

  // B: dedos estirados + pulgar doblado hacia la palma
  if (todosRectos && pulgarMenique < U.pulgarPegadoB) return { letra: "B", m };

  // A: puño + pulgar estirado al costado (no encima de los dedos)
  if (todosCerrados && pulgarLateral > U.pulgarLateralA && anguloPulgar > 140) return { letra: "A", m };

  // C: dedos curvos + hueco entre pulgar e índice
  if (
    todosCurvos &&
    prom > U.dedoCerrado + 10 &&
    prom < U.dedoRecto - 5 &&
    pulgarIndice > U.aperturaCmin &&
    pulgarIndice < U.aperturaCmax
  )
    return { letra: "C", m };

  return { letra: null, m };
}

/**
 * Confirma una letra solo si se sostiene un tiempo (evita lecturas falsas).
 * Tolera parpadeos cortos de la detección.
 */
export class Estabilizador {
  constructor({ sostener = 1200, tolerancia = 250, enfriamiento = 1500 } = {}) {
    Object.assign(this, { sostener, tolerancia, enfriamiento });
    this.reset();
  }
  reset() {
    this.actual = null;
    this.desde = 0;
    this.ultimaVista = 0;
    this.bloqueoHasta = performance.now() + this.enfriamiento;
  }
  /** Devuelve { letra, progreso 0..1, confirmada } */
  actualizar(letra, ahora = performance.now()) {
    if (ahora < this.bloqueoHasta) return { letra: null, progreso: 0, confirmada: false };

    if (letra) {
      if (letra !== this.actual) {
        this.actual = letra;
        this.desde = ahora;
      }
      this.ultimaVista = ahora;
    } else if (this.actual && ahora - this.ultimaVista > this.tolerancia) {
      this.actual = null;
    }
    if (!this.actual) return { letra: null, progreso: 0, confirmada: false };

    const progreso = Math.min(1, (ahora - this.desde) / this.sostener);
    if (progreso >= 1) {
      const confirmada = this.actual;
      this.reset();
      return { letra: confirmada, progreso: 1, confirmada: true };
    }
    return { letra: this.actual, progreso, confirmada: false };
  }
}
