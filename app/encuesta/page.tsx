"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { surveySchema, SurveyFormValues } from "@/lib/validation/survey";
import { CheckCircle2, ChevronRight, ChevronLeft, ShieldCheck, Baby, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import confetti from "canvas-confetti";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxx-Pj-sHtAInvRrxyneiBVufrUXuauatgLG4dZspSGxKJDmd1SKM7YoAgYhjomJpWT/exec";

interface DisenoEstimulo {
  id: "DISEÑO 1" | "DISEÑO 2" | "DISEÑO 3";
  badge: string;
  brandType: 'generic' | 'official';
  brandLabel: string;
  title: string;
  subtitle: string;
  price: string;
  priceLabel: string;
  garments: string[];
  features: string[];
  img: string;
  accentBadge: string;
}

const DISENOS_ITEMS: DisenoEstimulo[] = [
  {
    id: "DISEÑO 1",
    badge: "DISEÑO A",
    brandType: "generic",
    brandLabel: "NIDITO BEBÉ (MARCA FICTICIA)",
    title: "Conjunto Básico de Ropa Tejida",
    subtitle: "2 prendas: Chambrita y buzo",
    price: "120.00",
    priceLabel: "Precio regular",
    garments: ["Chambrita tejida", "Buzo cómodo"],
    features: [
      "Chambrita tejida",
      "Buzo cómodo",
      "Material suave"
    ],
    img: "/images/productos/diseno1.jpg",
    accentBadge: "bg-blue-100 text-blue-800"
  },
  {
    id: "DISEÑO 2",
    badge: "DISEÑO B",
    brandType: "generic",
    brandLabel: "TEJIDITOS LÍNEA BÁSICA (MARCA FICTICIA)",
    title: "Conjunto de Ropa para Bebé",
    subtitle: "3 prendas: Chambrita, buzo y gorrito",
    price: "90.00",
    priceLabel: "Precio económico",
    garments: ["Chambrita tejida", "Buzo cómodo", "Gorrito incluido"],
    features: [
      "Chambrita tejida",
      "Buzo cómodo",
      "Gorrito incluido",
      "Tejido sintético básico económico",
      "Diseño básico"
    ],
    img: "/images/productos/diseno2.jpg",
    accentBadge: "bg-amber-100 text-amber-800"
  },
  {
    id: "DISEÑO 3",
    badge: "DISEÑO C",
    brandType: "official",
    brandLabel: "SUAVECITO OFICIAL",
    title: "Conjunto Completo Coordinado",
    subtitle: "Conjunto completo de 5 prendas",
    price: "150.00",
    priceLabel: "Conjunto completo",
    garments: ["Chambrita", "Buzo", "Gorro", "Babero", "Zapatitos tejidos"],
    features: [
      "Tejido suave y agradable al tacto",
      "Diseño coordinado para recién nacido",
      "Acabados delicados y confort",
      "Conjunto completo (5 prendas)",
      "Detalles y confección cuidados",
      "Presentación ideal para regalo",
      "Fácil cuidado y lavado"
    ],
    img: "/images/productos/diseno3.jpg",
    accentBadge: "bg-brand-sage-light text-brand-sage-dark"
  }
];

export default function EncuestaApp() {
  const [grupo, setGrupo] = useState<"A" | "B" | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(0);

  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch, trigger, setValue } = useForm<SurveyFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(surveySchema) as any,
  });

  const situacion = watch("situacion");
  const isElegible = situacion === "Soy madre primeriza y mi bebé ya nació" || situacion === "Soy padre primerizo y mi bebé ya nació";

  useEffect(() => {
    const savedGroup = sessionStorage.getItem("grupo_suavecito");
    if (savedGroup === "A" || savedGroup === "B") {
      setGrupo(savedGroup);
    } else {
      const randomGroup = Math.random() < 0.5 ? "A" : "B";
      setGrupo(randomGroup);
      sessionStorage.setItem("grupo_suavecito", randomGroup);
    }
  }, []);

  const onSubmit = async (data: SurveyFormValues) => {
    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, grupo, elegible: isElegible }),
      });
      setEnviado(true); confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 }, colors: ['#9CA986', '#F7F5F0', '#E8EDE1'] });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { title: "Contexto", fields: ["situacion", "edad", "conocimiento_marca"] },
    { title: "Preferencias", fields: ["importancia_opinion", "consulta_compra", "factor_decision"] },
    { title: "Observa los diseños", fields: ["diseno_favorito"] },
    { title: "Tus Impresiones", fields: ["interes_compra", "confianza_publicidad", "influencia_publicidad", "elemento_influyente", "probabilidad_consideracion"] },
    { title: "Influencia Social", fields: ["cambio_decision", "tipo_recomendacion", "ayuda_confianza"] }
  ];

  const handleNext = async () => {
    const fieldsToValidate = sections[step].fields as (keyof SurveyFormValues)[];
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) setStep((s) => Math.min(s + 1, sections.length - 1));
  };

  const handlePrev = () => setStep((s) => Math.max(s - 1, 0));

  // Custom UI Components
  const AppRadioGroup = ({ name, question, options }: { name: keyof SurveyFormValues, question: string, options: string[] }) => (
    <div className="mb-8">
      <label className="block text-lg font-bold text-gray-900 mb-4">{question}</label>
      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const isSelected = watch(name) === opt;
          return (
            <label key={opt} className={`relative flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'border-brand-sage bg-brand-sage-light' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
              <input type="radio" value={opt} {...register(name)} className="sr-only" />
              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${isSelected ? 'border-brand-sage' : 'border-gray-300'}`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-sage" />}
              </div>
              <span className={`text-base font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>{opt}</span>
            </label>
          );
        })}
      </div>
      {errors[name] && <p className="text-rose-500 text-sm mt-2 font-medium">{errors[name]?.message}</p>}
    </div>
  );

  const AppScaleGroup = ({ name, question, labels }: { name: keyof SurveyFormValues, question: string, labels: [string, string] }) => (
    <div className="mb-8">
      <label className="block text-lg font-bold text-gray-900 mb-6">{question}</label>
      <div className="flex justify-between items-center relative">
        <div className="absolute left-0 right-0 h-1 bg-gray-100 top-1/2 -translate-y-1/2 rounded-full z-0"></div>
        {[1, 2, 3, 4, 5].map(num => {
          const isSelected = Number(watch(name)) === num;
          return (
            <label key={num} className="relative z-10 cursor-pointer">
              <input type="radio" value={num} {...register(name)} className="sr-only" />
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all shadow-sm ${isSelected ? 'bg-brand-sage text-white scale-110 shadow-indigo-200' : 'bg-white text-gray-400 border-2 border-gray-100 hover:border-indigo-200'}`}>
                {num}
              </div>
            </label>
          );
        })}
      </div>
      <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mt-4">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </div>
      {errors[name] && <p className="text-rose-500 text-sm mt-2 font-medium text-center">{errors[name]?.message}</p>}
    </div>
  );

  if (enviado) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 bg-gray-50">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-sm w-full bg-white p-8 rounded-[2rem] shadow-xl text-center">
          <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">¡Completado!</h2>
          <p className="text-gray-500 mb-8 font-medium">Tus respuestas han sido registradas de forma segura y anónima.</p>
          <Link href="/" className="inline-block w-full bg-gray-100 text-gray-900 font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors">Cerrar</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-gray-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo-suavecito.png" alt="SUAVECITO" className="h-7 sm:h-8 w-auto object-contain" />
          <span className="hidden sm:inline-block text-xs font-bold text-gray-400 border-l border-gray-200 pl-3">
            Estudio Académico
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-gray-500">
            {Math.round(((step + 1) / sections.length) * 100)}%
          </span>
          <div className="text-xs sm:text-sm font-black text-brand-sage bg-brand-sage-light px-3 py-1 rounded-full">
            Sección {step + 1} de {sections.length}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-100 overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-brand-sage to-emerald-500 rounded-r-full"
          initial={{ width: "0%" }}
          animate={{ width: `${((step + 1) / sections.length) * 100}%` }}
          transition={{ duration: 0.35 }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32">
        <div className={`mx-auto transition-all duration-300 ${step === 2 ? 'max-w-6xl w-full' : 'max-w-md w-full'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xs font-black text-brand-sage-dark uppercase tracking-widest mb-6">{sections[step].title}</h2>

              {step === 0 && (
                <div className="space-y-6">
                  <AppRadioGroup name="situacion" question="¿Cuál es tu situación actual?" options={["Soy madre primeriza y mi bebé ya nació", "Soy padre primerizo y mi bebé ya nació", "Estoy esperando a mi primer bebé", "Otra situación"]} />
                  <AppRadioGroup name="edad" question="¿En qué rango de edad te encuentras?" options={["18 a 24 años", "25 a 34 años", "35 a 44 años", "45 años o más", "Prefiero no responder"]} />
                  <AppRadioGroup name="conocimiento_marca" question="Antes de esta encuesta, ¿conocías la marca SUAVECITO?" options={["Sí, la conozco", "La había escuchado nombrar", "No la conocía"]} />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <AppScaleGroup name="importancia_opinion" question="¿Qué tan importante es para ti la opinión de otras personas al comprar ropa para tu bebé?" labels={["Nada", "Mucho"]} />
                  <AppRadioGroup name="consulta_compra" question="¿A quién sueles consultar antes de comprar?" options={["Pareja", "Familiares", "Amigos u otros padres", "Personas que publican experiencias de compra en redes sociales", "No suelo consultar a otras personas", "Otro tipo de fuente"]} />
                  <AppRadioGroup name="factor_decision" question="¿Qué factor tiene más peso al elegir?" options={["Precio", "Calidad y materiales", "Comodidad", "Recomendación de alguien de confianza", "Marca", "Diseño"]} />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 w-full">
                  <div className="text-center max-w-2xl mx-auto">
                    <span className="inline-block text-xs font-bold tracking-widest text-brand-sage-dark bg-brand-sage-light px-3.5 py-1.5 rounded-full uppercase mb-2">
                      Estudio comparativo
                    </span>
                    <h3 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
                      Observa los diseños
                    </h3>
                    <p className="text-gray-500 font-medium text-sm sm:text-base mt-2">
                      Examina detalladamente las tres piezas publicitarias de ropa para recién nacidos, compara sus características y selecciona tu diseño preferido.
                    </p>
                    {errors.diseno_favorito && (
                      <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold rounded-2xl inline-flex items-center gap-2">
                        <span>⚠️ Selecciona uno de los tres diseños para continuar</span>
                      </div>
                    )}
                  </div>

                  {/* Responsive grid: 1 column on mobile, 3 columns on tablet/desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                    {DISENOS_ITEMS.map((diseno) => {
                      const isSelected = watch("diseno_favorito") === diseno.id;

                      return (
                        <div
                          key={diseno.id}
                          className={`flex flex-col rounded-3xl overflow-hidden transition-all duration-300 bg-white border-2 shadow-sm relative ${
                            isSelected
                              ? 'border-brand-sage ring-4 ring-brand-sage/20 shadow-xl shadow-brand-sage/10 scale-[1.01]'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }`}
                        >
                          {/* Top Brand Bar */}
                          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                            <span className={`text-xs font-black px-2.5 py-1 rounded-lg tracking-wider ${diseno.accentBadge}`}>
                              {diseno.badge}
                            </span>
                            
                            {diseno.brandType === 'official' ? (
                              <div className="flex items-center gap-1.5" title="Logotipo oficial de SUAVECITO">
                                <img
                                  src="/logo-suavecito.png"
                                  alt="SUAVECITO"
                                  className="h-7 w-auto object-contain"
                                />
                              </div>
                            ) : (
                              <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">
                                {diseno.brandLabel}
                              </span>
                            )}
                          </div>

                          {/* Image Section */}
                          <div className="w-full relative bg-neutral-100 flex items-center justify-center group overflow-hidden">
                            <img
                              src={diseno.img}
                              alt={`${diseno.title} - ${diseno.badge}`}
                              className="w-full h-auto object-contain block select-none"
                              loading="eager"
                            />

                            {/* Desktop hover zoom overlay */}
                            <button
                              type="button"
                              onClick={() => setZoomedImage(diseno.img)}
                              className="hidden md:flex absolute inset-0 bg-black/40 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] cursor-pointer"
                              title="Ver pieza publicitaria en alta resolución"
                            >
                              <span className="bg-white/95 text-gray-900 font-bold text-sm py-2.5 px-5 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                                🔍 Ver pieza completa
                              </span>
                            </button>

                            {/* Mobile button to expand */}
                            <button
                              type="button"
                              onClick={() => setZoomedImage(diseno.img)}
                              className="md:hidden absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-bold py-1.5 px-3 rounded-full shadow-md border border-gray-200 flex items-center gap-1"
                            >
                              🔍 Ampliar
                            </button>
                          </div>

                          {/* Card Content & Features */}
                          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                            <div>
                              {/* Title & Subtitle */}
                              <div className="mb-4">
                                <h4 className="font-black text-xl text-gray-900 leading-snug">
                                  {diseno.title}
                                </h4>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">
                                  {diseno.subtitle}
                                </p>
                              </div>

                              {/* Price Highlight */}
                              <div className="mb-5 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-baseline justify-between">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                  {diseno.priceLabel}:
                                </span>
                                <span className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                                  Bs. {diseno.price}
                                </span>
                              </div>

                              {/* Included Garments Pills */}
                              <div className="mb-5">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">
                                  Prendas incluidas:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {diseno.garments.map((g, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200/60"
                                    >
                                      {g}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Characteristics Checklist */}
                              <div className="mb-6">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2.5">
                                  Características visibles:
                                </p>
                                <ul className="space-y-2 text-sm">
                                  {diseno.features.map((feat, idx) => {
                                    const isWarning = feat.includes('sintético');
                                    return (
                                      <li key={idx} className="flex items-start gap-2.5 leading-snug">
                                        <span
                                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                                            isWarning
                                              ? 'bg-amber-100 text-amber-800'
                                              : 'bg-emerald-100 text-emerald-700'
                                          }`}
                                        >
                                          {isWarning ? '!' : '✓'}
                                        </span>
                                        <span className={`font-medium ${isWarning ? 'text-amber-900 font-semibold' : 'text-gray-700'}`}>
                                          {feat}
                                        </span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            </div>

                            {/* Large Selection Action Button */}
                            <div className="mt-auto pt-2">
                              <input
                                type="radio"
                                value={diseno.id}
                                {...register("diseno_favorito")}
                                className="sr-only"
                              />
                              <button
                                type="button"
                                onClick={() => setValue("diseno_favorito", diseno.id, { shouldValidate: true, shouldDirty: true })}
                                className={`w-full py-4 px-4 text-center rounded-2xl font-black text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                                  isSelected
                                    ? 'bg-brand-sage text-white shadow-brand-sage/30 ring-2 ring-brand-sage-dark'
                                    : 'bg-gray-900 text-white hover:bg-black hover:shadow-md'
                                }`}
                              >
                                {isSelected ? (
                                  <>
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                    <span>DISEÑO SELECCIONADO</span>
                                  </>
                                ) : (
                                  <span>Seleccionar diseño</span>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <AppScaleGroup name="interes_compra" question="¿Qué tan interesado/a estarías en comprar el producto?" labels={["Nada", "Mucho"]} />
                  <AppScaleGroup name="confianza_publicidad" question="¿Qué tan confiable te parece la información?" labels={["Poco", "Muy"]} />
                  <AppScaleGroup name="influencia_publicidad" question="¿En qué medida esta publicidad influye en tu interés?" labels={["Nada", "Mucho"]} />
                  <AppRadioGroup name="elemento_influyente" question="¿Qué elemento influyó más en tu percepción?" options={["Fotografía", "Precio", "Características", "Opinión o recomendación de otra persona", "Marca SUAVECITO", "Ninguno en particular", "Otro elemento"]} />
                  <AppScaleGroup name="probabilidad_consideracion" question="¿Qué tan probable sería que consideraras esta marca?" labels={["Poco", "Muy"]} />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <AppRadioGroup name="cambio_decision" question="Si una persona de confianza te recomendara esta ropa, ¿cambiaría tu decisión?" options={["Sí, probablemente la consideraría más", "Tal vez, dependería de la recomendación", "No cambiaría mi decisión", "No estoy seguro/a"]} />
                  <AppRadioGroup name="tipo_recomendacion" question="¿Qué tipo de recomendación te resultaría más útil?" options={["Experiencia de otro padre o madre", "Opinión de un familiar o amigo", "Recomendación de un especialista", "Comentarios de compradores en internet", "Prefiero evaluar el producto por mi cuenta"]} />
                  <AppRadioGroup name="ayuda_confianza" question="¿Qué te ayudaría más a confiar en SUAVECITO?" options={["Una experiencia real de compra", "Información sobre calidad y materiales", "Fotografías reales del producto", "Opiniones de varios compradores", "Información verificable sobre el producto"]} />
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50 pb-safe">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrev}
            className={`w-14 h-14 flex items-center justify-center rounded-2xl font-bold transition-colors ${step === 0 ? 'opacity-0 pointer-events-none' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          {step < sections.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 h-14 bg-brand-sage text-white font-bold text-lg rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              Siguiente <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="flex-1 h-14 bg-emerald-500 text-white font-bold text-lg rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Enviando..." : "Finalizar Encuesta"}
            </button>
          )}
        </div>
      </div>
      {/* Lightbox Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4"
          >
             <button 
               onClick={() => setZoomedImage(null)}
               className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md font-bold transition-colors"
             >
               Cerrar ✕
             </button>
             <img src={zoomedImage} alt="Diseño en grande" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
