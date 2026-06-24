# Publicar o site + deixar atualizando sozinho

Objetivo: colocar o site no ar (de graça) e fazer o gerador rodar sozinho a cada
~10 min, atualizando placares/horários/confrontos sem você mexer.

Peças:
- **GitHub** = guarda os arquivos do site + roda o robô (GitHub Actions) que atualiza os dados.
- **Cloudflare Pages** = hospeda o site (de graça) e republica sozinho a cada mudança.

> Tudo aqui é plano grátis. O repositório pode ser **público** (os dados são públicos;
> sua CHAVE da API nunca vai pro código — fica guardada como "segredo").

---

## 1) Subir a pasta do site pro GitHub (uma vez)

Jeito mais fácil (sem terminal): **GitHub Desktop**.

1. Crie uma conta em https://github.com (se não tiver).
2. Baixe e instale o **GitHub Desktop**: https://desktop.github.com
3. No GitHub Desktop: **File → Add local repository** e escolha ESTA pasta
   (`...\clientes\lipy\site-nao-abro-mao`).
   - Se ele diser que não é um repositório, clique em **"create a repository"** (ele inicializa).
4. Clique em **Publish repository**.
   - Nome sugerido: `nao-abro-mao`
   - **DESMARQUE** "Keep this code private" (deixe **público** — Actions de graça ilimitado).
   - **Publish**.

Pronto: seus arquivos estão no GitHub.

---

## 2) Guardar a CHAVE da API como segredo

1. No site do GitHub, abra seu repositório.
2. **Settings → Secrets and variables → Actions → New repository secret**.
3. Name: `FOOTBALL_DATA_KEY`
   Secret: (cole a sua chave da football-data.org)
4. **Add secret**.

> É isso que deixa o robô puxar os dados. A chave fica escondida, nunca aparece no site.

---

## 3) Ligar o robô (já vem pronto)

O robô já está configurado no arquivo `.github/workflows/atualizar-bracket.yml`.
Pra testar agora:

1. No repositório, aba **Actions**.
2. Se pedir, clique em **"I understand my workflows, enable them"**.
3. Abra **"Atualizar dados (NAO ABRO MAO)" → Run workflow**.
4. Em ~1 min ele roda, atualiza `bracket-live.js`/`teams.js` e commita sozinho.

Depois disso ele roda a cada ~10 min automaticamente (o GitHub pode atrasar alguns
minutos — pra placar ao vivo é "quase tempo real", não segundo a segundo).

---

## 4) Hospedar no Cloudflare Pages

1. Crie conta grátis em https://dash.cloudflare.com
2. **Workers & Pages → Create → Pages → Connect to Git**.
3. Autorize o GitHub e escolha o repositório `nao-abro-mao`.
4. Configurações de build:
   - Framework preset: **None**
   - Build command: **(deixe vazio)**
   - Build output directory: **/** (raiz)
5. **Save and Deploy**.

Em ~1 min o site fica no ar num endereço tipo `https://nao-abro-mao.pages.dev`.
A cada commit do robô, o Cloudflare republica sozinho.

> Domínio próprio (ex.: `naoabromao.com.br`) dá pra ligar depois em Pages → Custom domains.

---

## Como fica o ciclo (automático)

```
robô (GitHub Actions, a cada 10 min)
   -> roda gerar_bracket.js (football-data.org)
   -> escreve bracket-live.js / teams.js
   -> commita no GitHub
        -> Cloudflare Pages republica
             -> site no ar atualizado (placar, horário, confrontos)
```

## Manutenção / custos
- Tudo no plano grátis (GitHub público = Actions ilimitado; Cloudflare Pages grátis).
- Pra economizar fora de época, dá pra mudar o `cron` no arquivo do workflow
  (ou desligar em Actions) e religar quando tiver jogo.
- Logo da Lipy: salve `assets/logo-lipy.png` (transparente) e suba junto.
