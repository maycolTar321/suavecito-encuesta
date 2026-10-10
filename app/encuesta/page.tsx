"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { surveySchema, SurveyFormValues } from "@/lib/validation/survey";
import { CheckCircle2, ChevronRight, ChevronLeft, ShieldCheck, Baby, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzKhLkLp1wSWgIEuMuU66bfGrbLJuK1A8CAtRnJji56GgS5sCduchjerC3n80Re9lp-/exec";

export default function EncuestaApp() {
  const [grupo, setGrupo] = useState<"A" | "B" | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(0);

  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm<SurveyFormValues>({
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
      setEnviado(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { title: "Contexto", fields: ["situacion", "edad", "conocimiento_marca"] },
    { title: "Preferencias", fields: ["importancia_opinion", "consulta_compra", "factor_decision"] },
    { title: "Elige tu diseño favorito", fields: ["diseno_favorito"] },
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
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo-suavecito.png" alt="SUAVECITO" className="h-8 w-auto object-contain" />
        </div>
        <div className="text-sm font-bold text-brand-sage bg-brand-sage-light px-3 py-1 rounded-full">
          {step + 1} / {sections.length}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-gray-100">
        <motion.div 
          className="h-full bg-brand-sage"
          initial={{ width: "0%" }}
          animate={{ width: `${((step + 1) / sections.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="max-w-md mx-auto">
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
                <div className="space-y-6 max-w-6xl mx-auto -mx-4 sm:mx-0">
                  <div className="text-center mb-10">
                    <p className="text-brand-sage-dark font-medium mb-2 uppercase tracking-widest text-sm">Observa detenidamente</p>
                    <h3 className="text-3xl font-black text-gray-900">Comparación de propuestas publicitarias</h3>
                    {errors.diseno_favorito && <p className="text-rose-500 font-bold mt-4 bg-rose-50 inline-block px-4 py-2 rounded-lg">{errors.diseno_favorito.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { id: 'DISEÑO 1', label: 'ESTÍMULO A', img: '/images/productos/diseno1.jpg', desc: 'Solo información del producto' },
                      { id: 'DISEÑO 2', label: 'ESTÍMULO B', img: '/images/productos/diseno2.jpg', desc: 'Con recomendación de otra persona' },
                      { id: 'DISEÑO 3', label: 'ESTÍMULO C', img: '/images/productos/diseno3.jpg', desc: 'Otro diseño del producto' },
                    ].map((diseno) => {
                      const isSelected = watch("diseno_favorito") === diseno.id;
                      return (
                        <div key={diseno.id} className={`flex flex-col bg-white rounded-3xl overflow-hidden transition-all duration-300 border-[3px] shadow-sm ${isSelected ? 'border-brand-sage shadow-brand-sage-light shadow-xl' : 'border-gray-100'}`}>
                          
                          {/* Image Section */}
                          <div className="w-full relative bg-gray-50 flex items-start justify-center group">
                            <img 
                              src={diseno.img} 
                              alt={`${diseno.label} - ${diseno.desc}`} 
                              className="w-full h-auto object-contain"
                              style={{ display: "block" }} 
                            />
                            {/* Overlay zoom button on desktop hover */}
                            <button 
                              type="button"
                              onClick={() => setZoomedImage(diseno.img)}
                              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="bg-white text-gray-900 font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transition-transform">
                                Ver en grande
                              </span>
                            </button>
                            {/* Mobile persistent zoom button */}
                            <button 
                              type="button"
                              onClick={() => setZoomedImage(diseno.img)}
                              className="md:hidden absolute bottom-6 right-6 bg-white/90 backdrop-blur text-gray-900 font-bold py-2 px-4 rounded-full shadow-md text-sm border border-gray-200"
                            >
                              🔍 Ampliar
                            </button>
                          </div>

                          {/* Controls Section */}
                          <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between bg-white">
                            <div className="text-center mb-4 sm:mb-6">
                              <h4 className="font-black text-lg sm:text-xl text-gray-900 mb-1 whitespace-nowrap">{diseno.label}</h4>
                              <p className="text-sm font-medium text-gray-500 line-clamp-2">{diseno.desc}</p>
                            </div>
                            
                            <label className="cursor-pointer w-full mt-auto block">
                              <input type="radio" value={diseno.id} {...register("diseno_favorito")} className="sr-only" />
                              <div className={`w-full py-3.5 px-2 text-center rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 border-2 ${isSelected ? 'bg-brand-sage text-white border-brand-sage shadow-lg shadow-brand-sage/30' : 'bg-transparent text-gray-600 hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:text-gray-800'}`}>
                                {isSelected && <CheckCircle2 className="w-5 h-5" />}
                                {isSelected ? 'SELECCIONADO' : 'SELECCIONAR DISEÑO'}
                              </div>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Lógica del Grupo B eliminada de aquí para no interferir con las nuevas tarjetas completas. 
                      La recomendación ya viene incrustada en el Estímulo B. */}
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
