async function extractPdfText(file) {
  const pdfjsLib = await import('pdfjs-dist');
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(' '));
  }

  return pages.join('\n\n');
}

async function extractDocxText(file) {
  const { default: mammoth } = await import('mammoth/mammoth.browser.js');
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value;
}

async function extractPptxText(file) {
  const { default: JSZip } = await import('jszip');
  const archive = await JSZip.loadAsync(await file.arrayBuffer());
  const slideFiles = Object.keys(archive.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((first, second) => {
      const firstNumber = Number(first.match(/slide(\d+)/)[1]);
      const secondNumber = Number(second.match(/slide(\d+)/)[1]);
      return firstNumber - secondNumber;
    });

  const slides = [];
  for (const slideFile of slideFiles) {
    const xml = await archive.file(slideFile).async('text');
    const document = new DOMParser().parseFromString(xml, 'application/xml');
    const textNodes = document.getElementsByTagNameNS(
      'http://schemas.openxmlformats.org/drawingml/2006/main',
      't',
    );
    slides.push(Array.from(textNodes, (node) => node.textContent).join(' '));
  }

  return slides.join('\n\n');
}

export async function extractTextFromFile(file) {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'txt') return file.text();
  if (extension === 'pdf') return extractPdfText(file);
  if (extension === 'docx') return extractDocxText(file);
  if (extension === 'pptx') return extractPptxText(file);

  throw new Error('Please upload a PDF, DOCX, PPTX, or TXT file.');
}
