'use client';

import { useState, useMemo, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Download, FileText, LogOut, RefreshCcw, Users, Layout, TrendingUp, Filter, BarChart3, List, PieChart as PieChartIcon, Settings } from 'lucide-react';
import { logoutAction } from './actions';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import Image from 'next/image';

const PIE_COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#6366F1', '#EC4899', '#14B8A6'];

const QUESTIONS = [
  { id: 'situacion', label: 'Situación Actual' },
  { id: 'edad', label: 'Edad' },
  { id: 'conocimiento_marca', label: 'Conocimiento de la Marca' },
  { id: 'importancia_opinion', label: 'Importancia de Opiniones' },
  { id: 'consulta_compra', label: 'Consulta antes de comprar' },
  { id: 'factor_decision', label: 'Factor principal de Decisión' },
  { id: 'diseno_favorito', label: 'Diseño Favorito (Estímulo)' },
  { id: 'interes_compra', label: 'Interés de Compra (1-5)' },
  { id: 'confianza_publicidad', label: 'Confianza en la Publicidad' },
  { id: 'influencia_publicidad', label: 'Influencia de la Publicidad (1-5)' },
  { id: 'elemento_influyente', label: 'Elemento más influyente' },
  { id: 'probabilidad_consideracion', label: 'Probabilidad de Consideración' },
  { id: 'cambio_decision', label: 'Cambio de Decisión' },
  { id: 'tipo_recomendacion', label: 'Tipo de Recomendación preferida' },
  { id: 'ayuda_confianza', label: 'Qué ayuda a confiar más' }
];

