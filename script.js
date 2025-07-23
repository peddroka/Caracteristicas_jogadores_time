document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".jogadores-container");
  const cards = Array.from(container.querySelectorAll(".jogador-card"));
  const overlay = document.querySelector(".jogador-info-overlay");
  const conteudo = document.querySelector(".info-conteudo");
  const btnFechar = document.querySelector(".btn-fechar");

  // Função que calcula overall
  function calculaOverall(atributos) {
    const soma = atributos.reduce((acc, atual) => acc + atual.valor, 0);
    return Math.round(soma / atributos.length);
  }

  // Define classe geral para cor/borda baseado no overall
  function getOverallClass(overall) {
    if (overall >= 85) return "overall-90";
    if (overall >= 80) return "overall-80";
    if (overall >= 70) return "overall-70";
    if (overall >= 60) return "overall-60";
    return "overall-50";
  }

  // Ordena os cards pelo overall
  cards.sort((a, b) => {
    const overallA = calculaOverall(JSON.parse(a.dataset.atributos));
    const overallB = calculaOverall(JSON.parse(b.dataset.atributos));
    return overallB - overallA;
  });

  // Reinsere os cards ordenados
  cards.forEach((card) => container.appendChild(card));

  // Variáveis de comparação
  let comparacaoOverlay = null;
  let comparacaoCardsContainer = null;
  let jogadorSelecionadoParaComparar = null;
  let jogadoresParaComparar = [];

  // Cria overlay de comparação
  function criarComparacaoOverlay() {
    comparacaoOverlay = document.createElement("div");
    comparacaoOverlay.classList.add("comparacao-overlay");

    comparacaoCardsContainer = document.createElement("div");
    comparacaoCardsContainer.classList.add("comparacao-cards-container");
    comparacaoOverlay.appendChild(comparacaoCardsContainer);

    document.body.appendChild(comparacaoOverlay);

    comparacaoOverlay.addEventListener("click", (e) => {
      if (e.target === comparacaoOverlay) {
        jogadoresParaComparar = [];
        jogadorSelecionadoParaComparar = null;
        comparacaoOverlay.classList.remove("ativo");
        cards.forEach((c) => {
          const btn = c.querySelector(".btn-comparar");
          if (btn) btn.classList.remove("selecionado", "btn-comparar-inativo");
        });
      }
    });
  }

  // Cria barra de comparação com destaque
  function criarBarra(atributo, destaque = false) {
    return `
      <div class="comparacao-atributo">
        <label>${atributo.label}</label>
        <div class="comparacao-barra">
          <div class="comparacao-barra-preenchimento ${
            destaque ? "destaque" : ""
          }" style="width: ${atributo.valor}%"></div>
        </div>
      </div>
    `;
  }

  // Mostra os detalhes do jogador
  function mostrarDetalhesJogador(card) {
    const apelido = card.dataset.apelido;
    const funcao = card.dataset.funcao;
    const idade = card.dataset.idade;
    const altura = card.dataset.altura;
    const img = card.dataset.img;
    const atributos = JSON.parse(card.dataset.atributos);
    const overall = calculaOverall(atributos);

    let atributosHTML = "";
    atributos.forEach((attr) => {
      atributosHTML += `
        <div class="atributo">
          <label>${attr.label}</label>
          <div class="barra">
            <div class="barra-preenchimento" style="width: 0%"></div>
          </div>
        </div>
      `;
    });

    conteudo.innerHTML = `
      <button class="btn-fechar" title="Fechar">&times;</button>
      <img src="${img}" alt="${apelido}" />
      <div class="overall-label">${overall}</div>
      <h2>${apelido}</h2>
      <p><strong>Função:</strong> ${funcao}</p>
      <p><strong>Idade:</strong> ${idade} anos</p>
      <p><strong>Altura:</strong> ${altura}</p>
      <div class="atributos">${atributosHTML}</div>
    `;

    overlay.classList.add("ativo");

    setTimeout(() => {
      const barras = conteudo.querySelectorAll(".barra-preenchimento");
      barras.forEach((barra, i) => {
        barra.style.width = `${atributos[i].valor}%`;
      });
    }, 50);

    const btnFecharInfo = conteudo.querySelector(".btn-fechar");
    btnFecharInfo.addEventListener("click", () => {
      overlay.classList.remove("ativo");
    });
  }

  // Mostra comparação de dois jogadores
  function mostrarComparacao() {
    if (!comparacaoOverlay) criarComparacaoOverlay();

    comparacaoCardsContainer.innerHTML = "";

    const atributos1 = jogadoresParaComparar[0].atributos;
    const atributos2 = jogadoresParaComparar[1].atributos;

    const html1 = gerarCardComparacao(
      jogadoresParaComparar[0],
      atributos1,
      atributos2
    );
    const html2 = gerarCardComparacao(
      jogadoresParaComparar[1],
      atributos2,
      atributos1
    );

    comparacaoCardsContainer.innerHTML = `
      <div class="comparacao-card">${html1}</div>
      <div class="comparacao-card">${html2}</div>
    `;

    comparacaoOverlay.classList.add("ativo");
  }

  // Gera card de comparação
  function gerarCardComparacao(jogador, seusAtributos, atributosDoOutro) {
    const overall = calculaOverall(seusAtributos);
    let html = `
      <h2>${jogador.apelido}</h2>
      <div class="overall-label">${overall}</div>
      <img src="${jogador.img}" alt="${jogador.apelido}" />
      <div class="comparacao-atributos">
    `;

    seusAtributos.forEach((attr, i) => {
      const outroValor = atributosDoOutro[i].valor;
      const destaque = attr.valor > outroValor;
      html += criarBarra(attr, destaque);
    });

    html += `</div>`;
    return html;
  }

  // Lógica de clique para comparar
  function onClickComparar(card) {
    if (!jogadorSelecionadoParaComparar) {
      jogadorSelecionadoParaComparar = card;
      jogadoresParaComparar = [
        {
          apelido: card.dataset.apelido,
          img: card.dataset.img,
          atributos: JSON.parse(card.dataset.atributos),
        },
      ];
      card.querySelector(".btn-comparar").classList.add("selecionado");

      cards.forEach((c) => {
        if (c !== card) {
          const btn = c.querySelector(".btn-comparar");
          if (btn) btn.classList.add("btn-comparar-inativo");
        }
      });
    } else if (card === jogadorSelecionadoParaComparar) {
      card.querySelector(".btn-comparar").classList.remove("selecionado");
      jogadorSelecionadoParaComparar = null;
      jogadoresParaComparar = [];

      cards.forEach((c) => {
        const btn = c.querySelector(".btn-comparar");
        if (btn) btn.classList.remove("btn-comparar-inativo");
      });
    } else if (jogadoresParaComparar.length === 1) {
      jogadoresParaComparar.push({
        apelido: card.dataset.apelido,
        img: card.dataset.img,
        atributos: JSON.parse(card.dataset.atributos),
      });
      card.querySelector(".btn-comparar").classList.add("selecionado");
      mostrarComparacao();
    }
  }

  // Adiciona botões e classes nos cards
  cards.forEach((card) => {
    const btnComparar = document.createElement("button");
    btnComparar.textContent = "Comparar";
    btnComparar.classList.add("btn-comparar");
    card.appendChild(btnComparar);

    btnComparar.addEventListener("click", (e) => {
      e.stopPropagation();
      onClickComparar(card);
    });

    card.addEventListener("click", () => {
      mostrarDetalhesJogador(card);
    });

    const atributos = JSON.parse(card.dataset.atributos);
    const overall = calculaOverall(atributos);
    card.classList.add(getOverallClass(overall));

    const overallLabel = document.createElement("div");
    overallLabel.classList.add("overall-label");
    overallLabel.textContent = overall;
    card.style.position = "relative";
    card.appendChild(overallLabel);
  });

  // Fecha overlay
  btnFechar.addEventListener("click", () => {
    overlay.classList.remove("ativo");
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("ativo");
    }
  });
});
