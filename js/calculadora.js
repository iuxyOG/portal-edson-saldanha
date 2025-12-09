let currentMode = "normal";

function getTaxaShopee() {
  return currentMode === "normal" ? 0.14 : 0.20;
}

function formatarBRL(valor) {
  if (isNaN(valor) || !isFinite(valor)) {
    return "R$ 0,00";
  }
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

/**
 * Calcula o preço de venda necessário para atingir uma margem de lucro desejada.
 * Fórmula base:
 *   P - (custo + extras + taxaShopee*P + imposto*P + taxaFixa) = margem * P
 *   => P * (1 - taxaShopee - imposto - margem) = custo+extras+taxaFixa
 *   => P = (custo+extras+taxaFixa) / (1 - taxaShopee - imposto - margem)
 */
function calcularPrecoPorMargem({ custo, extras, impostoPercent, margemPercent, taxaPercent }) {
  const base = custo + extras;
  const imposto = (impostoPercent || 0) / 100;
  const margem = (margemPercent || 0) / 100;

  const denom = 1 - taxaPercent - imposto - margem;
  if (denom <= 0) {
    return NaN;
  }

  // preço considerando taxa fixa de R$4,00
  const precoComFixa = (base + 4) / denom;
  // preço sem taxa fixa
  const precoSemFixa = base / denom;

  // Se com taxa fixa o preço ainda for abaixo de 79, usamos esse
  if (precoComFixa < 79) {
    return precoComFixa;
  }

  // Acima de 79, a Shopee não cobra a taxa fixa, então usamos o sem taxa fixa
  return precoSemFixa;
}

function calcular() {
  const custoEl = document.getElementById("custo");
  const extrasEl = document.getElementById("extras");
  const impostoEl = document.getElementById("imposto");
  const margemEl = document.getElementById("margem");
  const margemLabel = document.getElementById("margemLabel");

  const custo = parseFloat((custoEl.value || "").replace(",", ".")) || 0;
  const extras = parseFloat((extrasEl.value || "").replace(",", ".")) || 0;
  const imposto = parseFloat((impostoEl.value || "").replace(",", ".")) || 0;
  const margemPercent = parseFloat(margemEl.value || "0") || 0;

  // Atualiza rótulo da margem
  if (margemLabel) {
    margemLabel.textContent = margemPercent.toFixed(0) + "%";
  }

  const taxaPercent = getTaxaShopee();

  // Calcula o preço de venda necessário para essa margem
  let preco = calcularPrecoPorMargem({
    custo,
    extras,
    impostoPercent: imposto,
    margemPercent,
    taxaPercent
  });

  if (!isFinite(preco) || preco <= 0) {
    preco = 0;
  }

  const taxaShopeeValor = preco * taxaPercent;
  const taxaFixaVal = preco > 0 && preco < 79 ? 4 : 0;
  const valorImposto = preco * (imposto / 100);
  const custosTotais = custo + extras + taxaShopeeValor + taxaFixaVal + valorImposto;
  const margemReais = preco - custosTotais;

  document.getElementById("rpreco").textContent = formatarBRL(preco);
  document.getElementById("rcusto").textContent = formatarBRL(custo);
  document.getElementById("rextras").textContent = formatarBRL(extras);
  document.getElementById("rimposto").textContent = (imposto || 0).toFixed(2) + "%";
  document.getElementById("taxaPercent").textContent = (taxaPercent * 100).toFixed(0) + "%";
  document.getElementById("taxaNormal").textContent = formatarBRL(taxaShopeeValor);
  document.getElementById("taxaFixa").textContent = formatarBRL(taxaFixaVal);
  document.getElementById("custosTotais").textContent = formatarBRL(custosTotais);
  document.getElementById("lucro").textContent = formatarBRL(margemReais);
}

document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll("#custo, #extras, #imposto, #margem");
  inputs.forEach((input) => {
    input.addEventListener("input", calcular);
  });

  const modeButtons = document.querySelectorAll(".mode-btn");
  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      modeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentMode = btn.dataset.mode;
      calcular();
    });
  });

  calcular();
});
