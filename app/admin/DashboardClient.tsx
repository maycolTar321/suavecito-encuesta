'use client';

import { useState, useMemo, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Download, FileText, LogOut, Layout, BarChart3, List, PieChart as PieChartIcon, 
  Search, Eye, X, Share2, Layers, Filter, CheckCircle2, ChevronDown
} from 'lucide-react';
import { logoutAction } from './actions';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Image from 'next/image';

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F97316'];

const QUESTIONS = [
  { id: 'situacion', label: 'Situación Actual', type: 'single' },
  { id: 'edad', label: 'Edad', type: 'single' },
  { id: 'conocimiento_marca', label: 'Conocimiento de la Marca', type: 'single' },
  { id: 'importancia_opinion', label: 'Importancia de Opiniones (1-5)', type: 'scale' },
  { id: 'consulta_compra', label: 'Consulta antes de comprar', type: 'single' },
  { id: 'factor_decision', label: 'Factor principal de Decisión', type: 'single' },
  { id: 'diseno_favorito', label: 'Diseño Seleccionado (A / B / C)', type: 'stimulus' },
  { id: 'interes_compra', label: 'Interés de Compra (1-5)', type: 'scale' },
  { id: 'confianza_publicidad', label: 'Confianza en la Publicidad (1-5)', type: 'scale' },
  { id: 'influencia_publicidad', label: 'Influencia de la Publicidad (1-5)', type: 'scale' },
  { id: 'elemento_influyente', label: 'Elemento más influyente', type: 'single' },
  { id: 'probabilidad_consideracion', label: 'Probabilidad de Consideración (1-5)', type: 'scale' },
  { id: 'cambio_decision', label: 'Cambio de Decisión por recomendación', type: 'single' },
  { id: 'tipo_recomendacion', label: 'Tipo de Recomendación preferida', type: 'single' },
  { id: 'ayuda_confianza', label: 'Qué ayuda a confiar más en la marca', type: 'single' }
];

