import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

/**
 * Extracts and cleans text from a PDF file.
 * Uses pdfjs-dist as primary extractor (supports Canva, Word, Overleaf, Chrome PDF, etc.)
 * with pdf-parse as secondary fallback.
 * 
 * Returns { text, wordCount, detectedSections, preview }.
 * Throws a descriptive error if the PDF cannot be read.
 */
export const extractTextFromPDF = async (filePath) => {
  // Validate file exists
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('PDF file not found on server. Please re-upload and try again.');
  }

  // Validate file size (max 5 MB)
  const stat = fs.statSync(filePath);
  if (stat.size > 5 * 1024 * 1024) {
    throw new Error('PDF file exceeds 5 MB limit. Please upload a smaller file.');
  }

  let rawText = '';

  // Primary Extractor: pdfjs-dist
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(dataBuffer),
      useSystemFonts: true,
      disableFontFace: true,
      isEvalSupported: false,
    });
    const pdfDocument = await loadingTask.promise;

    const pageTexts = [];
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageStr = textContent.items
        .map(item => ('str' in item ? item.str : ''))
        .join(' ');
      pageTexts.push(pageStr);
    }
    rawText = pageTexts.join('\n\n');
  } catch (pdfjsErr) {
    console.warn('[PDF] pdfjs-dist extraction failed, attempting pdf-parse fallback:', pdfjsErr.message);

    // Fallback Extractor: pdf-parse
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js').catch(() => import('pdf-parse'));
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const data = await pdfParse(dataBuffer);
      rawText = data.text || '';
    } catch (parseErr) {
      console.error('[PDF] Extraction error:', parseErr.message);
      if (parseErr.message?.includes('encrypted') || parseErr.message?.includes('password') || pdfjsErr.message?.includes('password') || pdfjsErr.message?.includes('encrypted')) {
        throw new Error('This PDF is password-protected or encrypted. Please upload an unencrypted PDF.');
      }
      throw new Error('Unable to read this PDF. The file may be image-based, encrypted, or corrupted. Please upload a text-based PDF resume.');
    }
  }

  // Clean extracted text
  const cleanedText = rawText
    .replace(/\r\n/g, '\n')          // normalize line endings
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')             // tabs → spaces
    .replace(/[ \t]{3,}/g, '  ')     // collapse long whitespace runs
    .replace(/\n{4,}/g, '\n\n\n')    // max 3 consecutive blank lines
    .replace(/[\x00-\x08\x0B\x0E-\x1F\x7F]/g, '') // remove control chars
    .trim();

  if (cleanedText.length < 50) {
    throw new Error('The PDF appears to be empty or image-based. Please upload a resume with selectable text.');
  }

  // Detect which sections are present (used for frontend display)
  const lower = cleanedText.toLowerCase();
  const detectedSections = [];
  if (lower.includes('education') || lower.includes('b.tech') || lower.includes('university') || lower.includes('college')) detectedSections.push('Education');
  if (lower.includes('experience') || lower.includes('internship') || lower.includes('work'))  detectedSections.push('Experience');
  if (lower.includes('project'))                                     detectedSections.push('Projects');
  if (lower.includes('skill'))                                        detectedSections.push('Skills');
  if (lower.includes('certif'))                                       detectedSections.push('Certifications');
  if (lower.includes('summary') || lower.includes('objective') || lower.includes('profile'))       detectedSections.push('Summary');
  if (lower.includes('achievement') || lower.includes('award') || lower.includes('honors'))       detectedSections.push('Achievements');

  // Extract a preview (first 300 chars cleaned) for display
  const preview = cleanedText.slice(0, 300).replace(/\n+/g, ' ').trim();

  return {
    text: cleanedText,
    wordCount: cleanedText.split(/\s+/).length,
    detectedSections,
    preview,
  };
};
