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
        <div className="mb-10 flex justify-center">
          <Image 
            src="/logo-suavecito.png" 
            alt="SUAVECITO Logo" 
            width={280} 
            height={90} 
            className="w-auto h-20 object-contain"
            priority
          />
        </div>
        
        <h2 className="text-lg font-bold text-brand-sage-dark mb-8 uppercase tracking-widest">
          Estudio de Investigación
        </h2>
        
        <p className="text-gray-600 mb-10 text-lg leading-relaxed px-4">
          Te invitamos a participar en este breve estudio académico. Tu opinión es fundamental para ayudarnos a entender qué factores influyen en la elección de ropa para recién nacidos.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
          <div className="flex items-center gap-2 text-gray-500 font-medium bg-brand-sage-light/50 px-5 py-2.5 rounded-xl">
            <Clock className="w-5 h-5 text-brand-sage-dark" />
            <span>3 Minutos</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 font-medium bg-brand-sage-light/50 px-5 py-2.5 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-brand-sage-dark" />
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
