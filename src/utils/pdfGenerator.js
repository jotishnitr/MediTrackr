import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Strips conversational preamble & postamble from AI response text.
 */
function cleanReportText(rawText) {
  if (!rawText) return "";

  const lines = rawText.split("\n");
  const filtered = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip conversational greetings / intro chatter
    if (
      i < 6 &&
      (line.toLowerCase().includes("i've retrieved") ||
        line.toLowerCase().includes("here is your") ||
        line.toLowerCase().includes("here's your") ||
        line.toLowerCase().includes("based on your records") ||
        line.toLowerCase().includes("sure, here is") ||
        line.toLowerCase().includes("analyzing your health") ||
        line.toLowerCase().includes("i have compiled"))
    ) {
      continue;
    }

    // Skip conversational outro chatter
    if (
      i > lines.length - 6 &&
      (line.toLowerCase().includes("would you like me to") ||
        line.toLowerCase().includes("let me know if") ||
        line.toLowerCase().includes("feel free to ask") ||
        line.toLowerCase().includes("hope this helps") ||
        line.toLowerCase().includes("if you have any questions"))
    ) {
      continue;
    }

    filtered.push(lines[i]);
  }

  return filtered.join("\n").trim();
}

/**
 * Parses markdown inline formatting (bold, italic, code, badges, clean emojis).
 */
function parseInlineMarkdown(text) {
  if (!text) return "";

  let parsed = text
    // Replace markdown bold **text**
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Replace markdown italic *text*
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    // Replace inline code `code`
    .replace(/`(.*?)`/g, "<code>$1</code>")
    // Format status tags into styled badges
    .replace(/\bActive\b/g, '<span class="pill pill-success">Active</span>')
    .replace(/\b(Inactive|\*Inactive\*)\b/gi, '<span class="pill pill-warning">Inactive</span>')
    .replace(/\b(Taken|Completed)\b/gi, '<span class="pill pill-success">$1</span>')
    .replace(/\b(Pending)\b/gi, '<span class="pill pill-info">$1</span>')
    .replace(/\b(Missed)\b/gi, '<span class="pill pill-danger">$1</span>');

  return parsed;
}

/**
 * Converts markdown text into semantic HTML structured for a medical report.
 */
