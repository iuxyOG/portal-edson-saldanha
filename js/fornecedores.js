
const estadosECidades = {
  "MG":["Belo Horizonte","Uberlândia","Contagem","Nova Serrana"],
  "SP":["São Paulo","Campinas","Santos","Sorocaba"],
  "RJ":["Rio de Janeiro","Niterói","Duque de Caxias"]
};

const fEstado = document.getElementById("fEstado");
const fCidade = document.getElementById("fCidade");
const fProduto = document.getElementById("fProduto");
const fCategoria = document.getElementById("fCategoria");
const btnBuscar = document.getElementById("btnBuscar");
const btnLimpar = document.getElementById("btnLimpar");

Object.keys(estadosECidades).forEach(uf => {
  const opt = document.createElement("option");
  opt.value = uf;
  opt.textContent = uf;
  fEstado.appendChild(opt);
});

fEstado.addEventListener("change", () => {
  fCidade.innerHTML = "<option value=''>Cidade</option>";
  (estadosECidades[fEstado.value] || []).forEach(c => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    fCidade.appendChild(o);
  });
});

let fornecedores = [
  {id:1,nome:"Furadeira 500W",cidade:"São Paulo",estado:"SP",descricao:"Furadeira elétrica profissional",fornecedor:"Loja A",categoria:"Ferramentas",preco:"R$ 199,90",img:"https://via.placeholder.com/300?text=Furadeira",telefone:"5511999999999"},
  {id:2,nome:"Martelo Pro",cidade:"Rio de Janeiro",estado:"RJ",descricao:"Martelo de aço temperado",fornecedor:"Loja B",categoria:"Ferramentas",preco:"R$ 49,90",img:"https://via.placeholder.com/300?text=Martelo",telefone:"5521998888888"},
  {id:3,nome:"Tênis Esportivo",cidade:"Nova Serrana",estado:"MG",descricao:"Tênis leve com sola EVA",fornecedor:"Calçados NS",categoria:"Calçados",preco:"R$ 129,90",img:"https://via.placeholder.com/300?text=T%C3%AAnis",telefone:"5531997777777"},
  {id:4,nome:"Placa de Vídeo RTX 3060",cidade:"Sorocaba",estado:"SP",descricao:"NVIDIA RTX 3060 12GB",fornecedor:"TechStore SP",categoria:"PC",preco:"R$ 2.499,90",img:"https://via.placeholder.com/300?text=RTX3060",telefone:"5519988887777"},
  {id:5,nome:"Sandália Feminina",cidade:"São Paulo",estado:"SP",descricao:"Sandália trançada artesanal",fornecedor:"ModaPé SP",categoria:"Calçados",preco:"R$ 89,90",img:"https://via.placeholder.com/300?text=Sand%C3%A1lia",telefone:"5511977776666"}
];

function render(items) {
  const lista = document.getElementById("lista");
  lista.innerHTML = items.map(i => `
    <div class='card'>
      <span class="favorite" data-id="${i.id}">&#9734;</span>
      <img src="${i.img}" alt="${i.nome}">
      <h3>${i.nome}</h3>
      <p>${i.descricao}</p>
      <p>${i.cidade} - ${i.estado}</p>
      <p><b>${i.fornecedor}</b></p>
      <p><b>${i.preco}</b></p>
      <button onclick="verDetalhes(${i.id})">Ver detalhes</button>
    </div>
  `).join("");

  document.querySelectorAll(".favorite").forEach(fav => {
    fav.onclick = () => {
      fav.classList.toggle("active");
      fav.innerHTML = fav.classList.contains("active") ? "&#9733;" : "&#9734;";
    };
  });
}

function filtrar() {
  const p = fProduto.value.toLowerCase();
  const c = fCidade.value;
  const e = fEstado.value;
  const cat = fCategoria.value;

  render(fornecedores.filter(f =>
    f.nome.toLowerCase().includes(p) &&
    (c === "" || f.cidade === c) &&
    (e === "" || f.estado === e) &&
    (cat === "" || f.categoria === cat)
  ));
}

btnBuscar.onclick = filtrar;
btnLimpar.onclick = () => {
  fProduto.value = "";
  fCategoria.value = "";
  fEstado.value = "";
  fCidade.innerHTML = "<option value=''>Cidade</option>";
  render(fornecedores);
};

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const btnLigar = document.getElementById("btnLigar");
let fornecedorAtual = null;

window.verDetalhes = function(id) {
  fornecedorAtual = fornecedores.find(x => x.id === id);
  if (!fornecedorAtual) return;

  document.getElementById("modalImg").src = fornecedorAtual.img;
  document.getElementById("modalNome").textContent = fornecedorAtual.nome;
  document.getElementById("modalDesc").textContent = fornecedorAtual.descricao;
  document.getElementById("modalFornecedor").textContent = fornecedorAtual.fornecedor;
  document.getElementById("modalCidadeEstado").textContent = `${fornecedorAtual.cidade} - ${fornecedorAtual.estado}`;
  document.getElementById("modalPreco").textContent = fornecedorAtual.preco;
  document.getElementById("modalCategoria").textContent = fornecedorAtual.categoria;
  modal.style.display = "flex";
};

btnLigar.onclick = () => {
  if (fornecedorAtual && fornecedorAtual.telefone) {
    window.open(`https://wa.me/${fornecedorAtual.telefone}`, "_blank");
  }
};

closeModal.onclick = () => {
  modal.style.display = "none";
};

window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

render(fornecedores);
