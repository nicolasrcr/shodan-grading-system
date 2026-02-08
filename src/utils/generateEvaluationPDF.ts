import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface EvaluationPDFData {
  candidateName: string;
  targetGrade: string;
  evaluatorName: string;
  evaluatorGrade: string;
  evaluationDate: string;
  location: string;
  observations: string;
  teoriaScores: { label: string; score: string }[];
  praticaScores: { label: string; score: string }[];
  notaTeorica: number;
  notaPratica: number;
  notaFinal: number;
  status?: 'aprovado' | 'reprovado' | 'pendente';
}

export function generateEvaluationPDF(data: EvaluationPDFData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(26, 26, 26); // primary dark
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SÚMULA DE AVALIAÇÃO', pageWidth / 2, 18, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Exame de Graduação - Regulamento CBJ 2018', pageWidth / 2, 28, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Graduação: ${data.targetGrade}`, pageWidth / 2, 36, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Candidate Info Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CANDIDATO', 14, 52);
  
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 54, pageWidth - 14, 54);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const infoY = 62;
  doc.text(`Candidato: ${data.candidateName}`, 14, infoY);
  doc.text(`Data: ${formatDate(data.evaluationDate)}`, pageWidth - 60, infoY);
  
  doc.text(`Avaliador: ${data.evaluatorName}`, 14, infoY + 8);
  doc.text(`Graduação do Avaliador: ${data.evaluatorGrade}`, pageWidth - 80, infoY + 8);
  
  if (data.location) {
    doc.text(`Local: ${data.location}`, 14, infoY + 16);
  }
  
  // Theoretical Scores Table
  let currentY = infoY + 30;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28); // accent red
  doc.text('PROVA TEÓRICA', 14, currentY);
  doc.setTextColor(0, 0, 0);
  
  const teoriaTableData = data.teoriaScores.map(item => [item.label, item.score || '-']);
  
  autoTable(doc, {
    startY: currentY + 4,
    head: [['Critério', 'Nota']],
    body: teoriaTableData,
    theme: 'striped',
    headStyles: {
      fillColor: [26, 26, 26],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 30, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });
  
  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 4;
  
  // Theoretical Average
  doc.setFillColor(240, 240, 240);
  doc.rect(14, currentY, pageWidth - 28, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Média Teórica:', 18, currentY + 7);
  doc.text(data.notaTeorica.toFixed(2), pageWidth - 30, currentY + 7, { align: 'right' });
  
  currentY += 18;
  
  // Practical Scores Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74); // success green
  doc.text('PROVA PRÁTICA', 14, currentY);
  doc.setTextColor(0, 0, 0);
  
  const praticaTableData = data.praticaScores.map(item => [item.label, item.score || '-']);
  
  autoTable(doc, {
    startY: currentY + 4,
    head: [['Critério', 'Nota']],
    body: praticaTableData,
    theme: 'striped',
    headStyles: {
      fillColor: [26, 26, 26],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 30, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });
  
  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 4;
  
  // Practical Average
  doc.setFillColor(240, 240, 240);
  doc.rect(14, currentY, pageWidth - 28, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Média Prática:', 18, currentY + 7);
  doc.text(data.notaPratica.toFixed(2), pageWidth - 30, currentY + 7, { align: 'right' });
  
  currentY += 18;
  
  // Final Result
  const isApproved = data.status === 'aprovado' || data.notaFinal >= 7;
  const statusColor = isApproved ? [22, 163, 74] : [185, 28, 28];
  const statusText = data.status 
    ? data.status.toUpperCase() 
    : (isApproved ? 'APROVADO' : 'REPROVADO');
  
  doc.setFillColor(26, 26, 26);
  doc.rect(14, currentY, pageWidth - 28, 20, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('NOTA FINAL:', 20, currentY + 13);
  doc.text(data.notaFinal.toFixed(2), pageWidth / 2, currentY + 13, { align: 'center' });
  
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth - 60, currentY + 3, 44, 14, 2, 2, 'F');
  doc.setFontSize(10);
  doc.text(statusText, pageWidth - 38, currentY + 12, { align: 'center' });
  
  currentY += 28;
  doc.setTextColor(0, 0, 0);
  
  // Observations
  if (data.observations) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVAÇÕES', 14, currentY);
    
    doc.setDrawColor(200, 200, 200);
    doc.rect(14, currentY + 4, pageWidth - 28, 30);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitObservations = doc.splitTextToSize(data.observations, pageWidth - 36);
    doc.text(splitObservations, 18, currentY + 12);
    
    currentY += 40;
  }
  
  // Signatures Section
  currentY = Math.max(currentY + 10, 240);
  
  doc.setDrawColor(0, 0, 0);
  
  // Evaluator signature
  doc.line(14, currentY, 90, currentY);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Assinatura do Avaliador', 52, currentY + 6, { align: 'center' });
  
  // Candidate signature
  doc.line(pageWidth - 90, currentY, pageWidth - 14, currentY);
  doc.text('Assinatura do Candidato', pageWidth - 52, currentY + 6, { align: 'center' });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    pageWidth / 2,
    285,
    { align: 'center' }
  );
  doc.text('SHODAN - Sistema de Avaliação de Graduação', pageWidth / 2, 290, { align: 'center' });
  
  // Save the PDF
  const fileName = `sumula_${data.candidateName.replace(/\s+/g, '_')}_${data.targetGrade.replace(/\s+/g, '_')}_${data.evaluationDate}.pdf`;
  doc.save(fileName);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
}