function markdownToReportHtml(markdown, userName, reportDate) {
  const cleaned = cleanReportText(markdown);
  const lines = cleaned.split("\n");

  let html = `
    <div class="meditrackr-report-root">
      <!-- Report Header Banner -->
      <div class="report-header">
        <div class="header-left">
          <div class="brand-row">
            <span class="brand-badge">MediTrackr</span>
            <span class="report-type-tag">Official Health OS Report</span>
          </div>
          <h1 class="report-main-title">Clinical Health & Medication Summary</h1>
          <p class="report-subtitle">Personal Health Record & Treatment Protocol Review</p>
        </div>
        <div class="header-right">
          <div class="meta-box">
            <div class="meta-item"><span class="meta-label">Patient:</span> <span class="meta-val">${userName}</span></div>
            <div class="meta-item"><span class="meta-label">Generated:</span> <span class="meta-val">${reportDate}</span></div>
            <div class="meta-item"><span class="meta-label">Classification:</span> <span class="meta-val confidential-pill">CONFIDENTIAL</span></div>
          </div>
        </div>
      </div>
      <div class="report-body">
  `;

  let inTable = false;
  let tableHeaders = [];
  let tableRows = [];
  let inList = false;
  let listType = "ul";

  const flushTable = () => {
    if (!inTable) return;
    html += `
      <div class="table-container">
        <table class="clinical-table">
          <thead>
            <tr>
              ${tableHeaders.map((h) => `<th>${parseInlineMarkdown(h)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${tableRows
              .map(
                (row, rIdx) => `
              <tr class="${rIdx % 2 === 0 ? "row-even" : "row-odd"}">
                ${row.map((cell) => `<td>${parseInlineMarkdown(cell)}</td>`).join("")}
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
    inTable = false;
    tableHeaders = [];
    tableRows = [];
  };

  const flushList = () => {
    if (!inList) return;
    html += `</${listType}>`;
    inList = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Blank line
    if (!line) {
      flushTable();
      flushList();
      continue;
    }

    // Markdown horizontal rule
    if (line === "---" || line === "***" || line === "___") {
      flushTable();
      flushList();
      html += `<div class="section-divider"></div>`;
      continue;
    }

    // Table Row Detection
    if (line.startsWith("|") && line.endsWith("|")) {
      flushList();
      // Check if this is the separator row: |---|---|
      if (/^\|(\s*[-:]+[-|\s:]*)\|$/.test(line)) {
        continue;
      }

      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());

      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
        tableRows = [];
      } else {
        tableRows.push(cells);
      }
      continue;
    } else {
      flushTable();
    }

    // Main Header (# or ##)
    if (line.startsWith("# ") || line.startsWith("## ")) {
      flushList();
      let title = line.replace(/^#+\s*/, "").replace(/[📋📊💡⚠️🩺💊👤]/g, "").trim();
      if (title.toLowerCase().includes("health & medication summary report")) {
        continue;
      }
      html += `
        <div class="section-header">
          <div class="section-icon-badge">❖</div>
          <h2 class="section-title">${parseInlineMarkdown(title)}</h2>
        </div>
      `;
      continue;
    }

    // Sub Header (###)
    if (line.startsWith("### ")) {
      flushList();
      const title = line.replace(/^###\s*/, "").replace(/[📋📊💡⚠️🩺💊👤]/g, "").trim();
      html += `
        <div class="sub-section-header">
          <h3 class="sub-section-title">${parseInlineMarkdown(title)}</h3>
        </div>
      `;
      continue;
    }

    // Alert Callouts / Quotes (> Note on..., > Recommendation..., > Disclaimer...)
    if (line.startsWith(">")) {
      flushList();
      const content = line.replace(/^>\s*/, "").trim();
      const isDisclaimer = content.toLowerCase().includes("disclaimer");
      const isWarning = content.toLowerCase().includes("alert") || content.toLowerCase().includes("inactive") || content.toLowerCase().includes("warning");
      const isRecommendation = content.toLowerCase().includes("recommendation");

      const cardClass = isDisclaimer
        ? "callout-disclaimer"
        : isWarning
        ? "callout-warning"
        : isRecommendation
        ? "callout-recommendation"
        : "callout-info";

      const icon = isDisclaimer ? "ℹ️" : isWarning ? "⚠️" : isRecommendation ? "💡" : "📌";

      html += `
        <div class="callout-card ${cardClass}">
          <span class="callout-icon">${icon}</span>
          <div class="callout-content">${parseInlineMarkdown(content)}</div>
        </div>
      `;
      continue;
    }

    // Numbered lists (1. , 2. )
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      if (!inList || listType !== "ol") {
        flushList();
        inList = true;
        listType = "ol";
        html += `<ol class="clinical-ordered-list">`;
      }
      html += `
        <li class="ordered-list-item">
          <span class="step-num">${numberedMatch[1]}</span>
          <div class="step-text">${parseInlineMarkdown(numberedMatch[2])}</div>
        </li>
      `;
      continue;
    }

    // Bullet points (- or * or •)
    if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      const content = line.replace(/^[-*•]\s*/, "").trim();
      if (!inList || listType !== "ul") {
        flushList();
        inList = true;
        listType = "ul";
        html += `<ul class="clinical-bullet-list">`;
      }
      html += `
        <li class="bullet-list-item">
          <span class="bullet-dot"></span>
          <div class="bullet-text">${parseInlineMarkdown(content)}</div>
        </li>
      `;
      continue;
    }

    // Standard Paragraph
    flushList();
    html += `<p class="clinical-paragraph">${parseInlineMarkdown(line)}</p>`;
  }

  flushTable();
  flushList();

  html += `
      </div>
      <!-- Report Footer -->
      <div class="report-footer">
        <div class="footer-left">
          <span>MediTrackr Personal Health Operating System • Confidential Medical Summary</span>
        </div>
        <div class="footer-right">
          <span>Validated Document</span>
        </div>
      </div>
    </div>
  `;

  return html;
}

/**
 * Returns clean, beautiful, print-ready CSS for the PDF document.
 */
function getReportStyles() {
  return `
    .meditrackr-report-root {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a !important;
      background: #ffffff !important;
      padding: 28px 32px;
      box-sizing: border-box;
      width: 794px;
      line-height: 1.5;
      font-size: 11.5px;
    }

    /* Top Executive Header */
    .report-header {
      background: #0b1326 !important;
      border-radius: 10px;
      padding: 20px 24px;
      color: #ffffff !important;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 22px;
      border: 1px solid #1e293b;
    }

    .header-left {
      display: flex;
      flex-direction: column;
    }

    .brand-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .brand-badge {
      background: #10b981 !important;
      color: #042f2e !important;
      font-weight: 800;
      font-size: 13px;
      padding: 3px 10px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }

    .report-type-tag {
      color: #94a3b8 !important;
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .report-main-title {
      font-size: 17px;
      font-weight: 700;
      color: #ffffff !important;
      margin: 0 0 4px 0;
      letter-spacing: -0.2px;
    }

    .report-subtitle {
      font-size: 10.5px;
      color: #cbd5e1 !important;
      margin: 0;
    }

    .meta-box {
      background: rgba(255, 255, 255, 0.1) !important;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      min-width: 200px;
    }

    .meta-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
    }

    .meta-label {
      color: #94a3b8 !important;
      font-weight: 500;
    }

    .meta-val {
      color: #ffffff !important;
      font-weight: 700;
    }

    .confidential-pill {
      background: #ef4444 !important;
      color: #ffffff !important;
      font-size: 8.5px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    /* Section Headings */
    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 24px;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #e2e8f0;
    }

    .section-icon-badge {
      background: #ecfdf5 !important;
      color: #059669 !important;
      font-size: 12px;
      font-weight: 800;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      border: 1px solid #a7f3d0;
    }

    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a !important;
      margin: 0;
      letter-spacing: -0.2px;
    }

    .sub-section-header {
      margin-top: 14px;
      margin-bottom: 8px;
    }

    .sub-section-title {
      font-size: 12px;
      font-weight: 700;
      color: #1e293b !important;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Clinical Tables */
    .table-container {
      margin: 12px 0 16px 0;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
    }

    .clinical-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 10.5px;
    }

    .clinical-table th {
      background: #0f172a !important;
      color: #ffffff !important;
      font-weight: 700;
      padding: 9px 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 9.5px;
      border-bottom: 1px solid #1e293b;
    }

    .clinical-table td {
      padding: 8px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b !important;
    }

    .clinical-table tr.row-even {
      background: #ffffff !important;
    }

    .clinical-table tr.row-odd {
      background: #f8fafc !important;
    }

    .clinical-table tr:last-child td {
      border-bottom: none;
    }

    /* Status Badges / Pills */
    .pill {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 12px;
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }

    .pill-success {
      background: #dcfce7 !important;
      color: #15803d !important;
      border: 1px solid #bbf7d0;
    }

    .pill-warning {
      background: #fef3c7 !important;
      color: #b45309 !important;
      border: 1px solid #fde68a;
    }

    .pill-danger {
      background: #fee2e2 !important;
      color: #b91c1c !important;
      border: 1px solid #fecaca;
    }

    .pill-info {
      background: #e0f2fe !important;
      color: #0369a1 !important;
      border: 1px solid #bae6fd;
    }

    /* Callout & Alert Cards */
    .callout-card {
      display: flex;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 8px;
      margin: 10px 0;
      font-size: 10.5px;
      align-items: flex-start;
    }

    .callout-icon {
      font-size: 13px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .callout-content {
      color: #1e293b !important;
      line-height: 1.45;
    }

    .callout-warning {
      background: #fffbeb !important;
      border-left: 4px solid #f59e0b;
      border-top: 1px solid #fef3c7;
      border-right: 1px solid #fef3c7;
      border-bottom: 1px solid #fef3c7;
    }

    .callout-warning .callout-content {
      color: #92400e !important;
    }

    .callout-recommendation {
      background: #f0fdf4 !important;
      border-left: 4px solid #10b981;
      border-top: 1px solid #dcfce7;
      border-right: 1px solid #dcfce7;
      border-bottom: 1px solid #dcfce7;
    }

    .callout-recommendation .callout-content {
      color: #166534 !important;
    }

    .callout-info {
      background: #f0f9ff !important;
      border-left: 4px solid #0284c7;
      border-top: 1px solid #e0f2fe;
      border-right: 1px solid #e0f2fe;
      border-bottom: 1px solid #e0f2fe;
    }

    .callout-disclaimer {
      background: #fef2f2 !important;
      border: 1px solid #fee2e2;
      border-left: 4px solid #ef4444;
      margin-top: 20px;
    }

    .callout-disclaimer .callout-content {
      color: #991b1b !important;
      font-size: 9.5px;
      font-style: italic;
    }

    /* Lists */
    .clinical-bullet-list {
      list-style: none;
      padding: 0;
      margin: 8px 0;
    }

    .bullet-list-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 6px;
      font-size: 11px;
      color: #1e293b !important;
    }

    .bullet-dot {
      width: 5px;
      height: 5px;
      background: #10b981 !important;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 6px;
    }

    .bullet-text {
      flex: 1;
      color: #1e293b !important;
    }

    .clinical-ordered-list {
      list-style: none;
      padding: 0;
      margin: 8px 0;
    }

    .ordered-list-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 9px 12px;
      background: #f8fafc !important;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      margin-bottom: 6px;
      font-size: 11px;
    }

    .step-num {
      background: #0f172a !important;
      color: #ffffff !important;
      font-weight: 700;
      font-size: 9.5px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .step-text {
      flex: 1;
      color: #0f172a !important;
    }

    .clinical-paragraph {
      font-size: 11px;
      color: #334155 !important;
      margin: 6px 0;
    }

    .section-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 16px 0;
    }

    /* Report Footer */
    .report-footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      color: #64748b !important;
      font-size: 9px;
    }
  `;
}

/**
 * Generates and downloads a clean, clinical-grade, beautifully styled PDF health report.
 * 
 * @param {string} reportText - The markdown / text report content.
 * @param {string} [userName] - Patient name.
 */
export const downloadReportAsPDF = async (reportText, userName = "Patient") => {
  if (!reportText) return;

  const reportDate = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // 1. Build semantic HTML string
  const htmlContent = markdownToReportHtml(reportText, userName, reportDate);
  const styles = getReportStyles();

  // 2. Create sandbox container in DOM
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.top = "0px";
  container.style.left = "0px";
  container.style.width = "794px";
  container.style.background = "#ffffff";
  container.style.color = "#0f172a";
  container.style.zIndex = "-99999";
  container.style.opacity = "1";
  container.style.pointerEvents = "none";

  const styleEl = document.createElement("style");
  styleEl.innerHTML = styles;

  container.appendChild(styleEl);
  const wrapper = document.createElement("div");
  wrapper.innerHTML = htmlContent;
  container.appendChild(wrapper);

  document.body.appendChild(container);

  try {
    // 3. Render container to canvas at 2x scale for crystal clear output
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pdfWidth = 595.28;
    const pdfHeight = 841.89;
    const totalImgHeight = (canvas.height * pdfWidth) / canvas.width;

    const filename = `MediTrackr_Health_Report_${new Date().toISOString().slice(0, 10)}.pdf`;

    // 4. Multi-page slicing onto A4 pages
    if (totalImgHeight <= pdfHeight) {
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, totalImgHeight);
    } else {
      const pageCanvasHeight = (canvas.width * pdfHeight) / pdfWidth;
      let renderedHeight = 0;
      let pageIndex = 0;

      while (renderedHeight < canvas.height) {
        if (pageIndex > 0) {
          pdf.addPage();
        }

        const currentSliceHeight = Math.min(pageCanvasHeight, canvas.height - renderedHeight);

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = pageCanvasHeight;
        const ctx = sliceCanvas.getContext("2d");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

        ctx.drawImage(
          canvas,
          0,
          renderedHeight,
          canvas.width,
          currentSliceHeight,
          0,
          0,
          canvas.width,
          currentSliceHeight
        );

        const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.98);
        pdf.addImage(sliceData, "JPEG", 0, 0, pdfWidth, pdfHeight);

        renderedHeight += pageCanvasHeight;
        pageIndex++;
      }
    }

    // 5. Add clean footer page numbers
    const totalPages = pdf.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      pdf.setPage(p);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(140, 150, 165);
      pdf.text(
        `Page ${p} of ${totalPages} • MediTrackr Personal Health OS`,
        pdfWidth / 2,
        pdfHeight - 14,
        { align: "center" }
      );
    }

    pdf.save(filename);
  } catch (err) {
    console.error("PDF generation failed:", err);
    throw err;
  } finally {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
};