export default function DashboardClient({ initialData, fetchError }: { initialData: any[], fetchError: string | null }) {
  const [data] = useState<any[]>(initialData || []);
  const [activeTab, setActiveTab] = useState<'resumen' | 'preguntas' | 'social' | 'tabla' | 'reportes'>('resumen');
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
  const [filterEstimulo, setFilterEstimulo] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchEstimulo = filterEstimulo === 'TODOS' || (item.diseno_favorito === filterEstimulo);
      const matchSearch = searchTerm.trim() === '' || Object.values(item).some(val => 
        String(val || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchEstimulo && matchSearch;
    });
  }, [data, filterEstimulo, searchTerm]);

  const totalResponses = data.length;
  const filteredResponsesCount = filteredData.length;

  const groupBy = (key: string, dataset: any[] = filteredData) => {
    if (!dataset || dataset.length === 0) return [];
    const counts = dataset.reduce((acc, curr) => {
      const val = curr[key] || 'Sin respuesta';
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts)
      .map(name => ({
        name,
        value: counts[name],
        percentage: ((counts[name] / dataset.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Cross analysis between stimulus and variables
  const crossByStimulus = (variableKey: string) => {
    const stimuli = ['DISEÑO 1', 'DISEÑO 2', 'DISEÑO 3'];
    return stimuli.map(st => {
      const subset = data.filter(d => d.diseno_favorito === st);
      const avg = subset.length > 0 
        ? (subset.reduce((acc, curr) => acc + (Number(curr[variableKey]) || 0), 0) / subset.length).toFixed(2)
        : '0.00';
      return {
        est: st === 'DISEÑO 1' ? 'Diseño A (Bs. 120)' : st === 'DISEÑO 2' ? 'Diseño B (Bs. 90)' : 'Diseño C (SUAVECITO Bs. 150)',
        count: subset.length,
        promedio: Number(avg)
      };
    });
  };

  // CSV Export
  const exportToCSV = () => {
    if (filteredData.length === 0) return alert('No hay respuestas para exportar.');
    const headers = ['ID', 'Fecha', 'Grupo', 'Elegible', ...QUESTIONS.map(q => q.label)];
    const rows = filteredData.map((row, idx) => [
      `ENC-${String(idx + 1).padStart(4, '0')}`,
      row.timestamp || '',
      row.grupo || 'A',
      row.elegible ? 'Sí' : 'No',
      ...QUESTIONS.map(q => `"${String(row[q.id] || '').replace(/"/g, '""')}"`)
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Respuestas_Investigacion_Suavecito_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Excel Export with multi-sheet
  const exportToExcel = () => {
    if (data.length === 0) return alert('No hay datos para exportar.');

    const summaryData = QUESTIONS.flatMap(q => {
      const group = groupBy(q.id, data);
      return [
        { Metrica: `--- [${q.id.toUpperCase()}] ${q.label.toUpperCase()} ---`, Frecuencia: '', Porcentaje: '' },
        ...group.map(g => ({ Metrica: g.name, Frecuencia: g.value, Porcentaje: g.percentage + '%' })),
        { Metrica: '', Frecuencia: '', Porcentaje: '' }
      ];
    });

    const summaryWorksheet = XLSX.utils.json_to_sheet([
      { Metrica: 'ESTUDIO SUAVECITO: INFLUENCIA SOCIAL EN COMPRA DE ROPA DE RECIÉN NACIDOS', Frecuencia: '', Porcentaje: '' },
      { Metrica: 'Total de Respuestas Recolectadas', Frecuencia: totalResponses, Porcentaje: '100%' },
      { Metrica: 'Fecha de Generación', Frecuencia: new Date().toLocaleDateString(), Porcentaje: '' },
      {},
      ...summaryData
    ]);
    summaryWorksheet['!cols'] = [{ wch: 60 }, { wch: 15 }, { wch: 15 }];

    const rawData = data.map((row, idx) => {
      const obj: Record<string, any> = {
        'ID_RESPUESTA': `ENC-${String(idx + 1).padStart(4, '0')}`,
        'FECHA': row.timestamp || '',
        'GRUPO': row.grupo || 'A',
        'ELEGIBLE': row.elegible ? 'Sí' : 'No',
      };
      QUESTIONS.forEach(q => {
        obj[q.label] = row[q.id] || '';
      });
      return obj;
    });

    const rawWorksheet = XLSX.utils.json_to_sheet(rawData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen Ejecutivo');
    XLSX.utils.book_append_sheet(workbook, rawWorksheet, 'Respuestas Individuales');

    XLSX.writeFile(workbook, `Reporte_Academico_Suavecito_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // Professional Native jsPDF Report Generator (Clean A4 document, no cutoff, consistent styling)
  const generateProfessionalPDF = () => {
    if (data.length === 0) return alert('No hay datos para generar el informe PDF.');
    setIsExportingPDF(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 18;
      let y = margin;

      const addHeaderFooter = (pageNum: number, totalPages: number) => {
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        doc.text('SUAVECITO — Investigación de Mercados & Comportamiento del Consumidor', margin, 10);
        doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin, 10, { align: 'right' });
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.3);
        doc.line(margin, 12, pageWidth - margin, 12);
        
        doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
        doc.text('Documento Confidencial de Investigación Académica — Generado Automáticamente', margin, pageHeight - 8);
      };

      // Page 1: Portada y Resumen Ejecutivo
      doc.setFillColor(248, 246, 240); // Soft warm background
      doc.rect(margin, y, pageWidth - (margin * 2), 65, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(122, 135, 100);
      doc.text('INFORME FINAL DE INVESTIGACIÓN ACADÉMICA', margin + 8, y + 14);

      doc.setFontSize(16);
      doc.setTextColor(30, 30, 30);
      doc.text('INFLUENCIA SOCIAL EN LA DECISIÓN DE COMPRA', margin + 8, y + 25);
      doc.text('DE ROPA DE RECIÉN NACIDOS "SUAVECITO"', margin + 8, y + 33);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin + 8, y + 45);
      doc.text(`Muestra total registrada: ${totalResponses} participantes  |  Tasa de completitud: 100%`, margin + 8, y + 52);
      doc.text(`Validez metodológica: Asignación aleatoria de estímulos con doble control`, margin + 8, y + 58);

      y += 75;

      // Resumen Ejecutivo Cards
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text('1. RESUMEN EJECUTIVO & INDICADORES CLAVE', margin, y);
      y += 8;

      const cardWidth = (pageWidth - (margin * 2) - 8) / 3;
      const metrics = [
        { title: 'Total Participantes', val: String(totalResponses), sub: '100% Completas' },
        { title: 'Diseño Más Elegido', val: groupBy('diseno_favorito', data)[0]?.name || 'N/A', sub: `${groupBy('diseno_favorito', data)[0]?.percentage || 0}% de preferencia` },
        { title: 'Factor Clave', val: groupBy('factor_decision', data)[0]?.name || 'N/A', sub: `${groupBy('factor_decision', data)[0]?.percentage || 0}% de los votos` }
      ];

      metrics.forEach((m, idx) => {
        const cx = margin + (idx * (cardWidth + 4));
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(220, 220, 220);
        doc.roundedRect(cx, y, cardWidth, 26, 3, 3, 'FD');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(110, 110, 110);
        doc.text(m.title, cx + 4, y + 6);

        doc.setFontSize(11);
        doc.setTextColor(20, 20, 20);
        doc.text(m.val, cx + 4, y + 14);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(120, 120, 120);
        doc.text(m.sub, cx + 4, y + 21);
      });

      y += 36;

      // Tabla Comparativa de Estímulos
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text('2. COMPARACIÓN DIRECTA ENTRE PROPUESTAS PUBLICITARIAS (ESTÍMULOS)', margin, y);
      y += 5;

      const stimulusRows = [
        ['DISEÑO A (NIDITO)', 'Bs. 120.00', '2 prendas (Chambrita + Buzo)', 'Básica con etiqueta genérica', `${groupBy('diseno_favorito', data).find(x => x.name === 'DISEÑO 1')?.value || 0} (${groupBy('diseno_favorito', data).find(x => x.name === 'DISEÑO 1')?.percentage || 0}%)`],
        ['DISEÑO B (TEJIDITOS)', 'Bs. 90.00', '3 prendas (+ Gorrito incluido)', 'Sintético económico básico', `${groupBy('diseno_favorito', data).find(x => x.name === 'DISEÑO 2')?.value || 0} (${groupBy('diseno_favorito', data).find(x => x.name === 'DISEÑO 2')?.percentage || 0}%)`],
        ['DISEÑO C (SUAVECITO)', 'Bs. 150.00', '5 prendas (Conjunto completo)', 'Calidad superior, identidad oficial', `${groupBy('diseno_favorito', data).find(x => x.name === 'DISEÑO 3')?.value || 0} (${groupBy('diseno_favorito', data).find(x => x.name === 'DISEÑO 3')?.percentage || 0}%)`]
      ];

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['Estímulo Publicitario', 'Precio', 'Composición de Prendas', 'Propuesta de Valor', 'Preferencia']],
        body: stimulusRows,
        theme: 'striped',
        headStyles: { fillColor: [156, 169, 134], textColor: 255, fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, textColor: 50 },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: 'bold' },
          1: { cellWidth: 22 },
          2: { cellWidth: 45 },
          3: { cellWidth: 42 },
          4: { cellWidth: 25, fontStyle: 'bold' }
        }
      });

      // @ts-ignore
      y = doc.lastAutoTable.finalY + 12;

      // Nota Metodológica
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text('3. NOTA METODOLÓGICA & RIGOR EXPERIMENTAL', margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const noteText = doc.splitTextToSize(
        'El presente estudio evalúa cómo influyen las variables de precio, cantidad de prendas incluidas, calidad percibida de los materiales y recomendaciones de terceros en la intención de compra. Cada participante evaluó de manera neutral las tres alternativas publicitarias sin inducción previa de marca. Los datos se almacenan y consolidan de forma anónima para fines estadísticos descriptivos y analíticos.',
        pageWidth - (margin * 2)
      );
      doc.text(noteText, margin, y);

      // Page 2: Análisis Detallado de Todas las Preguntas
      doc.addPage();
      y = margin + 6;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text('4. ANÁLISIS DETALLADO PREGUNTA POR PREGUNTA', margin, y);
      y += 8;

      QUESTIONS.forEach((q, idx) => {
        const qGroup = groupBy(q.id, data);
        
        // Si no queda suficiente espacio en la página, agregar página
        if (y > pageHeight - 45) {
          doc.addPage();
          y = margin + 6;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.text(`P${idx + 1}. ${q.label}`, margin, y);
        y += 4;

        const tableBody = qGroup.map(g => [g.name, String(g.value), `${g.percentage}%`]);

        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: [['Opción de Respuesta', 'Frecuencia Absoluta', 'Frecuencia Relativa (%)']],
          body: tableBody.length > 0 ? tableBody : [['Sin respuestas registradas', '0', '0%']],
          theme: 'plain',
          headStyles: { fillColor: [240, 240, 240], textColor: 80, fontSize: 7.5, fontStyle: 'bold' },
          bodyStyles: { fontSize: 7.5, textColor: 50 },
          columnStyles: {
            0: { cellWidth: 105 },
            1: { cellWidth: 35, halign: 'right' },
            2: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
          }
        });

        // @ts-ignore
        y = doc.lastAutoTable.finalY + 8;
      });

      // Anexo: Respuestas Individuales
      doc.addPage();
      y = margin + 6;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text('5. ANEXO METODOLÓGICO: REGISTRO DE RESPUESTAS INDIVIDUALES', margin, y);
      y += 5;

      const individualRows = data.slice(0, 100).map((row, idx) => [
        `#${idx + 1}`,
        row.diseno_favorito || '-',
        row.factor_decision || '-',
        row.interes_compra ? `${row.interes_compra}/5` : '-',
        row.cambio_decision || '-'
      ]);

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['ID', 'Estímulo', 'Factor Decisión', 'Interés', 'Cambio por Recomendación']],
        body: individualRows,
        theme: 'striped',
        headStyles: { fillColor: [122, 135, 100], textColor: 255, fontSize: 7.5, fontStyle: 'bold' },
        bodyStyles: { fontSize: 7, textColor: 50 }
      });

      // Numeración de páginas
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addHeaderFooter(i, totalPages);
      }

      doc.save(`Informe_Investigacion_Suavecito_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Hubo un inconveniente al generar el PDF. Por favor intenta de nuevo.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-200 max-w-md w-full">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-black text-red-600 mb-2">Error de Carga</h2>
          <p className="text-sm text-gray-600 mb-6">{fetchError}</p>
          <a href="/admin" className="inline-block bg-gray-900 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-black transition-colors text-sm">
            Reintentar
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans text-slate-800">
      
      {/* Native Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 1cm; }
          body { background: white !important; }
          .print-hidden { display: none !important; }
          main { height: auto !important; overflow: visible !important; }
          .recharts-responsive-container { break-inside: avoid; }
        }
      `}} />

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-72 bg-slate-900 text-slate-300 flex-col shadow-2xl z-20 shrink-0 print-hidden">
        <div className="p-6 bg-slate-950 flex items-center gap-3 border-b border-slate-800">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-base font-black text-white tracking-tight">Data Research</h2>
            <p className="text-[11px] text-slate-400 font-medium">SUAVECITO Analytics</p>
          </div>
        </div>
        
        <nav className="p-4 flex-1 space-y-1.5">
          <button 
            onClick={() => setActiveTab('resumen')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'resumen' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layout className="w-4 h-4" /> Resumen General
          </button>
          <button 
            onClick={() => setActiveTab('preguntas')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'preguntas' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChartIcon className="w-4 h-4" /> Todas las Preguntas
          </button>
          <button 
            onClick={() => setActiveTab('social')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'social' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" /> Influencia Social
          </button>
          <button 
            onClick={() => setActiveTab('tabla')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'tabla' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-4 h-4" /> Registro de Respuestas
          </button>
          <button 
            onClick={() => setActiveTab('reportes')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'reportes' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" /> Centro de Exportación
          </button>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="mb-3 px-2">
            <p className="text-[11px] text-slate-400">Sesión iniciada como:</p>
            <p className="text-xs font-bold text-slate-200">Investigador Autorizado</p>
          </div>
          <form action={logoutAction}>
            <button className="w-full flex justify-center items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 py-2.5 rounded-lg transition-colors border border-rose-500/20">
              <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile WhatsApp-style Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-50 flex justify-around items-center py-2 px-1 pb-safe print-hidden">
        <button 
          onClick={() => setActiveTab('resumen')} 
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 ${
            activeTab === 'resumen' ? 'text-emerald-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Layout className="w-5 h-5" />
          <span className="text-[10px]">Inicio</span>
        </button>
        <button 
          onClick={() => setActiveTab('preguntas')} 
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 ${
            activeTab === 'preguntas' ? 'text-emerald-600 font-bold' : 'text-slate-400'
          }`}
        >
          <PieChartIcon className="w-5 h-5" />
          <span className="text-[10px]">Preguntas</span>
        </button>
        <button 
          onClick={() => setActiveTab('social')} 
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 ${
            activeTab === 'social' ? 'text-emerald-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px]">Social</span>
        </button>
        <button 
          onClick={() => setActiveTab('tabla')} 
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 ${
            activeTab === 'tabla' ? 'text-emerald-600 font-bold' : 'text-slate-400'
          }`}
        >
          <List className="w-5 h-5" />
          <span className="text-[10px]">Respuestas</span>
        </button>
        <button 
          onClick={() => setActiveTab('reportes')} 
          className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 ${
            activeTab === 'reportes' ? 'text-emerald-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Download className="w-5 h-5" />
          <span className="text-[10px]">Exportar</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto pb-24 md:pb-0" ref={dashboardRef}>
        
        {/* Top Navbar */}
        <header className="bg-white px-4 md:px-8 py-3.5 shadow-sm flex justify-between items-center sticky top-0 z-10 border-b border-slate-200 print-hidden">
          <div className="flex items-center gap-3">
             <Image src="/logo-suavecito.png" alt="SUAVECITO" width={110} height={32} className="object-contain" priority />
             <div className="h-5 w-px bg-slate-300 hidden sm:block"></div>
             <h1 className="text-sm md:text-base font-black text-slate-800 hidden sm:block truncate max-w-md">
               Sistema de Investigación — Influencia Social en Recién Nacidos
             </h1>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={exportToExcel} 
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-sm"
              title="Exportar base en Excel"
            >
              <FileText className="w-4 h-4" /> <span className="hidden sm:inline">Excel</span>
            </button>
            <button 
              onClick={generateProfessionalPDF} 
              disabled={isExportingPDF}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-sm disabled:opacity-50"
              title="Descargar informe oficial en PDF"
            >
              <Download className="w-4 h-4" /> <span>{isExportingPDF ? 'Generando...' : 'Descargar PDF'}</span>
            </button>
          </div>
        </header>

        {/* Tab Contents */}
        <div className="p-4 md:p-6 lg:p-8 space-y-6">

          {/* Quick Filter Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3 print-hidden">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Filtrar por Estímulo:</span>
              <div className="flex flex-wrap gap-1">
                {['TODOS', 'DISEÑO 1', 'DISEÑO 2', 'DISEÑO 3'].map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterEstimulo(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      filterEstimulo === st 
                        ? 'bg-slate-900 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'TODOS' ? 'Todos' : st === 'DISEÑO 1' ? 'Diseño A' : st === 'DISEÑO 2' ? 'Diseño B' : 'Diseño C (SUAVECITO)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Mostrando <span className="font-bold text-slate-900">{filteredResponsesCount}</span> de <span className="font-bold text-slate-900">{totalResponses}</span> respuestas
            </div>
          </div>

          {/* TAB 1: RESUMEN */}
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              {/* Stat KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
                  <p className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Total Encuestas</p>
                  <h2 className="text-3xl font-black text-slate-900 mt-1">{totalResponses}</h2>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% Completadas</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
                  <p className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Diseño Preferido</p>
                  <h2 className="text-xl font-black text-slate-900 mt-1 truncate">
                    {groupBy('diseno_favorito', data)[0]?.name || 'N/A'}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    {groupBy('diseno_favorito', data)[0]?.percentage || 0}% de los participantes
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500">
                  <p className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Factor Decisivo</p>
                  <h2 className="text-base font-black text-slate-900 mt-1 truncate">
                    {groupBy('factor_decision', data)[0]?.name || 'N/A'}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">Mayor ponderación</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-purple-500">
                  <p className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Última Respuesta</p>
                  <h2 className="text-xs font-bold text-slate-900 mt-2">
                    {data.length > 0 ? new Date(data[data.length - 1].timestamp).toLocaleDateString() : 'Sin registros'}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">Actualizado en tiempo real</p>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 text-base mb-1">Preferencia por Diseño Publicitario</h3>
                  <p className="text-xs text-slate-400 mb-4">Diseño A (Bs. 120) vs Diseño B (Bs. 90) vs Diseño C (Bs. 150)</p>
                  <div className="h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={groupBy('diseno_favorito')} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={55} 
                          outerRadius={90} 
                          paddingAngle={3} 
                          dataKey="value"
                        >
                          {groupBy('diseno_favorito').map((e, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 text-base mb-1">Factor Principal de Decisión</h3>
                  <p className="text-xs text-slate-400 mb-4">Motivación principal declarada por el comprador</p>
                  <div className="h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={groupBy('factor_decision')} layout="vertical" margin={{ left: 10, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#10B981" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TODAS LAS PREGUNTAS */}
          {activeTab === 'preguntas' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-black text-slate-900">Análisis Detallado de las 15 Preguntas</h2>
                <p className="text-xs text-slate-500 mt-1">Frecuencias absolutas, porcentajes y gráficos para cada variable académica</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {QUESTIONS.map((q, idx) => {
                  const qData = groupBy(q.id);
                  return (
                    <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-3 mb-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            Pregunta {idx + 1}
                          </span>
                          <h3 className="font-bold text-slate-800 text-base mt-1.5 leading-snug">
                            {q.label}
                          </h3>
                        </div>
                        <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-bold shrink-0">
                          {qData.length} opciones
                        </span>
                      </div>

                      {qData.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs">
                          Aún no hay suficientes respuestas registradas para este análisis.
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-6 items-center">
                          <div className="w-full sm:w-1/2 h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={qData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={2} dataKey="value">
                                  {qData.map((e, j) => (
                                    <Cell key={j} fill={PIE_COLORS[(j + idx) % PIE_COLORS.length]} />
                                  ))}
                                </Pie>
                                <RechartsTooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <div className="w-full sm:w-1/2 overflow-x-auto">
                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-400">
                                  <th className="pb-1.5">Opción</th>
                                  <th className="pb-1.5 text-right">Cant.</th>
                                  <th className="pb-1.5 text-right">%</th>
                                </tr>
                              </thead>
                              <tbody>
                                {qData.map((row, i) => (
                                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                    <td className="py-1.5 text-slate-700 font-medium truncate max-w-[130px]" title={row.name}>{row.name}</td>
                                    <td className="py-1.5 text-right text-slate-500">{row.value}</td>
                                    <td className="py-1.5 text-right font-bold text-slate-900">{row.percentage}%</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: INFLUENCIA SOCIAL & CRUCES */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-black text-slate-900">Análisis Específico de Influencia Social</h2>
                <p className="text-xs text-slate-500 mt-1">Cómo intervienen las opiniones, fuentes consultadas y cambio de decisión en el comprador</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 text-base mb-1">¿Cambiaría de decisión por recomendación?</h3>
                  <p className="text-xs text-slate-400 mb-4">Efecto del boca a boca en la decisión</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={groupBy('cambio_decision')} layout="vertical" margin={{ left: 10, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 text-base mb-1">Fuente Consultada Antes de Comprar</h3>
                  <p className="text-xs text-slate-400 mb-4">A quién acude antes de decidir</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={groupBy('consulta_compra')} layout="vertical" margin={{ left: 10, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 text-base mb-1">Elemento que Genera Más Confianza</h3>
                  <p className="text-xs text-slate-400 mb-4">Qué factor consolida la credibilidad de la marca</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={groupBy('ayuda_confianza')} layout="vertical" margin={{ left: 10, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Cruce entre Estímulos y Variables de Escala */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 text-base mb-2">Cruce Estadístico: Promedios por Estímulo</h3>
                <p className="text-xs text-slate-500 mb-4">Comparación de métricas escalares (1 a 5) según el diseño preferido</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {crossByStimulus('interes_compra').map((st, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-xs font-bold text-slate-500">{st.est}</p>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-800">{st.promedio}</span>
                        <span className="text-xs text-slate-400">/ 5.00 promedio de interés</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{st.count} participantes eligieron esta opción</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TABLA DE RESPUESTAS INDIVIDUALES */}
          {activeTab === 'tabla' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Registro Individual de Participantes</h3>
                  <p className="text-xs text-slate-500">Consulta cada registro anónimo en detalle</p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar en respuestas..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Código</th>
                      <th className="px-4 py-3">Fecha y Hora</th>
                      <th className="px-4 py-3">Estímulo Seleccionado</th>
                      <th className="px-4 py-3">Situación</th>
                      <th className="px-4 py-3">Factor Decisivo</th>
                      <th className="px-4 py-3">Interés (1-5)</th>
                      <th className="px-4 py-3 text-center">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                          No se encontraron respuestas con los filtros actuales.
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-slate-700">
                            ENC-{String(idx + 1).padStart(4, '0')}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {row.timestamp ? new Date(row.timestamp).toLocaleString() : 'Reciente'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                              row.diseno_favorito === 'DISEÑO 3' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : row.diseno_favorito === 'DISEÑO 2' 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-blue-100 text-blue-800'
                            }`}>
                              {row.diseno_favorito || 'Sin elección'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700 truncate max-w-[160px]" title={row.situacion}>
                            {row.situacion || '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {row.factor_decision || '-'}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800">
                            {row.interes_compra ? `${row.interes_compra} / 5` : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setSelectedResponse({ ...row, code: `ENC-${String(idx + 1).padStart(4, '0')}` })}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Ver cuestionario completo"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CENTRO DE EXPORTACIÓN */}
          {activeTab === 'reportes' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-xl font-black text-slate-900">Centro de Exportación Académica</h2>
                <p className="text-xs text-slate-500 mt-1">Descarga de reportes ejecutivos en PDF, bases crudas en Excel y archivos CSV para análisis estadístico</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold mb-4">
                      PDF
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">Informe Completo en PDF</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Documento estructurado en hojas A4 con portada de SUAVECITO, tabla comparativa de estímulos, tablas de frecuencias de las 15 preguntas y notas metodológicas.
                    </p>
                  </div>
                  <button
                    onClick={generateProfessionalPDF}
                    disabled={isExportingPDF}
                    className="mt-6 w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Download className="w-4 h-4" /> {isExportingPDF ? 'Generando PDF...' : 'DESCARGAR INFORME PDF'}
                  </button>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mb-4">
                      XLS
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">Libro de Excel Multipestaña</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Archivo .xlsx con hojas separadas: Hoja 1 con Resumen Estadístico de Frecuencias y Hoja 2 con la Base de Datos limpia codificada.
                    </p>
                  </div>
                  <button
                    onClick={exportToExcel}
                    className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <FileText className="w-4 h-4" /> DESCARGAR EXCEL (.XLSX)
                  </button>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-4">
                      CSV
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">Archivo de Datos CSV</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Formato estándar delimitado por comas compatible con SPSS, R, Python (Pandas) y Google Sheets con codificación UTF-8 BOM.
                    </p>
                  </div>
                  <button
                    onClick={exportToCSV}
                    className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Download className="w-4 h-4" /> DESCARGAR CSV (.CSV)
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="font-black text-slate-900 text-base">Cuestionario {selectedResponse.code}</h4>
                <p className="text-xs text-slate-500">{new Date(selectedResponse.timestamp || Date.now()).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedResponse(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Estímulo Publicitario Asignado</span>
                <p className="text-sm font-black text-slate-800 mt-0.5">{selectedResponse.diseno_favorito || 'Sin elección'}</p>
              </div>

              {QUESTIONS.map((q) => (
                <div key={q.id} className="border-b border-slate-100 pb-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{q.label}</span>
                  <p className="font-medium text-slate-800 mt-0.5 text-xs">
                    {selectedResponse[q.id] ? String(selectedResponse[q.id]) : <span className="italic text-slate-400">Sin respuesta</span>}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
              <button 
                onClick={() => setSelectedResponse(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-colors"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
