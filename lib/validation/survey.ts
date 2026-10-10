import { z } from "zod";

export const surveySchema = z.object({
  situacion: z.enum([
    "Soy madre primeriza y mi bebé ya nació",
    "Soy padre primerizo y mi bebé ya nació",
    "Estoy esperando a mi primer bebé",
    "Otra situación"
  ]),
  edad: z.enum([
    "18 a 24 años",
    "25 a 34 años",
    "35 a 44 años",
    "45 años o más",
    "Prefiero no responder"
  ]).optional(),
  conocimiento_marca: z.enum([
    "Sí, la conozco",
    "La había escuchado nombrar",
    "No la conocía"
  ]),

  importancia_opinion: z.coerce.number().min(1).max(5),
  consulta_compra: z.enum([
    "Pareja",
    "Familiares",
    "Amigos u otros padres",
    "Personas que publican experiencias de compra en redes sociales",
    "No suelo consultar a otras personas",
    "Otro tipo de fuente"
  ]),
  factor_decision: z.enum([
    "Precio",
    "Calidad y materiales",
    "Comodidad",
    "Recomendación de alguien de confianza",
    "Marca",
    "Diseño"
  ]),

  interes_compra: z.coerce.number().min(1).max(5),
  confianza_publicidad: z.coerce.number().min(1).max(5),
  influencia_publicidad: z.coerce.number().min(1).max(5),
  elemento_influyente: z.enum([
    "Fotografía",
    "Precio",
    "Características",
    "Opinión o recomendación de otra persona",
    "Marca SUAVECITO",
    "Ninguno en particular",
    "Otro elemento"
  ]),
  probabilidad_consideracion: z.coerce.number().min(1).max(5),

  cambio_decision: z.enum([
    "Sí, probablemente la consideraría más",
    "Tal vez, dependería de la recomendación",
    "No cambiaría mi decisión",
    "No estoy seguro/a"
  ]),
  tipo_recomendacion: z.enum([
    "Experiencia de otro padre o madre",
    "Opinión de un familiar o amigo",
    "Recomendación de un especialista",
    "Comentarios de compradores en internet",
    "Prefiero evaluar el producto por mi cuenta"
  ]),
  ayuda_confianza: z.enum([
    "Una experiencia real de compra",
    "Información sobre calidad y materiales",
    "Fotografías reales del producto",
    "Opiniones de varios compradores",
    "Información verificable sobre el producto"
  ]),
  diseno_favorito: z.enum([
    "DISEÑO 1",
    "DISEÑO 2",
    "DISEÑO 3"
  ])
});

export type SurveyFormValues = z.infer<typeof surveySchema>;
