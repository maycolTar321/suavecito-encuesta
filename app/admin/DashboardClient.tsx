'use client';

import { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Download, FileText, LogOut, RefreshCcw, Users, Layout, TrendingUp, Filter, BarChart3, ChevronRight, Activity, Smile } from 'lucide-react';
import { logoutAction } from './actions';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Image from 'next/image';

// Colores estilo PowerBI
const PIE_COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#6366F1'];
const BAR_COLOR = '#4F46E5';

export default function DashboardClient({ initialData, fetchError }: { initialData: any[], fetchError: string | null }) {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterDesign, setFilterDesign] = useState<string | null>(null);

  // Filtrado
  const filteredData = useMemo(() => {
    if (!filterDesign) return data;
    return data.filter(d => d.diseno_favorito === filterDesign);
  }, [data, filterDesign]);

  const uniqueDesigns = useMemo(() => Array.from(new Set(data.map(d => d.diseno_favorito).filter(Boolean))), [data]);

  // Funciones de agrupación
  const groupBy = (key: string) => {
    const counts = filteredData.reduce((acc, curr) => {
      const val = curr[key] || 'N/A';
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(counts).map(name => ({ name, value: counts[name] })).sort((a, b) => b.value - a.value);
  };

  const disenoData = groupBy('diseno_favorito');
  const factorData = groupBy('factor_decision');
  const interesData = groupBy('interes_compra');
  const situacionData = groupBy('situacion');
  const edadData = groupBy('edad');
  const influenciaData = groupBy('influencia_publicidad');

  const totalResponses = filteredData.length;
  const topDesign = disenoData.length > 0 ? disenoData[0].name : 'N/A';
  const interesAvg = filteredData.length > 0 
    ? (filteredData.reduce((sum, curr) => sum + (Number(curr.interes_compra) || 0), 0) / filteredData.length).toFixed(1)
    : '0';

  const exportToExcel = () => {
    if (filteredData.length === 0) return alert('No hay datos para exportar.');
    
    // Hoja 1: Base de datos cruda
    const rawDataWorksheet = XLSX.utils.json_to_sheet(filteredData);
    
    // Hoja 2: Resumen Ejecutivo
    const summaryData = [
      { Metrica: 'Total de Respuestas', Valor: totalResponses, Porcentaje: '100%' },
      { Metrica: '', Valor: '', Porcentaje: '' },
      { Metrica: '--- RESULTADOS POR DISEÑO ---', Valor: '', Porcentaje: '' },
      ...disenoData.map(d => ({ Metrica: d.name, Valor: d.value, Porcentaje: ((d.value / totalResponses) * 100).toFixed(2) + '%' })),
      { Metrica: '', Valor: '', Porcentaje: '' },
      { Metrica: '--- FACTORES DE DECISIÓN ---', Valor: '', Porcentaje: '' },
      ...factorData.map(d => ({ Metrica: d.name, Valor: d.value, Porcentaje: ((d.value / totalResponses) * 100).toFixed(2) + '%' }))
    ];
    
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen Ejecutivo');
    XLSX.utils.book_append_sheet(workbook, rawDataWorksheet, 'Respuestas Detalladas');
    
    XLSX.writeFile(workbook, 'Reporte_Empresarial_Suavecito.xlsx');
  };

  const exportToPDF = () => {
    if (filteredData.length === 0) return alert('No hay datos para exportar.');
    const doc = new jsPDF('landscape');
    doc.text('Análisis de Investigación - SUAVECITO', 14, 15);
    const headers = Object.keys(filteredData[0] || {});
    const rows = filteredData.map(row => headers.map(header => row[header] ? String(row[header]) : ''));
    (doc as any).autoTable({ head: [headers], body: rows, startY: 20, styles: { fontSize: 7 } });
    doc.save('suavecito_reporte.pdf');
  };

  if (fetchError) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-rose-100 max-w-lg text-center">
        <h2 className="text-2xl font-black text-rose-600 mb-4">Error de conexión</h2>
        <p className="text-gray-700 font-medium mb-6">{fetchError}</p>
        <button onClick={() => window.location.reload()} className="bg-brand-sage text-white font-bold py-3 px-6 rounded-xl w-full">Reintentar</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F3F4F6] font-sans">
      
      {/* Sidebar estilo PowerBI */}
      <aside className="w-full md:w-64 bg-[#0F172A] text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 bg-[#F59E0B] flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-white" />
          <h2 className="text-xl font-black tracking-tight text-white shadow-sm">Dashboard</h2>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filtros Globales
          </h3>
          
          <div className="mb-6 bg-[#1E293B] p-4 rounded-xl border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Diseño Seleccionado</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="filtro-diseno" 
                  checked={filterDesign === null} 
                  onChange={() => setFilterDesign(null)} 
                  className="w-4 h-4 text-amber-500 bg-gray-900 border-gray-600 focus:ring-amber-500" 
                />
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Todos los diseños</span>
              </label>
              {uniqueDesigns.map(d => (
                <label key={d} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="filtro-diseno" 
                    checked={filterDesign === d} 
                    onChange={() => setFilterDesign(d)} 
                    className="w-4 h-4 text-amber-500 bg-gray-900 border-gray-600 focus:ring-amber-500" 
                  />
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{d}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#0B1120] border-t border-gray-800">
          <form action={logoutAction}>
            <button className="w-full flex justify-center items-center gap-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 py-3 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Header Superior */}
        <header className="bg-white px-8 py-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <Image src="/logo-suavecito.png" alt="SUAVECITO" width={140} height={40} className="object-contain" />
             <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
             <h1 className="text-xl font-bold text-indigo-900 hidden sm:block">Análisis Encuesta de Mercado</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={exportToExcel} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold py-2 px-4 rounded-lg text-sm transition-colors border border-emerald-200 shadow-sm">
              <FileText className="w-4 h-4" /> Excel
            </button>
            <button onClick={exportToPDF} className="flex items-center gap-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold py-2 px-4 rounded-lg text-sm transition-colors border border-rose-200 shadow-sm">
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-8 space-y-6">
          
          {/* Tarjetas KPI Superiores (Estilo Analítico) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border-t-4 border-[#3B82F6] p-6 relative overflow-hidden">
              <Users className="absolute -right-4 -bottom-4 w-24 h-24 text-blue-50 opacity-50" />
              <p className="text-gray-500 font-bold text-sm uppercase">Total Encuestados</p>
              <h2 className="text-4xl font-black text-gray-800 mt-2">{totalResponses}</h2>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border-t-4 border-[#F59E0B] p-6 relative overflow-hidden">
              <Layout className="absolute -right-4 -bottom-4 w-24 h-24 text-amber-50 opacity-50" />
              <p className="text-gray-500 font-bold text-sm uppercase">Diseño Preferido</p>
              <h2 className="text-3xl font-black text-gray-800 mt-2 truncate">{topDesign}</h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border-t-4 border-[#10B981] p-6 relative overflow-hidden">
              <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-50 opacity-50" />
              <p className="text-gray-500 font-bold text-sm uppercase">Intención de Compra</p>
              <h2 className="text-4xl font-black text-gray-800 mt-2">{interesAvg} <span className="text-lg text-gray-400">/ 5</span></h2>
            </div>
          </div>

          {/* Grillas de Gráficos (Múltiples para máxima densidad) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Donuts */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center justify-between">
                Participación por Diseño
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{disenoData.length} opciones</span>
              </h3>
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={disenoData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                      {disenoData.map((e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '11px'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="font-bold text-gray-700 mb-4">Factor Clave de Decisión</h3>
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={factorData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                      {factorData.map((e, i) => <Cell key={i} fill={PIE_COLORS[(i+2) % PIE_COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '11px'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="font-bold text-gray-700 mb-4">Situación Actual</h3>
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={situacionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                      {situacionData.map((e, i) => <Cell key={i} fill={PIE_COLORS[(i+4) % PIE_COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '11px'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Gráficos de Barras */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-6">Nivel de Interés en Comprar (1 a 5)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={interesData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={30} tick={{fontSize: 12, fontWeight: 'bold'}} />
                    <RechartsTooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="value" fill="#4F46E5" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#6B7280', fontSize: 12, fontWeight: 'bold' }} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-6">Influencia de la Publicidad (1 a 5)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={influenciaData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={30} tick={{fontSize: 12, fontWeight: 'bold'}} />
                    <RechartsTooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#6B7280', fontSize: 12, fontWeight: 'bold' }} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tabla de Datos Crudos */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center justify-between">
              Registro de Respuestas Filtradas
              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">{filteredData.length} registros</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Fecha/Hora</th>
                    <th className="px-4 py-3">Situación</th>
                    <th className="px-4 py-3 text-indigo-700">Diseño</th>
                    <th className="px-4 py-3">Factor Decisión</th>
                    <th className="px-4 py-3 text-center">Interés (1-5)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice().reverse().slice(0, 50).map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-indigo-50/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">
                        {new Date(row.timestamp || Date.now()).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{row.situacion || '-'}</td>
                      <td className="px-4 py-3 font-bold text-indigo-600">{row.diseno_favorito || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{row.factor_decision || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-gray-100 px-2 py-1 rounded font-bold text-gray-700">{row.interes_compra || '-'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length > 50 && (
                <div className="text-center p-4 text-sm text-gray-500 bg-gray-50 border-t border-gray-100">
                  Mostrando los 50 registros más recientes. Exporta a Excel para ver la lista completa.
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
