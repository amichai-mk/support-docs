import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function PreviewPanel({ formData }) {
  const contentRef = useRef(null);

  const generatePlainText = () => {
    let text = '';
    text += `Article ID: ${formData.article_id || 'Pending'}\n`;
    text += `Title: ${formData.title || 'Untitled Article'}\n`;
    if (formData.product_area) text += `Product Area: ${formData.product_area}\n`;
    text += '\n';

    if (formData.issue) {
      text += `== ISSUE ==\n${formData.issue}\n\n`;
    }

    if (formData.environment) {
      text += `== ENVIRONMENT ==\n${formData.environment}\n\n`;
    }

    if (formData.cause) {
      text += `== CAUSE ==\n${formData.cause}\n\n`;
    }

    if (formData.resolutions?.length > 0 && formData.resolutions.some(r => r.steps?.length > 0)) {
      text += `== RESOLUTION ==\n`;
      formData.resolutions.forEach((resolution, resIndex) => {
        if (!resolution.steps?.length) return;
        if (formData.resolutions.length > 1) {
          text += `\n${resolution.title || `Option ${resIndex + 1}`}\n`;
        }
        resolution.steps.forEach((step, stepIndex) => {
          const stepText = typeof step === 'string' ? step : step?.text || '';
          text += `${stepIndex + 1}. ${stepText}\n`;
        });
        if (resolution.verification) {
          text += `\nVerification: ${resolution.verification}\n`;
        }
      });
      text += '\n';
    }

    if (formData.tags?.length > 0) {
      text += `Tags: ${formData.tags.join(', ')}\n`;
    }

    return text;
  };

  const handleCopy = async () => {
    const text = generatePlainText();
    await navigator.clipboard.writeText(text);
    toast.success('Article copied to clipboard');
  };

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    
    toast.info('Generating PDF...');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Content area settings
    const contentStartY = 25;
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    const usableHeight = pageHeight - contentStartY - margin;
    
    // Capture content at higher resolution
    const canvas = await html2canvas(contentRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: contentRef.current.scrollWidth,
    });
    
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Calculate how many pages we need
    const totalPages = Math.ceil(imgHeight / usableHeight);
    
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }
      
      // Add text header on each page
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KCS Knowledge Base', pageWidth / 2, 12, { align: 'center' });
      
      // Calculate the portion of the canvas to render on this page
      const sourceY = page * (usableHeight / imgHeight) * canvas.height;
      const sourceHeight = Math.min(
        (usableHeight / imgHeight) * canvas.height,
        canvas.height - sourceY
      );
      
      // Create a temporary canvas for this page's portion
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;
      
      const ctx = pageCanvas.getContext('2d');
      ctx.drawImage(
        canvas,
        0, sourceY, canvas.width, sourceHeight,
        0, 0, canvas.width, sourceHeight
      );
      
      const pageImgData = pageCanvas.toDataURL('image/png');
      const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;
      
      pdf.addImage(pageImgData, 'PNG', margin, contentStartY, imgWidth, pageImgHeight);
    }
    
    pdf.save(`${formData.article_id || 'article'}.pdf`);
    toast.success('PDF exported successfully');
  };

  return (
    <Card className="bg-white">
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Article Preview
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-1" />
              Export PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6" ref={contentRef}>
        {/* Title */}
        <div>
          <div className="text-sm font-mono text-gray-500 mb-2">
            Article ID: {formData.article_id || 'Pending'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{formData.title || 'Untitled Article'}</h1>
          {formData.product_area && (
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {formData.product_area}
            </span>
          )}
        </div>

        {/* Issue */}
        {formData.issue && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 pb-2 border-b-2 border-red-500">Issue</h2>
            <p className="text-gray-700">{formData.issue}</p>
          </div>
        )}

        {/* Environment */}
        {formData.environment && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 pb-2 border-b-2 border-blue-500">Environment</h2>
            <pre className="text-gray-700 whitespace-pre-wrap font-sans">{formData.environment}</pre>
          </div>
        )}

        {/* Cause */}
        {formData.cause && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 pb-2 border-b-2 border-yellow-500">Cause</h2>
            <p className="text-gray-700">{formData.cause}</p>
          </div>
        )}

        {/* Resolution */}
        {(formData.resolutions?.length > 0 && formData.resolutions.some(r => r.steps?.length > 0)) && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 pb-2 border-b-2 border-green-500">Resolution</h2>
            {formData.resolutions.map((resolution, resIndex) => {
              const hasMultiple = formData.resolutions.length > 1;
              if (!resolution.steps?.length) return null;
              
              return (
                <div key={resIndex} className={hasMultiple ? 'mb-6' : ''}>
                  {hasMultiple && (
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      {resolution.title || `Option ${resIndex + 1}`}
                    </h3>
                  )}
                  <ol className="list-decimal list-inside space-y-4 mb-4">
                    {resolution.steps.map((step, stepIndex) => {
                      const stepText = typeof step === 'string' ? step : step?.text || '';
                      const stepImage = typeof step === 'object' ? step?.image : null;
                      return (
                        <li key={stepIndex} className="text-gray-700">
                          {stepText}
                          {stepImage && (
                            <img src={stepImage} alt={`Step ${stepIndex + 1}`} className="mt-2 ml-4 max-h-48 rounded border" />
                          )}
                        </li>
                      );
                    })}
                  </ol>
                  {resolution.verification && (
                    <p className="text-gray-700 mt-4">
                      <strong>Verification:</strong> {resolution.verification}.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Visual Assets */}
        {formData.visual_assets?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 pb-2 border-b-2 border-purple-500">Visual Aids</h2>
            <div className="space-y-4">
              {formData.visual_assets.map((asset, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  {asset.type === 'image' && (
                    <img src={asset.url} alt={asset.caption || 'Visual asset'} className="w-full rounded" />
                  )}
                  {asset.type === 'video' && (
                    <video src={asset.url} controls className="w-full rounded" />
                  )}
                  {asset.type === 'youtube' && (
                    <div className="aspect-video">
                      <iframe
                        src={asset.url.replace('watch?v=', 'embed/')}
                        className="w-full h-full rounded"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {asset.type === 'iframe' && (
                    <div className="aspect-video">
                      <iframe
                        src={asset.url}
                        className="w-full h-full rounded border"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {asset.caption && (
                    <p className="text-sm text-gray-600 mt-2 italic">{asset.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {formData.tags?.length > 0 && (
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}