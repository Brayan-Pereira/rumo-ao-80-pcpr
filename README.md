# 🚔 Rumo aos 80% — PCPR Gestão de Estudos

> Sistema de controle de estudos para o concurso da **Polícia Civil do Paraná**.  
> Meta: atingir **80% de acurácia** em todos os 127 tópicos do edital.

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Como Rodar](#como-rodar)
  - [Backend (FastAPI)](#backend-fastapi)
  - [Frontend (React + Vite)](#frontend-react--vite)
- [Telas do Sistema](#telas-do-sistema)
- [Endpoints da API](#endpoints-da-api)
- [Estrutura de Arquivos](#estrutura-de-arquivos)

---

## Sobre o Projeto

O **Rumo aos 80%** é um painel de controle pessoal para gerenciar a preparação para o concurso PCPR. Ele permite:

- Registrar sessões de estudo por tópico (questões respondidas e acertadas)
- Acompanhar a acurácia em tempo real por tópico e por matéria
- Receber **sugestão inteligente diária** de 3 tópicos prioritários via algoritmo bayesiano
- Visualizar o progresso geral rumo à meta de 80%

### Lógica de Priorização (Sugestão Inteligente)

O algoritmo usa **Média Bayesiana** com dois estágios:

| Fase | Critério | Objetivo |
|------|----------|----------|
| **Cobertura** (tier 0) | Tópico nunca tocado → prioridade máxima | Cobrir todos os 127 tópicos o mais rápido possível |
| **Refinamento** (tier 1) | Tópico iniciado mas abaixo de 80% → ordenado por pior acurácia bayesiana | Elevar os pontos fracos confirmados |

A acurácia bayesiana evita que tópicos com poucos dados (1-2 questões) dominem a fila artificialmente:

```
acurácia_ajustada = (0.5 × 5 + acertadas) / (5 + respondidas) × 100
```

---

## Arquitetura

```
┌─────────────────────────┐        HTTP (localhost:8000)       ┌──────────────────────────┐
│   Frontend              │ ◄────────────────────────────────► │   Backend                │
│   React + Vite          │                                     │   FastAPI + Python       │
│   TanStack Router       │                                     │   Persistência: JSON     │
│   Tailwind + shadcn/ui  │                                     │                          │
│   localhost:5173        │                                     │   localhost:8000         │
└─────────────────────────┘                                     └──────────────────────────┘
                                                                          │
                                                                          ▼
                                                                  progresso.json
                                                                  (127 tópicos)
```

---

## Pré-requisitos

| Ferramenta | Versão mínima | Verificar |
|------------|--------------|-----------|
| Python | 3.10+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm / bun | qualquer | `npm --version` |

---

## Como Rodar

### Backend (FastAPI)

> Rode a partir da **raiz do projeto** (`PCPR programa/`)

**1. Instalar dependências Python:**
```bash
pip install -r requirements.txt
```

**2. Iniciar o servidor:**
```bash
uvicorn main:app --reload
```

O backend sobe em: **http://localhost:8000**  
Documentação interativa: **http://localhost:8000/docs**

> O arquivo `progresso.json` é criado automaticamente na primeira execução com todos os 127 tópicos zerados.

---

### Frontend (React + Vite)

> Rode a partir da pasta `rumo-ao-80-pcpr/`

**1. Entrar na pasta:**
```bash
cd rumo-ao-80-pcpr
```

**2. Instalar dependências:**
```bash
npm install
```

**3. Iniciar em modo desenvolvimento:**
```bash
npm run dev
```

O frontend sobe em: **http://localhost:5173**

> ⚠️ O backend precisa estar rodando antes de abrir o frontend.

---

### Rodar os dois ao mesmo tempo (Windows)

Abra **dois terminais separados**:

**Terminal 1 — Backend:**
```bash
cd "PCPR programa"
uvicorn main:app --reload
```

**Terminal 2 — Frontend:**
```bash
cd "PCPR programa/rumo-ao-80-pcpr"
npm run dev
```

---

## Telas do Sistema

### Painel Principal

```
┌──────────────────────────────────────────────────────────────────────┐
│  🛡 Painel de Controle PCPR          [TÁTICO • AO VIVO]             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │ Tópicos      │ │ Questões     │ │ Acurácia     │ │ Progresso  │ │
│  │ Revisados    │ │ Respondidas  │ │ Geral        │ │ para 80%   │ │
│  │    12        │ │    213       │ │   64.3%      │ │   18%      │ │
│  │ de 127       │ │  137 acertos │ │ Faltam 15.7p │ │ ▓▓░░░░░░  │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Sugestão Inteligente do Dia

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🧠 Sugestão Inteligente do Dia          INTERLEAVING • PRIORIZAÇÃO DE LACUNAS │
├──────────────────────┬──────────────────────┬──────────────────────────────┤
│  PRIO #1             │  PRIO #2             │  PRIO #3                     │
│  LÍNGUA PORTUGUESA   │  DIREITO PENAL       │  RACIOCÍNIO LÓGICO           │
│                      │                      │                              │
│  Ortografia oficial  │  Princípios          │  Porcentagem: Cálculos,      │
│  e Acentuação        │  constitucionais do  │  aumentos e descontos.       │
│  gráfica.            │  Direito Penal.      │                              │
│                      │                      │                              │
│  [Não Iniciado] 0/0  │  [Não Iniciado] 0/0  │  [Não Iniciado] 0/0         │
│  ░░░░░░░░░░░░░░░░    │  ░░░░░░░░░░░░░░░░    │  ░░░░░░░░░░░░░░░░           │
│                      │                      │                              │
│  [Responder Questões ↗] [Responder Questões ↗] [Responder Questões ↗]     │
└──────────────────────┴──────────────────────┴──────────────────────────────┘
```

### Métricas por Disciplina

```
┌──────────────────────────────────────────────────────────────────────┐
│  🎯 Métricas por Disciplina                                          │
├───────────────────────┬───────────────────────┬──────────────────────┤
│  Língua Portuguesa    │  Informática          │  Raciocínio Lógico   │
│  0/19 tópicos na meta │  1/13 tópicos na meta │  0/15 tópicos na meta│
│                       │                       │                      │
│  Progresso    Acurácia│  Progresso    Acurácia│  Progresso   Acurácia│
│     0%          —     │     8%         40%    │     0%         —     │
│  ░░░░░░░░░░░░         │  ▓░░░░░░░░░░░         │  ░░░░░░░░░░░░        │
└───────────────────────┴───────────────────────┴──────────────────────┘
```

### Fila de Tópicos — Edital Completo

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Língua Portuguesa  1/19      17 questões respondidas          0%  ░░░░  ∨  │
├──────────────────────────────────────────────────────────────────────────────┤
│  Informática        2/13      20 questões respondidas          8%  ▓░░░  ∨  │
├──────────────────────────────────────────────────────────────────────────────┤
│  Raciocínio Lógico  1/15      13 questões respondidas          0%  ░░░░  ∨  │
├──────────────────────────────────────────────────────────────────────────────┤
│  ▼ Informática (expandido)                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ #020  Funcionamento básico do computador...   [Meta ✓] 95%  ▓▓▓▓▓  │   │
│  │ #021  Operação de Periféricos...              [Atenção] 65%  ▓▓▓░░  │   │
│  │ #022  Noções de conectividade...              [Não Iniciado]   ░░░░  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Dialog — Registrar Sessão de Estudos

```
┌───────────────────────────────────────────────┐
│  Registrar Sessão de Estudos                  │
│                                               │
│  Tópico: Ortografia oficial e Acentuação      │
│                                               │
│  Questões respondidas:  [ 10 ]                │
│  Questões acertadas:    [  7 ]                │
│                                               │
│            [Cancelar]  [Salvar]               │
└───────────────────────────────────────────────┘
```

---

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/topicos` | Lista todos os 127 tópicos com acurácia calculada |
| `GET` | `/api/topicos?materia=Informática` | Filtra tópicos por matéria |
| `POST` | `/api/atualizar` | Registra nova sessão (acumula questões) |
| `PUT` | `/api/editar` | Corrige total absoluto de um tópico |
| `GET` | `/api/dashboard` | Métricas gerais e por matéria |
| `GET` | `/api/sugerir_estudo?quantidade=3` | Sugestão inteligente de tópicos |
| `DELETE` | `/api/resetar` | Zera todos os contadores |

**Exemplo — Registrar sessão:**
```bash
curl -X POST http://localhost:8000/api/atualizar \
  -H "Content-Type: application/json" \
  -d '{"id_topico": 1, "novas_respondidas": 10, "novas_acertadas": 8}'
```

**Exemplo — Sugestão do dia:**
```bash
curl http://localhost:8000/api/sugerir_estudo?quantidade=3
```

---

## Estrutura de Arquivos

```
PCPR programa/
│
├── main.py                  # Backend FastAPI — 127 tópicos + rotas
├── progresso.json           # Banco de dados (gerado automaticamente)
├── requirements.txt         # fastapi, uvicorn
│
└── rumo-ao-80-pcpr/         # Frontend React
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── components/
        │   ├── pcpr/
        │   │   ├── Dashboard.tsx        # Painel principal
        │   │   ├── AccuracyBar.tsx      # Barra de acurácia
        │   │   └── UpdateTopicDialog.tsx # Dialog de registro
        │   └── ui/                      # Componentes shadcn/ui
        ├── lib/
        │   ├── api.ts                   # Cliente HTTP (fetch para FastAPI)
        │   └── pcpr-data.ts             # Tipos e funções de cálculo
        └── routes/
            └── index.tsx                # Página principal
```

---

## Matérias Cobertas

| Matéria | Tópicos |
|---------|---------|
| Língua Portuguesa | 19 |
| Informática | 13 |
| Raciocínio Lógico e Matemático | 15 |
| Direito Administrativo | 18 |
| Direito Constitucional | 15 |
| Direitos Humanos | 2 |
| Processo Penal | 13 |
| Legislação Penal Especial | 14 |
| Direito Penal | 18 |
| **Total** | **127** |

--- 

> Projeto pessoal de preparação para concurso. Os tópicos seguem o edital anterior da PCPR como referência até a publicação do edital vigente.
