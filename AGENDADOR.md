# Agendador externo (pra não depender do cron do GitHub)

O robô que atualiza os dados (`/.github/workflows/atualizar-bracket.yml`) roda no
GitHub Actions. O problema: o **agendamento (cron) do GitHub é instável** e às vezes
não dispara por horas. A solução é um serviço externo gratuito que só **aperta o play**
do robô de tempos em tempos, chamando a API do GitHub.

**Segurança:** o serviço externo NÃO recebe a chave da API de futebol (ela continua
guardada só no GitHub, como secret). Ele guarda apenas um **token restrito**, que só
pode disparar workflows DESTE repositório e nada mais. Pode revogar quando quiser.

O cron do GitHub fica ligado também, como reserva (se os dois dispararem juntos, o
robô tem trava de concorrência e não roda em duplicidade).

---

## Passo 1 — Criar o token restrito no GitHub (uma vez)

1. github.com logado → canto superior direito (foto) → **Settings**.
2. Menu esquerdo, lá embaixo: **Developer settings**.
3. **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
4. Preencha:
   - **Token name:** `naoabromao cron`
   - **Expiration:** escolha uma data (ex.: fim do torneio + 1 mês). Quando vencer,
     é só gerar outro e atualizar no cron-job.org.
   - **Resource owner:** sua conta (oscriativoslab).
   - **Repository access:** marque **Only select repositories** → escolha
     **nao-abro-mao**.
   - **Permissions** → **Repository permissions** → procure **Actions** → mude para
     **Read and write**. (Só isso. O resto deixa como está.)
5. **Generate token** → **copie o token** (começa com `github_pat_...`). Ele só
   aparece uma vez; guarde num lugar seguro.

## Passo 2 — Criar a tarefa no cron-job.org (uma vez)

1. Acesse **https://cron-job.org** → **Sign up** (grátis) → confirme o e-mail.
2. **Create cronjob**.
3. **Common / Title:** `Atualizar NAO ABRO MAO`
4. **URL:**
   ```
   https://api.github.com/repos/oscriativoslab/nao-abro-mao/actions/workflows/atualizar-bracket.yml/dispatches
   ```
5. **Schedule:** "Every 2 minutes" (recomendado). O mínimo do plano grátis é 1 min,
   mas 2 min evita que uma rodada comece antes da anterior terminar (cada execução
   leva ~40-60s), e abaixo disso o ganho é pequeno por causa do atraso natural da API.
6. Abra a aba **Advanced** (ou "Request settings"):
   - **Request method:** `POST`
   - **Headers** (adicione um por um):
     | Key | Value |
     |---|---|
     | `Accept` | `application/vnd.github+json` |
     | `Authorization` | `Bearer github_pat_SEU_TOKEN_AQUI` |
     | `X-GitHub-Api-Version` | `2022-11-28` |
     | `Content-Type` | `application/json` |
     | `User-Agent` | `naoabromao-cron` |
   - **Request body:**
     ```json
     {"ref":"main"}
     ```
7. **Create / Save** e deixe **Enabled**.

## Passo 3 — Testar

- No cron-job.org, abra a tarefa e clique em **Run now** (ou **Test run**).
- O resultado esperado é **HTTP 204** (sucesso, sem conteúdo). 204 = deu certo.
- Em ~1 min, confira no GitHub (aba **Actions** do repositório) que rodou
  "Atualizar dados (NAO ABRO MAO)", e depois recarregue o site (Ctrl+Shift+R).

## Se algo der errado

- **HTTP 401/403:** token errado, expirado, ou sem a permissão **Actions: Read and
  write** / sem acesso ao repositório. Gere outro e atualize no header `Authorization`.
- **HTTP 404:** confira a URL (nome do repo e do arquivo do workflow) e se o token
  tem acesso ao repositório certo.
- **HTTP 422:** o corpo precisa ser `{"ref":"main"}` e o branch precisa existir.

## Quando o torneio acabar

- Pause/exclua a tarefa no cron-job.org e **revogue o token** no GitHub
  (Settings → Developer settings → Fine-grained tokens → o token → Revoke).
