import jsPDF from 'jspdf';
import { Report, User } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export class PDFService {
  private static readonly LOGO_DATA = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjBiNzAwIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzFmMjkzNyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VEFNQk9VUkE8L3RleHQ+Cjwvc3ZnPg==';

  static async generateReport(report: Report, agent: User): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    
    let yPosition = margin;

    // Header with logo and title
    await this.addHeader(pdf, pageWidth, yPosition);
    yPosition += 40;

    // Report information
    yPosition = this.addReportInfo(pdf, report, agent, margin, yPosition);
    
    // Incident details
    yPosition = this.addIncidentDetails(pdf, report, margin, yPosition, pageWidth);
    
    // Involved persons
    if (report.involvedPersons.length > 0) {
      yPosition = this.addInvolvedPersons(pdf, report, margin, yPosition, pageWidth);
    }
    
    // Check if we need a new page for photos/signatures
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      yPosition = margin;
    }
    
    // Photos
    if (report.photos.length > 0) {
      yPosition = await this.addPhotos(pdf, report, margin, yPosition, pageWidth);
    }
    
    // Signatures
    yPosition = await this.addSignatures(pdf, report, margin, yPosition);
    
    // Footer
    this.addFooter(pdf, pageHeight);

    return pdf.output('blob');
  }

  private static async addHeader(pdf: jsPDF, pageWidth: number, yPosition: number): Promise<void> {
    // Logo
    pdf.addImage(this.LOGO_DATA, 'PNG', 20, yPosition - 10, 20, 20);
    
    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CONSTAT D\'INTERVENTION', pageWidth / 2, yPosition, { align: 'center' });
    
    // Subtitle
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Forces de l\'ordre - République du Mali', pageWidth / 2, yPosition + 8, { align: 'center' });
    
    // Line separator
    pdf.setDrawColor(0, 0, 0);
    pdf.line(20, yPosition + 15, pageWidth - 20, yPosition + 15);
  }

  private static addReportInfo(pdf: jsPDF, report: Report, agent: User, margin: number, yPosition: number): number {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORMATIONS GÉNÉRALES', margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const info = [
      `N° de constat: ${report.id}`,
      `Date: ${format(new Date(report.dateTime), 'dd/MM/yyyy à HH:mm', { locale: fr })}`,
      `Agent: ${agent.firstName} ${agent.lastName} (${agent.matricule})`,
      `Unité: ${agent.unit || 'Non spécifiée'}`,
      `Zone: ${agent.zone || 'Non spécifiée'}`,
      `Statut: ${this.getStatusText(report.status)}`
    ];
    
    info.forEach(line => {
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    });
    
    return yPosition + 10;
  }

  private static addIncidentDetails(pdf: jsPDF, report: Report, margin: number, yPosition: number, pageWidth: number): number {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DÉTAILS DE L\'INCIDENT', margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Type of incident
    pdf.text(`Type d'incident: ${this.getIncidentTypeText(report.incidentType)}`, margin, yPosition);
    yPosition += 8;
    
    // Location
    pdf.text('Lieu:', margin, yPosition);
    yPosition += 5;
    const locationLines = pdf.splitTextToSize(report.location.address, pageWidth - 2 * margin);
    pdf.text(locationLines, margin + 5, yPosition);
    yPosition += locationLines.length * 5 + 5;
    
    // Coordinates if available
    if (report.location.coordinates) {
      pdf.text(`Coordonnées: ${report.location.coordinates.latitude.toFixed(6)}, ${report.location.coordinates.longitude.toFixed(6)}`, margin, yPosition);
      yPosition += 8;
    }
    
    // Description
    pdf.text('Description:', margin, yPosition);
    yPosition += 5;
    const descriptionLines = pdf.splitTextToSize(report.description, pageWidth - 2 * margin);
    pdf.text(descriptionLines, margin + 5, yPosition);
    yPosition += descriptionLines.length * 5 + 10;
    
    return yPosition;
  }

  private static addInvolvedPersons(pdf: jsPDF, report: Report, margin: number, yPosition: number, pageWidth: number): number {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PERSONNES IMPLIQUÉES', margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    report.involvedPersons.forEach((person, index) => {
      pdf.text(`${index + 1}. ${person.name} (${this.getPersonStatusText(person.status)})`, margin, yPosition);
      yPosition += 5;
      
      if (person.phone) {
        pdf.text(`   Téléphone: ${person.phone}`, margin, yPosition);
        yPosition += 5;
      }
      
      if (person.details) {
        const detailLines = pdf.splitTextToSize(`   Détails: ${person.details}`, pageWidth - 2 * margin);
        pdf.text(detailLines, margin, yPosition);
        yPosition += detailLines.length * 5;
      }
      
      yPosition += 3;
    });
    
    return yPosition + 5;
  }

  private static async addPhotos(pdf: jsPDF, report: Report, margin: number, yPosition: number, pageWidth: number): Promise<number> {
    if (report.photos.length === 0) return yPosition;
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PHOTOS', margin, yPosition);
    yPosition += 10;
    
    const photoWidth = 60;
    const photoHeight = 45;
    let currentX = margin;
    let currentY = yPosition;
    
    for (let i = 0; i < Math.min(report.photos.length, 4); i++) {
      const photo = report.photos[i];
      
      try {
        // In a real implementation, you would load the actual image
        // For demo, we'll create a placeholder
        pdf.setFillColor(200, 200, 200);
        pdf.rect(currentX, currentY, photoWidth, photoHeight, 'F');
        
        pdf.setFontSize(8);
        pdf.text(`Photo ${i + 1}`, currentX + photoWidth / 2, currentY + photoHeight / 2, { align: 'center' });
        
        if (photo.caption) {
          pdf.text(photo.caption, currentX + photoWidth / 2, currentY + photoHeight + 5, { align: 'center' });
        }
        
        currentX += photoWidth + 10;
        if (currentX + photoWidth > pageWidth - margin) {
          currentX = margin;
          currentY += photoHeight + 15;
        }
      } catch (error) {
        console.error('Error adding photo to PDF:', error);
      }
    }
    
    return currentY + photoHeight + 20;
  }

  private static async addSignatures(pdf: jsPDF, report: Report, margin: number, yPosition: number): Promise<number> {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SIGNATURES', margin, yPosition);
    yPosition += 15;
    
    const signatureWidth = 80;
    const signatureHeight = 40;
    
    // Agent signature
    if (report.agentSignature) {
      pdf.setFontSize(10);
      pdf.text('Signature de l\'agent:', margin, yPosition);
      yPosition += 5;
      
      pdf.setDrawColor(0, 0, 0);
      pdf.rect(margin, yPosition, signatureWidth, signatureHeight);
      
      // In a real implementation, you would add the actual signature image
      pdf.setFontSize(8);
      pdf.text('Signature agent', margin + signatureWidth / 2, yPosition + signatureHeight / 2, { align: 'center' });
      
      yPosition += signatureHeight + 10;
    }
    
    // Witness signature
    if (report.witnessSignature) {
      pdf.setFontSize(10);
      pdf.text('Signature du témoin:', margin, yPosition);
      yPosition += 5;
      
      pdf.setDrawColor(0, 0, 0);
      pdf.rect(margin, yPosition, signatureWidth, signatureHeight);
      
      pdf.setFontSize(8);
      pdf.text('Signature témoin', margin + signatureWidth / 2, yPosition + signatureHeight / 2, { align: 'center' });
      
      yPosition += signatureHeight + 10;
    }
    
    return yPosition;
  }

  private static addFooter(pdf: jsPDF, pageHeight: number): void {
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')} par l'application Tamboura`, 
             pdf.internal.pageSize.getWidth() / 2, pageHeight - 10, { align: 'center' });
  }

  private static getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'draft': 'Brouillon',
      'pending': 'En attente',
      'completed': 'Terminé',
      'signed': 'Signé'
    };
    return statusMap[status] || status;
  }

  private static getIncidentTypeText(type: string): string {
    const typeMap: { [key: string]: string } = {
      'accident': 'Accident',
      'theft': 'Vol',
      'assault': 'Agression',
      'vandalism': 'Vandalisme',
      'disturbance': 'Trouble de l\'ordre',
      'fire': 'Incendie',
      'medical': 'Urgence médicale',
      'other': 'Autre'
    };
    return typeMap[type] || type;
  }

  private static getPersonStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'victim': 'Victime',
      'witness': 'Témoin',
      'suspect': 'Suspect',
      'other': 'Autre'
    };
    return statusMap[status] || status;
  }

  static async exportToPDF(report: Report, agent: User, filename?: string): Promise<void> {
    const pdfBlob = await this.generateReport(report, agent);
    const url = URL.createObjectURL(pdfBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `constat-${report.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}