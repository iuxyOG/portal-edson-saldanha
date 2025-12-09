// PDF.js config
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js";

let loadedPdf = null;
let etiquetasImgs = [];

const fileInput = document.getElementById("pdfFile");
const btnProcess = document.getElementById("btnProcess");
const btnPDF = document.getElementById("btnPDF");
const preview = document.getElementById("preview");

fileInput.addEventListener("change", () => {
  loadedPdf = null;
  etiquetasImgs = [];
  preview.innerHTML = 'Arquivo carregado, clique em "Processar etiquetas" para continuar.';
});

btnProcess.addEventListener("click", async () => {
  if (!fileInput.files[0]) {
    alert("Selecione um PDF de etiquetas da Shopee primeiro.");
    return;
  }

  btnProcess.disabled = true;
  btnProcess.textContent = "Processando...";

  try {
    const arrayBuffer = await fileInput.files[0].arrayBuffer();
    loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    etiquetasImgs = [];
    preview.innerHTML = "Processando páginas...";

    for (let pageNum = 1; pageNum <= loadedPdf.numPages; pageNum++) {
      const page = await loadedPdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      // Divide a página em 4 quadrantes (2x2) e trata cada um como uma etiqueta
      const cols = 2;
      const rows = 2;
      const etiquetaW = canvas.width / cols;
      const etiquetaH = canvas.height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const subCanvas = document.createElement("canvas");
          const subCtx = subCanvas.getContext("2d");
          subCanvas.width = etiquetaW;
          subCanvas.height = etiquetaH;

          subCtx.drawImage(
            canvas,
            c * etiquetaW,
            r * etiquetaH,
            etiquetaW,
            etiquetaH,
            0,
            0,
            etiquetaW,
            etiquetaH
          );

          const dataUrl = subCanvas.toDataURL("image/png");
          etiquetasImgs.push(dataUrl);
        }
      }
    }

    renderPreview();
  } catch (error) {
    console.error(error);
    alert("Ocorreu um erro ao processar o PDF. Tente novamente.");
  } finally {
    btnProcess.disabled = false;
    btnProcess.textContent = "Processar etiquetas";
  }
});

function renderPreview() {
  if (!etiquetasImgs.length) {
    preview.textContent = "Nenhuma etiqueta detectada.";
    return;
  }
  preview.innerHTML = "";
  etiquetasImgs.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.className = "etiqueta-img";
    preview.appendChild(img);
  });
}

btnPDF.addEventListener("click", () => {
  if (!etiquetasImgs.length) {
    alert("Nenhuma etiqueta processada ainda.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [100, 150] // 10x15
  });

  etiquetasImgs.forEach((src, idx) => {
    if (idx > 0) doc.addPage();
    doc.addImage(src, "PNG", 5, 5, 90, 140, undefined, "FAST");
  });

  doc.save("etiquetas-10x15.pdf");
});
