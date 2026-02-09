import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getLogoBase64 } from './pdfLogoHelper';

interface CandidateReport {
  full_name: string;
  current_grade: string;
  target_grade: string;
  federation: string;
  association?: string;
  birth_date: string;
  accumulated_points?: number;
}

interface EvaluationReport {
  candidate_name: string;
  target_grade: string;
  evaluator_name: string;
  evaluation_date: string;
  nota_teorica: number;
  nota_pratica: number;
  nota_final: number;
  status: string;
}

interface StatsReport {
  totalCandidates: number;
  totalEvaluations: number;
  approved: number;
  rejected: number;
  pending: number;
  averageScore: number;
  approvalRate: number;
  gradeStats: { grade: string; total: number; approved: number; averageScore: number }[];
}

async function addHeader(doc: jsPDF, title: string, subtitle?: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header background
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Logo
  const logoBase64 = await getLogoBase64();
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 8, 3, 20, 29);
  }
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SHODAN - Sistema de Avaliação', pageWidth / 2, 14, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(title, pageWidth / 2, 24, { align: 'center' });
  
  if (subtitle) {
    doc.setFontSize(10);
    doc.text(subtitle, pageWidth / 2, 32, { align: 'center' });
  }
  
  doc.setTextColor(0, 0, 0);
}

function addFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
}

export async function generateCandidatesReportPDF(candidates: CandidateReport[]) {
  const doc = new jsPDF();
  
  await addHeader(doc, 'Relatório de Candidatos', `Total: ${candidates.length} candidato(s)`);
  
  const tableData = candidates.map(c => [
    c.full_name,
    c.current_grade,
    c.target_grade,
    c.federation,
    c.association || '-',
    formatDate(c.birth_date),
    c.accumulated_points?.toString() || '0',
  ]);
  
  autoTable(doc, {
    startY: 45,
    head: [['Nome', 'Grau Atual', 'Grau Pretendido', 'Federação', 'Associação', 'Nascimento', 'Pontos']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [26, 26, 26],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 22 },
      2: { cellWidth: 22 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 22 },
      6: { cellWidth: 18, halign: 'center' },
    },
    margin: { left: 10, right: 10 },
  });
  
  addFooter(doc);
  
  doc.save(`relatorio_candidatos_${new Date().toISOString().split('T')[0]}.pdf`);
}

export async function generateEvaluationsReportPDF(evaluations: EvaluationReport[]) {
  const doc = new jsPDF();
  
  await addHeader(doc, 'Relatório de Avaliações', `Total: ${evaluations.length} avaliação(ões)`);
  
  const statusMap: Record<string, string> = {
    aprovado: 'Aprovado',
    reprovado: 'Reprovado',
    pendente: 'Pendente',
  };
  
  const tableData = evaluations.map(e => [
    e.candidate_name,
    e.target_grade,
    e.evaluator_name,
    formatDate(e.evaluation_date),
    e.nota_teorica?.toFixed(2) || '-',
    e.nota_pratica?.toFixed(2) || '-',
    e.nota_final?.toFixed(2) || '-',
    statusMap[e.status] || e.status,
  ]);
  
  autoTable(doc, {
    startY: 45,
    head: [['Candidato', 'Graduação', 'Avaliador', 'Data', 'Teórica', 'Prática', 'Final', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [26, 26, 26],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 20 },
      2: { cellWidth: 30 },
      3: { cellWidth: 22 },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 18, halign: 'center' },
      6: { cellWidth: 18, halign: 'center' },
      7: { cellWidth: 20, halign: 'center' },
    },
    margin: { left: 10, right: 10 },
    didParseCell: (data) => {
      if (data.column.index === 7 && data.section === 'body') {
        const status = evaluations[data.row.index]?.status;
        if (status === 'aprovado') {
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'reprovado') {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });
  
  addFooter(doc);
  
  doc.save(`relatorio_avaliacoes_${new Date().toISOString().split('T')[0]}.pdf`);
}

export async function generateStatsReportPDF(stats: StatsReport) {
  const doc = new jsPDF();
  
  await addHeader(doc, 'Relatório Estatístico', 'Resumo Geral do Sistema');
  
  let y = 50;
  
  // General Stats Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text('Resumo Geral', 14, y);
  doc.setTextColor(0, 0, 0);
  
  y += 10;
  
  const generalStats = [
    ['Total de Candidatos', stats.totalCandidates.toString()],
    ['Total de Avaliações', stats.totalEvaluations.toString()],
    ['Aprovados', stats.approved.toString()],
    ['Reprovados', stats.rejected.toString()],
    ['Pendentes', stats.pending.toString()],
    ['Nota Média Geral', stats.averageScore.toFixed(2)],
    ['Taxa de Aprovação', `${stats.approvalRate.toFixed(1)}%`],
  ];
  
  autoTable(doc, {
    startY: y,
    head: [['Métrica', 'Valor']],
    body: generalStats,
    theme: 'striped',
    headStyles: {
      fillColor: [26, 26, 26],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40, halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
    tableWidth: 130,
  });
  
  // @ts-ignore
  y = doc.lastAutoTable.finalY + 20;
  
  // Stats by Grade Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text('Estatísticas por Graduação', 14, y);
  doc.setTextColor(0, 0, 0);
  
  y += 10;
  
  const gradeData = stats.gradeStats.map(g => [
    `${g.grade}º DAN`,
    g.total.toString(),
    g.approved.toString(),
    g.averageScore > 0 ? g.averageScore.toFixed(2) : '-',
  ]);
  
  autoTable(doc, {
    startY: y,
    head: [['Graduação', 'Total', 'Aprovados', 'Média']],
    body: gradeData,
    theme: 'striped',
    headStyles: {
      fillColor: [26, 26, 26],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
    tableWidth: 130,
  });
  
  addFooter(doc);
  
  doc.save(`relatorio_estatistico_${new Date().toISOString().split('T')[0]}.pdf`);
}
