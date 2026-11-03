let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
let meuGrafico = null;

const form = document.getElementById('form-transacao');
const listaTransacoes = document.getElementById('lista-transacoes');
const totalEntradasEl = document.getElementById('total-entradas');
const totalSaidasEl = document.getElementById('total-saidas');
const saldoTotalEl = document.getElementById('saldo-total');

function salvarLocalStorage() {
  localStorage.setItem('transacoes', JSON.stringify(transacoes));
}

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function atualizarResumo() {
  const entradas = transacoes
    .filter(t => t.tipo === 'entrada')
    .reduce((acc, t) => acc + t.valor, 0);

  const saidas = transacoes
    .filter(t => t.tipo === 'saida')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldo = entradas - saidas;

  totalEntradasEl.textContent = formatarMoeda(entradas);
  totalSaidasEl.textContent = formatarMoeda(saidas);
  saldoTotalEl.textContent = formatarMoeda(saldo);
}

function renderizarLista() {
  listaTransacoes.innerHTML = '';

  transacoes.forEach((transacao, index) => {
    const li = document.createElement('li');
    li.classList.add(transacao.tipo);

    const categoriaFormatada = transacao.categoria.charAt(0).toUpperCase() + transacao.categoria.slice(1);

    li.innerHTML = `
      <span><strong>${transacao.descricao}</strong> (${categoriaFormatada})</span>
      <span>
        ${transacao.tipo === 'saida' ? '-' : '+'} ${formatarMoeda(transacao.valor)}
        <button class="btn-deletar" onclick="removerTransacao(${index})">X</button>
      </span>
    `;

    listaTransacoes.appendChild(li);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const descricao = document.getElementById('descricao').value.trim();
  const valor = parseFloat(document.getElementById('valor').value);
  const tipo = document.getElementById('tipo').value;
  const categoria = document.getElementById('categoria').value;

  if (!descricao || isNaN(valor) || valor <= 0) {
    alert("Por favor, preencha a descrição e insira um valor válido maior que zero.");
    return;
  }

  const novaTransacao = { descricao, valor, tipo, categoria };

  transacoes.push(novaTransacao);
  salvarLocalStorage();
  atualizarInterface();

  form.reset();
});

function removerTransacao(index) {
  transacoes.splice(index, 1);
  salvarLocalStorage();
  atualizarInterface();
}

function atualizarGrafico() {
  const ctx = document.getElementById('grafico-categorias').getContext('2d');
  const gastosPorCategoria = {};
  
  transacoes
    .filter(t => t.tipo === 'saida')
    .forEach(t => {
      const cat = t.categoria.charAt(0).toUpperCase() + t.categoria.slice(1);
      gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + t.valor;
    });

  const categorias = Object.keys(gastosPorCategoria);
  const valores = Object.values(gastosPorCategoria);

  if (meuGrafico) {
    meuGrafico.destroy();
  }

  meuGrafico = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categorias,
      datasets: [{
        data: valores,
        backgroundColor: ['#e74c3c', '#3498db', '#f1c40f', '#9b59b6', '#1abc9c'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function atualizarInterface() {
  renderizarLista();
  atualizarResumo();
  atualizarGrafico();
}

atualizarInterface();