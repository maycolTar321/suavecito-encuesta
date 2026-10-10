'use client';

import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Download, FileText, LogOut, RefreshCcw, Users, Layout, TrendingUp } from 'lucide-react';
import { logoutAction } from './actions';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Image from 'next/image';

const COLORS = ['#9CA986', '#7A8764', '#E8EDE1', '#F7F5F0', '#C2CDB1', '#5B6846'];

export default function DashboardClient({ initialData, fetchError }: { initialData: any[], fetchError: string | null }) {
  const [data, setData] = useState(initialData);

  // Stats calculation
  const totalResponses = data.length;
  
  // Agrupar diseños
  const disenosCount = data.reduce((acc, curr) => {
    const val = curr.diseno_favorito || 'No respondido';
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const disenoChartData = Object.keys(disenosCount).map(key => ({
    name: key,
    value: disenosCount[key]
  })).sort((a, b) => b.value - a.value);

  const topDesign = disenoChartData.length > 0 ? disenoChartData[0].name : 'N/A';

  // Agrupar factores de decisión
  const factoresCount = data.reduce((acc, curr) => {
    const val = curr.factor_decision || 'No respondido';
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const factoresChartData = Object.keys(factoresCount).map(key => ({
    name: key,
    value: factoresCount[key]
  }));

  // Interés de compra promedio
  const interesAvg = data.length > 0 
    ? (data.reduce((sum, curr) => sum + (Number(curr.interes_compra) || 0), 0) / data.length).toFixed(1)
    : '0';

  const exportToExcel = () => {
    if (data.length === 0) return alert('No hay datos para exportar.');
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Respuestas");
    XLSX.writeFile(workbook, "suavecito_resultados.xlsx");
  };

  const exportToPDF = () => {
    if (data.length === 0) return alert('No hay datos para exportar.');
    const doc = new jsPDF('landscape');
    doc.text('Resultados de Investigación SUAVECITO', 14, 15);
    
    const headers = Object.keys(data[0] || {});
    const rows = data.map(row => headers.map(header => row[header] ? row[header].toString() : ''));
    
    (doc as any).autoTable({
      head: [headers],
      body: rows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [156, 169, 134] } // brand-sage color
    });
    
    doc.save('suavecito_resultados.pdf');
  };

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl text-center border-2 border-rose-100">
          <h2 className="text-2xl font-black text-rose-600 mb-4">Error de conexión</h2>
          <p className="text-gray-700 mb-6 font-medium">{fetchError}</p>
          <div className="bg-amber-50 p-6 rounded-2xl text-left text-sm text-amber-800">
            <h3 className="font-bold mb-2">Instrucciones para solucionar esto:</h3>
            <p className="mb-2">Debes agregar la función <code className="bg-amber-100 px-1 rounded">doGet(e)</code> a tu Google Apps Script para que el Dashboard pueda leer los datos.</p>
          </div>
          <button onClick={() => window.location.reload()} className="mt-8 bg-brand-sage text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-sage-dark">
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light font-sans text-brand-text">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo-suavecito.png" alt="Logo" width={120} height={40} className="object-contain" />
            <div className="h-8 w-px bg-gray-200"></div>
            <h1 className="font-bold text-xl text-gray-800 tracking-tight">Dashboard de Investigación</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-brand-sage transition-colors bg-gray-50 px-4 py-2 rounded-xl">
              <RefreshCcw className="w-4 h-4" /> Actualizar
            </button>
            <form action={logoutAction}>
              <button type="submit" className="flex items-center gap-2 text-sm font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors px-4 py-2 rounded-xl">
                <LogOut className="w-4 h-4" /> Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        
        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-brand-sage/10 p-4 rounded-2xl text-brand-sage-dark">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-gray-500 font-bold text-sm">Total Participantes</p>
              <h2 className="text-3xl font-black text-gray-900">{totalResponses}</h2>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-amber-100 p-4 rounded-2xl text-amber-600">
              <Layout className="w-8 h-8" />
            </div>
            <div>
              <p className="text-gray-500 font-bold text-sm">Diseño Ganador</p>
              <h2 className="text-2xl font-black text-gray-900">{topDesign}</h2>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-sky-100 p-4 rounded-2xl text-sky-600">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-gray-500 font-bold text-sm">Interés de Compra Promedio</p>
              <h2 className="text-3xl font-black text-gray-900">{interesAvg} <span className="text-base text-gray-400">/ 5</span></h2>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Diseño Favorito Chart */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-xl mb-6">Comparativa de Estímulos (Diseño)</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={disenoChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{fill: '#6B7280', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: '#6B7280'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="value" fill="#9CA986" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Factor de Decisión Chart */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-xl mb-6">Factor de Decisión Principal</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={factoresChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {factoresChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '12px', fontWeight: 'bold'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="font-bold text-xl">Base de Datos de Respuestas</h3>
            <div className="flex gap-3">
              <button onClick={exportToExcel} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold py-2 px-4 rounded-xl transition-colors">
                <FileText className="w-4 h-4" /> Excel
              </button>
              <button onClick={exportToPDF} className="flex items-center gap-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold py-2 px-4 rounded-xl transition-colors">
                <Download className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Situación</th>
                  <th className="px-6 py-4">Diseño Favorito</th>
                  <th className="px-6 py-4">Factor Clave</th>
                  <th className="px-6 py-4">Interés (1-5)</th>
                  <th className="px-6 py-4">Influencia (1-5)</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500 font-medium">No hay respuestas registradas aún.</td></tr>
                ) : (
                  data.slice().reverse().map((row, i) => (
                    <tr key={i} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{row.situacion || '-'}</td>
                      <td className="px-6 py-4 font-bold text-brand-sage-dark">{row.diseno_favorito || '-'}</td>
                      <td className="px-6 py-4">{row.factor_decision || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 px-3 py-1 rounded-full font-bold">{row.interes_compra || '-'}</span>
                      </td>
                      <td className="px-6 py-4">{row.influencia_publicidad || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">Mostrando las respuestas más recientes primero.</p>
        </div>

      </main>
    </div>
  );
}
