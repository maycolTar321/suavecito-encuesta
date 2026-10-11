import Link from "next/link";
import { ArrowRight, ShieldCheck, Clock } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-brand-light relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-sage-light rounded-full blur-[100px] opacity-70 animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-sage-light rounded-full blur-[100px] opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-xl w-full bg-white/80 backdrop-blur-2xl p-10 sm:p-14 rounded-[2.5rem] shadow-2xl text-center relative z-10 border border-white/50">
        <div className="mb-8 flex justify-center">
          <Image 
            src="/logo-suavecito.png" 
            alt="SUAVECITO Logo" 
            width={280} 
            height={90} 
            className="w-auto h-20 object-contain drop-shadow-sm"
            priority
          />
        </div>
        
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-6 uppercase tracking-tight leading-snug">
          INFLUENCIA SOCIAL EN LA DECISIÓN DE COMPRA DE ROPA DE RECIÉN NACIDOS “SUAVECITO”
        </h1>
        
        <p className="text-gray-600 mb-8 text-base sm:text-lg leading-relaxed px-2 sm:px-4">
          Te invitamos a participar en este estudio académico de investigación sobre los factores e influencia social que intervienen en la elección de ropa para recién nacidos.
        </p>

        <div className="bg-brand-sage-light/40 border border-brand-sage/20 rounded-2xl p-4 mb-8 text-xs sm:text-sm text-gray-600 text-left space-y-2">
          <p className="font-bold text-brand-sage-dark flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            Participación voluntaria y confidencialidad
          </p>
          <p className="leading-relaxed">
            Tu participación es libre y totalmente voluntaria. Las respuestas serán tratadas de forma anónima y agregada, destinadas con fines de investigación académica.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
          <div className="flex items-center gap-2 text-gray-600 font-semibold bg-brand-sage-light/60 px-4 py-2 rounded-xl text-sm">
            <Clock className="w-4 h-4 text-brand-sage-dark" />
            <span>Duración estimada: 3 Minutos</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 font-semibold bg-brand-sage-light/60 px-4 py-2 rounded-xl text-sm">
            <ShieldCheck className="w-4 h-4 text-brand-sage-dark" />
            <span>100% Anónimo</span>
          </div>
        </div>

        <Link 
          href="/encuesta"
          className="inline-flex items-center justify-center gap-3 bg-brand-sage text-white font-bold text-lg py-4 px-8 rounded-2xl hover:bg-brand-sage-dark shadow-xl shadow-brand-sage-light transition-all w-full group"
        >
          COMENZAR ENCUESTA
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </main>
  );
}