export default function DashboardClient({ initialData, fetchError }: { initialData: any[], fetchError: string | null }) {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState('resumen');
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const totalResponses = data.length;

  const groupBy = (key: string) => {
    const counts = data.reduce((acc, curr) => {
      const val = curr[key] || 'Sin Respuesta';
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(counts).map(name => ({ name, value: counts[name], percentage: ((counts[name]/totalResponses)*100).toFixed(1) })).sort((a, b) => b.value - a.value);
  };

  const exportToExcel = () => {
    if (data.length === 0) return alert('No hay datos para exportar.');
    
    const summaryData = QUESTIONS.flatMap(q => {
      const group = groupBy(q.id);
      return [
        { Metrica: `--- ${q.label.toUpperCase()} ---`, Valor: '', Porcentaje: '' },
        ...group.map(g => ({ Metrica: g.name, Valor: g.value, Porcentaje: g.percentage + '%' })),
        { Metrica: '', Valor: '', Porcentaje: '' }
      ];
    });
    const summaryWorksheet = XLSX.utils.json_to_sheet([{ Metrica: 'Total Respuestas', Valor: totalResponses, Porcentaje: '100%' }, {}, ...summaryData]);
    summaryWorksheet['!cols'] = [{ wch: 50 }, { wch: 15 }, { wch: 15 }];
    
    const rawDataWorksheet = XLSX.utils.json_to_sheet(data);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen Estadistico');
    XLSX.utils.book_append_sheet(workbook, rawDataWorksheet, 'Base de Datos');
    
    XLSX.writeFile(workbook, 'Reporte_Investigacion_Suavecito.xlsx');
  };

  const exportToPDF = () => {
    window.print();
  };

  if (fetchError) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
      <div className="bg-white p-8 rounded-xl shadow border border-red-200">
        <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2><p>{fetchError}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans text-slate-800">
      
      {/* Estilos para impresión en PDF nativa (Vectores perfectos y texto seleccionable) */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 1cm; }
          body { background: white !important; }
          .print-hidden { display: none !important; }
          main { height: auto !important; overflow: visible !important; }
          .recharts-responsive-container { break-inside: avoid; }
          .print-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
        }
      `}} />

      <aside className="hidden md:flex w-full md:w-72 bg-slate-900 text-slate-300 flex-col shadow-2xl z-20 shrink-0 print-hidden">
        <div className="p-6 bg-slate-950 flex items-center gap-3 border-b border-slate-800">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Data Research</h2>
        </div>
        
        <nav className="p-4 flex-1 space-y-2">
          <button onClick={() => setActiveTab('resumen')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'resumen' ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'hover:bg-slate-800'}`}>
            <Layout className="w-5 h-5" /> Resumen Ejecutivo
          </button>
          <button onClick={() => setActiveTab('preguntas')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'preguntas' ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'hover:bg-slate-800'}`}>
            <PieChartIcon className="w-5 h-5" /> Todas las Preguntas
          </button>
          <button onClick={() => setActiveTab('tabla')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'tabla' ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'hover:bg-slate-800'}`}>
            <List className="w-5 h-5" /> Base de Datos Bruta
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <form action={logoutAction}>
            <button className="w-full flex justify-center items-center gap-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 py-3 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 flex justify-around items-center pb-safe print-hidden">
        <button onClick={() => setActiveTab('resumen')} className={`flex flex-col items-center justify-center w-full py-3 gap-1 ${activeTab === 'resumen' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
          <Layout className="w-6 h-6" />
          <span className="text-[10px] font-bold">Inicio</span>
        </button>
        <button onClick={() => setActiveTab('preguntas')} className={`flex flex-col items-center justify-center w-full py-3 gap-1 ${activeTab === 'preguntas' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
          <PieChartIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold">Preguntas</span>
        </button>
        <button onClick={() => setActiveTab('tabla')} className={`flex flex-col items-center justify-center w-full py-3 gap-1 ${activeTab === 'tabla' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
          <List className="w-6 h-6" />
          <span className="text-[10px] font-bold">Respuestas</span>
        </button>
        <form action={logoutAction} className="w-full">
          <button type="submit" className="flex flex-col items-center justify-center w-full py-3 gap-1 text-rose-400 hover:text-rose-600">
            <LogOut className="w-6 h-6" />
            <span className="text-[10px] font-bold">Salir</span>
          </button>
        </form>
      </nav>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto pb-24 md:pb-0" ref={dashboardRef}>
        <header className="bg-white px-4 md:px-8 py-4 shadow-sm flex justify-between items-center sticky top-0 z-10 border-b border-slate-200 print-hidden">
          <div className="flex items-center gap-3">
             <Image src="/logo-suavecito.png" alt="SUAVECITO" width={100} height={30} className="object-contain md:w-[140px]" />
             <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>
             <h1 className="text-lg font-bold text-slate-700 hidden sm:block">Panel de Investigación</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={exportToExcel} className="flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold p-2 md:py-2 md:px-4 rounded-md text-sm transition-colors shadow-sm">
              <FileText className="w-4 h-4" /> <span className="hidden md:inline">Excel</span>
            </button>
            <button onClick={exportToPDF} disabled={isExporting} className="flex items-center justify-center gap-2 bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 font-bold p-2 md:py-2 md:px-4 rounded-md text-sm transition-colors shadow-sm">
              <Download className="w-4 h-4" /> <span className="hidden md:inline">{isExporting ? '...' : 'PDF'}</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-8">
          
          {activeTab === 'resumen' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Total Muestra</p>
                  <h2 className="text-3xl font-black text-slate-800 mt-1">{totalResponses}</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Diseño Ganador</p>
                  <h2 className="text-xl font-black text-slate-800 mt-1 truncate">{groupBy('diseno_favorito')[0]?.name || '-'}</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500">
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Última Respuesta</p>
                  <h2 className="text-sm font-bold text-slate-800 mt-2">{data.length > 0 ? new Date(data[data.length-1].timestamp).toLocaleDateString() : '-'}</h2>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-purple-500">
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">% Completitud</p>
                  <h2 className="text-3xl font-black text-slate-800 mt-1">100%</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4">Participación por Diseño (A/B/C)</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={groupBy('diseno_favorito')} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                          {groupBy('diseno_favorito').map((e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4">Factor Principal de Decisión</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={groupBy('factor_decision')} layout="vertical" margin={{ left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11}} />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preguntas' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-2xl font-black text-slate-800 mb-6 border-b pb-4">Análisis Pregunta por Pregunta</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {QUESTIONS.map((q, i) => {
                  const qData = groupBy(q.id);
                  return (
                    <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-800 text-lg">
                          <span className="text-emerald-500 mr-2">P{i+1}.</span>{q.label}
                        </h3>
                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-bold">{qData.length} opciones</span>
                      </div>
                      
                      <div className="flex-1 flex flex-col sm:flex-row gap-6 items-center">
                        <div className="w-full sm:w-1/2 h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={qData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                                {qData.map((e, j) => <Cell key={j} fill={PIE_COLORS[(j + i) % PIE_COLORS.length]} />)}
                              </Pie>
                              <RechartsTooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="w-full sm:w-1/2">
                          <table className="w-full text-xs text-left">
                            <thead>
                              <tr className="border-b border-slate-100"><th className="pb-2">Respuesta</th><th className="pb-2 text-right">%</th></tr>
                            </thead>
                            <tbody>
                              {qData.slice(0,5).map((row, idx) => (
                                <tr key={idx} className="border-b border-slate-50 last:border-0">
                                  <td className="py-2 text-slate-600 truncate max-w-[120px]" title={row.name}>{row.name}</td>
                                  <td className="py-2 text-right font-bold text-slate-800">{row.percentage}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'tabla' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-500">
              <h3 className="font-bold text-slate-800 mb-4 text-xl">Base de Datos Completa ({totalResponses} registros)</h3>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Fecha</th>
                      {QUESTIONS.map(q => <th key={q.id} className="px-4 py-3">{q.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 text-xs text-slate-500">{new Date(row.timestamp || Date.now()).toLocaleString()}</td>
                        {QUESTIONS.map(q => (
                          <td key={q.id} className="px-4 py-3 text-slate-700 truncate max-w-[200px]" title={row[q.id]}>{row[q.id] || '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
