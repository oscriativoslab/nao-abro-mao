# NÃO ABRO MÃO — site da campanha (Lipy)

Microsite da campanha **NÃO ABRO MÃO** pra reta final do torneio de seleções de 2026.
Cliente: **Lipy** (@salgadinhoslipy). Mobile-first, estilo game.

## Como ver

Abra o arquivo `index.html` com **dois cliques** (abre no navegador). Não precisa instalar nada.
No celular: melhor experiência. No PC: aparece centralizado numa coluna estilo celular.

> Precisa de internet pra carregar as bandeiras (flagcdn.com) e as fontes.

## O que já funciona (entrega 1 — Home)

- **Brasil pré-selecionado** ao abrir (lembra a última torcida escolhida na próxima visita).
- **Setas ‹ ›** trocam a seleção. No celular dá pra **arrastar pro lado** (swipe). No PC, setas do teclado.
- **Buscar / trocar torcida:** lupa no topo ou "trocar torcida" abrem a lista completa com busca.
- **Entrar em campo** leva pra tela da jornada (por enquanto um esboço do que vem).
- Mascote placeholder com balão de fala que muda conforme a torcida.

## Estrutura

```
site-nao-abro-mao/
├── index.html     → telas (home + jornada-stub + overlay de busca)
├── styles.css     → visual (cores e fontes no topo, fáceis de trocar)
├── teams.js       → lista de seleções (placeholder de status/forma)
├── app.js         → lógica (seletor, busca, navegação)
└── README.md
```

## Pendências / próximas etapas

- **Fontes reais:** trocar Baloo 2/Poppins pelas fontes da marca (Hello / Visby). Lugar único: `--font-title` e `--font-body` no topo do `styles.css` + adicionar os `@font-face`. Faltam os arquivos das fontes.
- **Logo real:** hoje o "Lipy" do topo é texto estilizado. Trocar pela imagem da logo (PNG transparente) quando chegar.
- **Mascote real:** o SVG cinza é placeholder. Entra o rig do jacaré da Lipy (animado, acompanha o scroll).
- **Dados reais (`bracket.json`):** status, forma, próximos jogos, resultados, caminhos e o mapa de fases. Hoje é placeholder.
- **Telas seguintes:** Mapa da Jornada, Próximo jogo, Resultados, Caminhos possíveis, Agenda, Onde assistir.
- **Cards de compartilhamento** com @salgadinhoslipy em evidência.
