
function formatBRL(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("fileInput");
  input.addEventListener("change", handleFile);
});

function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    const data = new Uint8Array(evt.target.result);
    const wb = XLSX.read(data, { type: "array" });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(ws, { defval: null });

    processData(json);
  };
  reader.readAsArrayBuffer(file);
}

function processData(rows) {
  if (!rows || !rows.length) return;

  // detect columns
  const firstRow = rows[0];

  let colNome = findCol(firstRow, ["product name","nome do produto","item_name","product"]);
  let colSku  = findCol(firstRow, ["parent sku","parentsku","sku"]);
  let colQtd  = findCol(firstRow, ["sales volume","quantity","sold qty","qtd"]);
  let colFat  = findCol(firstRow, ["gmv","total amount","faturamento","amount"]);

  const map = new Map();

  rows.forEach((r) => {
    const nome = (r[colNome] || r[colSku] || "Produto sem nome").toString();
    const qtd = Number(r[colQtd] || 0);
    const fat = Number(r[colFat] || 0);

    if (!map.has(nome)) {
      map.set(nome, { nome, qtd: 0, fat: 0 });
    }
    const item = map.get(nome);
    item.qtd += qtd;
    item.fat += fat;
  });

  const lista = Array.from(map.values()).sort((a, b) => b.fat - a.fat);

  const fatTotal = lista.reduce((s, i) => s + i.fat, 0);
  const qtdTotal = lista.reduce((s, i) => s + i.qtd, 0);
  const ticket = qtdTotal > 0 ? fatTotal / qtdTotal : 0;

  document.getElementById("resumoGeral").hidden = false;
  document.getElementById("fatTotal").textContent = formatBRL(fatTotal);
  document.getElementById("qtdTotal").textContent = qtdTotal.toString();
  document.getElementById("ticketMedio").textContent = formatBRL(ticket);

  // tabela
  const tbody = document.querySelector("#tabelaProdutos tbody");
  tbody.innerHTML = "";
  lista.slice(0, 50).forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nome}</td>
      <td>${p.qtd}</td>
      <td>${formatBRL(p.fat)}</td>
    `;
    tbody.appendChild(tr);
  });

  // gráfico
  const ctx = document.getElementById("graficoFat").getContext("2d");
  const top = lista.slice(0, 10);
  const labels = top.map((p) => p.nome.substring(0, 22));
  const values = top.map((p) => p.fat);

  if (window._fatChart) {
    window._fatChart.destroy();
  }

  window._fatChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Faturamento",
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: "#e5e7eb" },
          grid: { display: false }
        },
        y: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(55,65,81,0.6)" }
        }
      }
    }
  });
}

function findCol(row, names) {
  const keys = Object.keys(row);
  for (const key of keys) {
    const norm = key.toString().toLowerCase().trim();
    if (names.some((n) => norm.includes(n))) return key;
  }
  // fallback: first numeric col for qtd or fat etc
  return keys[0];
}
