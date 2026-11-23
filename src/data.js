// ============================================================
//  ✏️  EDITA AQUÍ: preguntas, áreas y carreras del test
// ============================================================

// Áreas vocacionales que suma el test
export const AREAS = {
  tecnologia: "Tecnología y software",
  industria: "Industria y movilidad",
  sostenibilidad: "Energía, ciudad y sostenibilidad",
  negocios: "Negocios y comercio",
  sociedad: "Leyes, sociedad y educación",
};

// Cada opción suma puntos a una o más áreas
export const PREGUNTAS = [
  {
    texto: "¿Qué disfrutas más hacer?",
    opciones: {
      A: { texto: "Programar, armar robots o arreglar coches", puntos: { tecnologia: 2, industria: 1 } },
      B: { texto: "Organizar, vender o manejar dinero", puntos: { negocios: 2 } },
      C: { texto: "Debatir, enseñar o ayudar a mi comunidad", puntos: { sociedad: 2 } },
    },
  },
  {
    texto: "¿Qué tema te llama más la atención?",
    opciones: {
      A: { texto: "Autos eléctricos, máquinas y fábricas", puntos: { industria: 2, tecnologia: 1 } },
      B: { texto: "Energías limpias y cuidar el planeta", puntos: { sostenibilidad: 2 } },
      C: { texto: "Leyes, política y cómo se organizan las ciudades", puntos: { sociedad: 2, sostenibilidad: 1 } },
    },
  },
  {
    texto: "¿Dónde te imaginas trabajando?",
    opciones: {
      A: { texto: "Desarrollando apps o sistemas", puntos: { tecnologia: 2, negocios: 1 } },
      B: { texto: "Diseñando edificios o proyectos de energía", puntos: { sostenibilidad: 2, industria: 1 } },
      C: { texto: "En una empresa internacional o en mi propio negocio", puntos: { negocios: 2 } },
    },
  },
  {
    texto: "¿Qué te gustaría lograr?",
    opciones: {
      A: { texto: "Mejorar cómo se produce y cómo nos movemos", puntos: { industria: 2, sostenibilidad: 1 } },
      B: { texto: "Hacer crecer empresas y comerciar con otros países", puntos: { negocios: 2, industria: 1 } },
      C: { texto: "Hacer justicia o formar a otras personas", puntos: { sociedad: 2 } },
    },
  },
];

// Carreras de la Universidad Carolina por área (una carrera puede estar en varias áreas)
const ING = "Ingeniería";
const LIC = "Licenciatura";

export const CARRERAS = {
  tecnologia: [
    { nombre: "Ingeniería en Programación", tipo: ING },
    { nombre: "Ingeniería en Mecatrónica", tipo: ING },
  ],
  industria: [
    { nombre: "Ingeniería Automotriz y Electromovilidad", tipo: ING },
    { nombre: "Ingeniería Industrial y de Sistemas", tipo: ING },
    { nombre: "Ingeniería en Mecatrónica", tipo: ING },
  ],
  sostenibilidad: [
    { nombre: "Ingeniería en Energía y Sostenibilidad", tipo: ING },
    { nombre: "Licenciatura en Arquitectura y Sostenibilidad", tipo: LIC },
    { nombre: "Licenciatura en Ciencia Política y Planeación Urbana", tipo: LIC },
  ],
  negocios: [
    { nombre: "Licenciatura en Administración y Finanzas", tipo: LIC },
    { nombre: "Licenciatura en Comercio Internacional", tipo: LIC },
    { nombre: "Ingeniería Industrial y de Sistemas", tipo: ING },
  ],
  sociedad: [
    { nombre: "Licenciatura en Derecho", tipo: LIC },
    { nombre: "Licenciatura en Ciencia Política y Planeación Urbana", tipo: LIC },
    { nombre: "Licenciatura en Educación y Desarrollo Humano", tipo: LIC },
  ],
};
