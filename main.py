"""
PCPR – Gestão de Estudos  |  Backend FastAPI v2
Persistência: progresso.json (criado/reinicializado do zero na 1ª execução)
Rotas:
  GET  /api/topicos            → 127 tópicos enriquecidos
  POST /api/atualizar          → Soma novas questões ao tópico
  GET  /api/dashboard          → Métricas gerais + por matéria
  GET  /api/sugerir_estudo     → Sugestão inteligente com interleaving
  DELETE /api/resetar          → Zera todos os contadores (útil em dev)
"""

import json
import os
from collections import defaultdict
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, field_validator

# ─── App ────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="PCPR Gestão de Estudos",
    version="2.0",
    description="API de controle de estudos para o concurso PCPR — Meta: 80% em todos os módulos.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # React (Vite) em localhost:5173, 3000, etc.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "progresso.json"

# ─── 127 Tópicos Oficiais do Edital PCPR (todos zerados) ────────────────────
TOPICOS_EDITAL: List[dict] = [
    # ── Língua Portuguesa (1–19) ─────────────────────────────────────────
    {"id": 1,   "materia": "Língua Portuguesa", "topico": "Ortografia oficial e Acentuação gráfica."},
    {"id": 2,   "materia": "Língua Portuguesa", "topico": "Morfologia: Identificação e função das classes de palavras."},
    {"id": 3,   "materia": "Língua Portuguesa", "topico": "Sintaxe da Oração e do Período (Coordenação e Subordinação)."},
    {"id": 4,   "materia": "Língua Portuguesa", "topico": "Normas de Concordância (Nominal e Verbal)."},
    {"id": 5,   "materia": "Língua Portuguesa", "topico": "Normas de Regência (Nominal e Verbal) e uso da Crase."},
    {"id": 6,   "materia": "Língua Portuguesa", "topico": "Pontuação: Emprego e efeitos de sentido no texto."},
    {"id": 7,   "materia": "Língua Portuguesa", "topico": "Mecanismos de Coesão: Pronomes, conectivos e relatores."},
    {"id": 8,   "materia": "Língua Portuguesa", "topico": "Semântica: Significado de palavras e expressões em contexto; relações lógicas."},
    {"id": 9,   "materia": "Língua Portuguesa", "topico": "Relações estruturais e semânticas entre frases e expressões."},
    {"id": 10,  "materia": "Língua Portuguesa", "topico": "Elementos textuais: Fatos, opiniões, argumentos e teses."},
    {"id": 11,  "materia": "Língua Portuguesa", "topico": "Compreensão e Intelecção de Textos: Significado global e síntese."},
    {"id": 12,  "materia": "Língua Portuguesa", "topico": "Hierarquia de Ideias: Identificação de ideias principais e secundárias."},
    {"id": 13,  "materia": "Língua Portuguesa", "topico": "Inferência e Dedução: Identificação de pressupostos e pontos de vista."},
    {"id": 14,  "materia": "Língua Portuguesa", "topico": "Relações Intratextuais e Intertextuais (Intertextualidade)."},
    {"id": 15,  "materia": "Língua Portuguesa", "topico": "Gêneros e Tipologias Textuais: Análise de textos informativos, publicitários, charges e tiras."},
    {"id": 16,  "materia": "Língua Portuguesa", "topico": "Organização Argumentativa: Estrutura e avaliação de argumentos."},
    {"id": 17,  "materia": "Língua Portuguesa", "topico": "Vozes do Texto: Identificação de falas, citações e posicionamentos."},
    {"id": 18,  "materia": "Língua Portuguesa", "topico": "Estudo da Variedade Linguística: Registros formais e informais."},
    {"id": 19,  "materia": "Língua Portuguesa", "topico": "Posição do Autor diante do Tema: Identificação de fato vs. opinião."},
    # ── Informática (20–32) ──────────────────────────────────────────────
    {"id": 20,  "materia": "Informática", "topico": "Funcionamento básico do computador e componentes internos (CPU, Memória, Armazenamento)."},
    {"id": 21,  "materia": "Informática", "topico": "Operação de Periféricos: Instalação e uso de Impressoras e Scanners."},
    {"id": 22,  "materia": "Informática", "topico": "Noções de conectividade: Cabos, entradas e conexões de dispositivos."},
    {"id": 23,  "materia": "Informática", "topico": "Conceitos básicos do sistema operacional Linux e interface do Ubuntu."},
    {"id": 24,  "materia": "Informática", "topico": "Operação de Arquivos no Linux: Permissões, criar, mover, copiar e excluir."},
    {"id": 25,  "materia": "Informática", "topico": "Estrutura de diretórios do Linux (home, bin, etc)."},
    {"id": 26,  "materia": "Informática", "topico": "Noções de rede interna dentro do ambiente Linux."},
    {"id": 27,  "materia": "Informática", "topico": "Navegação na Web: Utilização e configuração do Firefox e Google Chrome."},
    {"id": 28,  "materia": "Informática", "topico": "Ferramentas de busca, histórico de navegação, favoritos e extensões."},
    {"id": 29,  "materia": "Informática", "topico": "Correio Eletrônico: Envio, recebimento, anexos e organização de e-mails."},
    {"id": 30,  "materia": "Informática", "topico": "LibreOffice Writer: Edição de texto, formatação e ferramentas de revisão."},
    {"id": 31,  "materia": "Informática", "topico": "LibreOffice Calc: Criação de planilhas, fórmulas, funções básicas e gráficos."},
    {"id": 32,  "materia": "Informática", "topico": "Atalhos de teclado específicos do ambiente Linux e suíte LibreOffice."},
    # ── Raciocínio Lógico e Matemático (33–47) ───────────────────────────
    {"id": 33,  "materia": "Raciocínio Lógico e Matemático", "topico": "Conjuntos Numéricos e Operações com Números Reais."},
    {"id": 34,  "materia": "Raciocínio Lógico e Matemático", "topico": "Razão, Proporção e Regra de Três (Simples e Composta)."},
    {"id": 35,  "materia": "Raciocínio Lógico e Matemático", "topico": "Porcentagem: Cálculos, aumentos e descontos."},
    {"id": 36,  "materia": "Raciocínio Lógico e Matemático", "topico": "Análise Combinatória: Princípio fundamental da contagem, arranjos e combinações."},
    {"id": 37,  "materia": "Raciocínio Lógico e Matemático", "topico": "Equações de 1º e 2º graus e Sistemas Lineares."},
    {"id": 38,  "materia": "Raciocínio Lógico e Matemático", "topico": "Geometria Plana: Áreas, perímetros e semelhança de triângulos."},
    {"id": 39,  "materia": "Raciocínio Lógico e Matemático", "topico": "Triângulo Retângulo: Teorema de Pitágoras e relações métricas."},
    {"id": 40,  "materia": "Raciocínio Lógico e Matemático", "topico": "Geometria Espacial: Cálculo de Volume e Capacidade."},
    {"id": 41,  "materia": "Raciocínio Lógico e Matemático", "topico": "Leitura e interpretação de dados expressos em Tabelas e Gráficos."},
    {"id": 42,  "materia": "Raciocínio Lógico e Matemático", "topico": "Medidas de Tendência Central: Média (aritmética simples e ponderada), Moda e Mediana."},
    {"id": 43,  "materia": "Raciocínio Lógico e Matemático", "topico": "Proposições: Conceitos iniciais, valores lógicos e sentenças abertas."},
    {"id": 44,  "materia": "Raciocínio Lógico e Matemático", "topico": "Conectivos Lógicos e representações simbólicas."},
    {"id": 45,  "materia": "Raciocínio Lógico e Matemático", "topico": "Tabelas-Verdade: Construção e análise de validade de proposições compostas."},
    {"id": 46,  "materia": "Raciocínio Lógico e Matemático", "topico": "Equivalências Lógicas: Leis de Morgan e equivalência da condicional."},
    {"id": 47,  "materia": "Raciocínio Lógico e Matemático", "topico": "Implicação Lógica e Argumentação Lógica: Métodos de dedução."},
    # ── Direito Administrativo (48–65) ───────────────────────────────────
    {"id": 48,  "materia": "Direito Administrativo", "topico": "Conceitos de Estado, Governo e Administração Pública."},
    {"id": 49,  "materia": "Direito Administrativo", "topico": "Princípios fundamentais da Administração Pública (Expressos e Implícitos)."},
    {"id": 50,  "materia": "Direito Administrativo", "topico": "Organização Administrativa: Administração Direta e Indireta."},
    {"id": 51,  "materia": "Direito Administrativo", "topico": "Poderes Administrativos: Poder Hierárquico e Poder Disciplinar."},
    {"id": 52,  "materia": "Direito Administrativo", "topico": "Poder Regulamentar e Poder de Polícia."},
    {"id": 53,  "materia": "Direito Administrativo", "topico": "Uso e Abuso do Poder: Excesso de poder e desvio de finalidade."},
    {"id": 54,  "materia": "Direito Administrativo", "topico": "Agentes Públicos: Espécies e classificação geral."},
    {"id": 55,  "materia": "Direito Administrativo", "topico": "Regime Constitucional dos Agentes Públicos: Cargo, Emprego e Função Pública."},
    {"id": 56,  "materia": "Direito Administrativo", "topico": "Provimento e Vacância de cargos públicos."},
    {"id": 57,  "materia": "Direito Administrativo", "topico": "Direitos de Movimentação: Remoção, Redistribuição e Substituição."},
    {"id": 58,  "materia": "Direito Administrativo", "topico": "Direitos, Vantagens e Regime Disciplinar aplicável aos servidores."},
    {"id": 59,  "materia": "Direito Administrativo", "topico": "Responsabilidades do Agente Público: Civil, Criminal e Administrativa."},
    {"id": 60,  "materia": "Direito Administrativo", "topico": "Serviços Públicos: Conceito, classificação, regulamentação e princípios norteadores."},
    {"id": 61,  "materia": "Direito Administrativo", "topico": "Formas de Delegação de Serviços Públicos: Concessão, Permissão e Autorização."},
    {"id": 62,  "materia": "Direito Administrativo", "topico": "Regulamentação e Controle da prestação de serviços delegados."},
    {"id": 63,  "materia": "Direito Administrativo", "topico": "Controle da Administração Pública: Controle Administrativo, Judicial e Legislativo."},
    {"id": 64,  "materia": "Direito Administrativo", "topico": "Responsabilidade Civil do Estado: Teoria do Risco Administrativo e Excludentes."},
    {"id": 65,  "materia": "Direito Administrativo", "topico": "Ação de Regresso contra o agente público causador do dano."},
    # ── Direito Constitucional (66–80) ───────────────────────────────────
    {"id": 66,  "materia": "Direito Constitucional", "topico": "Direitos e Deveres Individuais e Coletivos (Artigo 5º da CF)."},
    {"id": 67,  "materia": "Direito Constitucional", "topico": "Direitos Sociais previstos na Constituição Federal."},
    {"id": 68,  "materia": "Direito Constitucional", "topico": "Nacionalidade: Critérios de atribuição, natos, naturalizados e cargos privativos."},
    {"id": 69,  "materia": "Direito Constitucional", "topico": "Direitos Políticos e Partidos Políticos."},
    {"id": 70,  "materia": "Direito Constitucional", "topico": "Remédios Constitucionais (Habeas Corpus, MS, MI, HD, Ação Popular)."},
    {"id": 71,  "materia": "Direito Constitucional", "topico": "Poder Executivo: Atribuições, responsabilidades e crimes de responsabilidade do Presidente."},
    {"id": 72,  "materia": "Direito Constitucional", "topico": "Poder Legislativo: Estrutura, atribuições do Congresso Nacional e imunidades parlamentares."},
    {"id": 73,  "materia": "Direito Constitucional", "topico": "Defesa do Estado e das Instituições Democráticas: Segurança Pública (Artigo 144)."},
    {"id": 74,  "materia": "Direito Constitucional", "topico": "Atribuições específicas da Polícia Civil e sua vinculação constitucional."},
    {"id": 75,  "materia": "Direito Constitucional", "topico": "Ordem Social: Disposições Gerais e Objetivos da Ordem Social."},
    {"id": 76,  "materia": "Direito Constitucional", "topico": "Seguridade Social: Objetivos e princípios organizativos."},
    {"id": 77,  "materia": "Direito Constitucional", "topico": "Educação, Cultura, Desporto, Ciência, Tecnologia e Inovação."},
    {"id": 78,  "materia": "Direito Constitucional", "topico": "Meio Ambiente: Normas de proteção e deveres do Poder Público."},
    {"id": 79,  "materia": "Direito Constitucional", "topico": "Família, Criança, Adolescente, Jovem e Idoso: Proteção especial."},
    {"id": 80,  "materia": "Direito Constitucional", "topico": "Comunicação Social: Princípios, liberdade de expressão e vedações constitucionais."},
    # ── Direitos Humanos (81–82) ─────────────────────────────────────────
    {"id": 81,  "materia": "Direitos Humanos", "topico": "Declaração Universal dos Direitos Humanos (DUDH - 1948)."},
    {"id": 82,  "materia": "Direitos Humanos", "topico": "Princípios internacionais de proteção à vida, dignidade humana e vedação à tortura."},
    # ── Processo Penal (83–95) ───────────────────────────────────────────
    {"id": 83,  "materia": "Processo Penal", "topico": "Inquérito Policial: Conceito, características, finalidade e valor probatório."},
    {"id": 84,  "materia": "Processo Penal", "topico": "Notitia Criminis: Formas de cognição e início das investigações."},
    {"id": 85,  "materia": "Processo Penal", "topico": "Instauração, condução, prazos de conclusão e arquivamento do IP."},
    {"id": 86,  "materia": "Processo Penal", "topico": "Ação Penal Pública: Condicionada e Incondicionada (titularidade e princípios)."},
    {"id": 87,  "materia": "Processo Penal", "topico": "Ação Penal Privada: Queixa-crime, prazos decadenciais e princípios aplicáveis."},
    {"id": 88,  "materia": "Processo Penal", "topico": "Jurisdição e Competência: Critérios de determinação de foro e regras de fixação."},
    {"id": 89,  "materia": "Processo Penal", "topico": "Prova Pericial: Exame de Corpo de Delito e sua obrigatoriedade nos crimes com vestígios."},
    {"id": 90,  "materia": "Processo Penal", "topico": "Cadeia de Custódia: Conceito, etapas de preservação e reconhecimento da prova pericial."},
    {"id": 91,  "materia": "Processo Penal", "topico": "Perícias em Geral e Peritos: Nomeação, impedimentos, laudos e prazos."},
    {"id": 92,  "materia": "Processo Penal", "topico": "Prioridade de realização do exame de corpo de delito para vítimas específicas."},
    {"id": 93,  "materia": "Processo Penal", "topico": "Prisões em Espécie: Prisão em Flagrante (fundamentos e momentos do flagrante)."},
    {"id": 94,  "materia": "Processo Penal", "topico": "Prisão Preventiva: Requisitos, pressupostos e decretação."},
    {"id": 95,  "materia": "Processo Penal", "topico": "Prisão Temporária: Lei nº 7.960/1989 (hipóteses e prazos de aplicação)."},
    # ── Legislação Penal Especial (96–109) ───────────────────────────────
    {"id": 96,  "materia": "Legislação Penal Especial", "topico": "Lei de Drogas (Lei nº 11.343/2006): Infrações penais e procedimentos."},
    {"id": 97,  "materia": "Legislação Penal Especial", "topico": "Lei dos Crimes Hediondos (Lei nº 8.072/1990) e suas equiparações."},
    {"id": 98,  "materia": "Legislação Penal Especial", "topico": "Estatuto do Desarmamento (Lei nº 10.826/2003): Posse, porte e comércio ilegal."},
    {"id": 99,  "materia": "Legislação Penal Especial", "topico": "Lei de Tortura (Lei nº 9.455/1997): Tipificação e sanções."},
    {"id": 100, "materia": "Legislação Penal Especial", "topico": "Lei de Abuso de Autoridade (Lei nº 13.869/2019): Sujeitos e condutas criminosas."},
    {"id": 101, "materia": "Legislação Penal Especial", "topico": "Lei do Delegado de Polícia (Lei nº 12.830/2013): Prerrogativas e garantias."},
    {"id": 102, "materia": "Legislação Penal Especial", "topico": "Lei de Interceptação Telefônica (Lei nº 9.296/1996): Requisitos e vedações."},
    {"id": 103, "materia": "Legislação Penal Especial", "topico": "Pacote Anticrime (Lei nº 13.964/2019): Alterações estruturais na legislação penal."},
    {"id": 104, "materia": "Legislação Penal Especial", "topico": "Estatuto da Criança e do Adolescente (Lei nº 8.069/1990): Aspectos penais e processuais."},
    {"id": 105, "materia": "Legislação Penal Especial", "topico": "Crimes de Preconceito de Raça ou Cor (Lei nº 7.716/1989)."},
    {"id": 106, "materia": "Legislação Penal Especial", "topico": "Juizados Especiais Cíveis e Criminais (Lei nº 9.099/1995): Infrações de menor potencial ofensivo."},
    {"id": 107, "materia": "Legislação Penal Especial", "topico": "Crimes de Trânsito (Código de Trânsito Brasileiro - Lei nº 9.503/1997)."},
    {"id": 108, "materia": "Legislação Penal Especial", "topico": "Lei de Crimes Ambientais (Lei nº 9.605/1998): Infrações e sanções penais."},
    {"id": 109, "materia": "Legislação Penal Especial", "topico": "Código de Defesa do Consumidor (Lei nº 8.078/1990): Infrações penais de consumo."},
    # ── Direito Penal (110–127) ──────────────────────────────────────────
    {"id": 110, "materia": "Direito Penal", "topico": "Princípios constitucionais fundamentais do Direito Penal brasileiro."},
    {"id": 111, "materia": "Direito Penal", "topico": "Aplicação da Lei Penal: Lei penal no tempo (retroatividade e ultratividade)."},
    {"id": 112, "materia": "Direito Penal", "topico": "Aplicação da Lei Penal: Lei penal no lugar (territorialidade e extraterritorialidade)."},
    {"id": 113, "materia": "Direito Penal", "topico": "Interpretação e analogia na legislação criminal."},
    {"id": 114, "materia": "Direito Penal", "topico": "Infração Penal: Distinção entre crime e contravenção; classificações doutrinárias."},
    {"id": 115, "materia": "Direito Penal", "topico": "Sujeito ativo e sujeito passivo da infração penal."},
    {"id": 116, "materia": "Direito Penal", "topico": "Teoria do Crime: Conceito analítico de crime e seus elementos constitutivos."},
    {"id": 117, "materia": "Direito Penal", "topico": "Fato Típico: Conduta, resultado, nexo de causalidade e tipicidade."},
    {"id": 118, "materia": "Direito Penal", "topico": "Ilicitude (Antijuridicidade) e causas excludentes de ilicitude."},
    {"id": 119, "materia": "Direito Penal", "topico": "Culpabilidade: Conceito, elementos fundamentais e causas de exclusão."},
    {"id": 120, "materia": "Direito Penal", "topico": "Erro de Tipo e Erro de Proibição: Conceito, distinção e efeitos penais."},
    {"id": 121, "materia": "Direito Penal", "topico": "Imputabilidade Penal: Menoridade, doença mental e embriaguez."},
    {"id": 122, "materia": "Direito Penal", "topico": "Concurso de Pessoas: Coautoria, participação e comunicabilidade de elementares."},
    {"id": 123, "materia": "Direito Penal", "topico": "Punibilidade: Condições de procedibilidade e causas extintivas da punibilidade (Art. 107)."},
    {"id": 124, "materia": "Direito Penal", "topico": "Código Penal - Parte Geral: Estrutura lógica e regras de aplicação."},
    {"id": 125, "materia": "Direito Penal", "topico": "Crimes contra a Pessoa: Homicídio, lesão corporal e noções gerais."},
    {"id": 126, "materia": "Direito Penal", "topico": "Crimes contra o Patrimônio: Furto, roubo, extorsão e estelionato."},
    {"id": 127, "materia": "Direito Penal", "topico": "Crimes contra a Administração Pública: Praticados por funcionários e por particulares."},
]


# ─── Persistência ────────────────────────────────────────────────────────────

def _build_fresh_db() -> dict:
    return {
        "topicos": [
            {**t, "respondidas": 0, "acertadas": 0}
            for t in TOPICOS_EDITAL
        ]
    }


def load_db() -> dict:
    if not os.path.exists(DB_FILE):
        db = _build_fresh_db()
        save_db(db)
        return db

    with open(DB_FILE, "r", encoding="utf-8") as f:
        db = json.load(f)

    # Integridade: insere novos tópicos sem sobrescrever progresso existente
    ids_salvos = {t["id"] for t in db["topicos"]}
    novos = [
        {**t, "respondidas": 0, "acertadas": 0}
        for t in TOPICOS_EDITAL
        if t["id"] not in ids_salvos
    ]
    if novos:
        db["topicos"].extend(novos)
        db["topicos"].sort(key=lambda x: x["id"])
        save_db(db)

    return db


def save_db(data: dict) -> None:
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _percentual(acertadas: int, respondidas: int) -> float:
    if respondidas == 0:
        return 0.0
    return round((acertadas / respondidas) * 100, 1)


def _status(percentual: float, respondidas: int) -> str:
    if respondidas == 0:
        return "Não Iniciado"
    return "Meta Atingida" if percentual >= 80 else "Abaixo da Meta"


def _enrich(t: dict) -> dict:
    pct = _percentual(t["acertadas"], t["respondidas"])
    return {**t, "percentual": pct, "status": _status(pct, t["respondidas"])}


# ─── Modelos de entrada ──────────────────────────────────────────────────────

class AtualizarPayload(BaseModel):
    id_topico: int
    novas_respondidas: int
    novas_acertadas: int

    @field_validator("novas_respondidas", "novas_acertadas")
    @classmethod
    def nao_negativo(cls, v: int) -> int:
        if v < 0:
            raise ValueError("O valor não pode ser negativo.")
        return v


class EditarPayload(BaseModel):
    id_topico: int
    total_respondidas: int
    total_acertadas: int

    @field_validator("total_respondidas", "total_acertadas")
    @classmethod
    def nao_negativo(cls, v: int) -> int:
        if v < 0:
            raise ValueError("O valor não pode ser negativo.")
        return v


# ─── Rotas ───────────────────────────────────────────────────────────────────

@app.get("/api/topicos", summary="Lista todos os tópicos enriquecidos")
def get_topicos(materia: Optional[str] = Query(default=None, description="Filtrar por nome da matéria")):
    db = load_db()
    topicos = [_enrich(t) for t in db["topicos"]]
    if materia:
        topicos = [t for t in topicos if t["materia"].lower() == materia.lower()]
    return {"topicos": topicos, "total": len(topicos)}


@app.post("/api/atualizar", summary="Registra novas questões (acumula)")
def atualizar_topico(payload: AtualizarPayload):
    """
    Soma `novas_respondidas` e `novas_acertadas` aos totais existentes do tópico.
    Use este endpoint para registrar cada sessão de estudos.
    """
    if payload.novas_acertadas > payload.novas_respondidas:
        raise HTTPException(
            status_code=400,
            detail="novas_acertadas não pode ser maior que novas_respondidas."
        )
    db = load_db()
    for t in db["topicos"]:
        if t["id"] == payload.id_topico:
            t["respondidas"] += payload.novas_respondidas
            t["acertadas"]   += payload.novas_acertadas
            save_db(db)
            return {"topico": _enrich(t)}
    raise HTTPException(status_code=404, detail=f"Tópico id={payload.id_topico} não encontrado.")


@app.put("/api/editar", summary="Define o total absoluto de questões de um tópico")
def editar_topico(payload: EditarPayload):
    """
    Substitui os totais do tópico pelos valores informados.
    Use quando precisar corrigir um lançamento errado.
    """
    if payload.total_acertadas > payload.total_respondidas:
        raise HTTPException(
            status_code=400,
            detail="total_acertadas não pode ser maior que total_respondidas."
        )
    db = load_db()
    for t in db["topicos"]:
        if t["id"] == payload.id_topico:
            t["respondidas"] = payload.total_respondidas
            t["acertadas"]   = payload.total_acertadas
            save_db(db)
            return {"topico": _enrich(t)}
    raise HTTPException(status_code=404, detail=f"Tópico id={payload.id_topico} não encontrado.")


@app.get("/api/dashboard", summary="Métricas gerais e por matéria")
def get_dashboard():
    db = load_db()
    topicos = [_enrich(t) for t in db["topicos"]]

    total_respondidas = sum(t["respondidas"] for t in topicos)
    total_acertadas   = sum(t["acertadas"]   for t in topicos)
    percentual_geral  = _percentual(total_acertadas, total_respondidas)

    mapa: dict = {}
    for t in topicos:
        m = t["materia"]
        if m not in mapa:
            mapa[m] = {"materia": m, "respondidas": 0, "acertadas": 0,
                       "total_topicos": 0, "topicos_meta": 0}
        mapa[m]["respondidas"]   += t["respondidas"]
        mapa[m]["acertadas"]     += t["acertadas"]
        mapa[m]["total_topicos"] += 1
        if t["status"] == "Meta Atingida":
            mapa[m]["topicos_meta"] += 1

    materias = []
    for dados in mapa.values():
        pct = _percentual(dados["acertadas"], dados["respondidas"])
        materias.append({**dados, "percentual": pct, "abaixo_da_meta": pct < 80})

    # Pior taxa primeiro (não iniciados têm 0% → ficam no topo)
    materias.sort(key=lambda x: x["percentual"])

    alertas = [m["materia"] for m in materias if m["abaixo_da_meta"] and m["respondidas"] > 0]

    return {
        "percentual_geral": percentual_geral,
        "total_respondidas": total_respondidas,
        "total_acertadas": total_acertadas,
        "materias": materias,
        "alertas_abaixo_meta": alertas,
    }


@app.get("/api/sugerir_estudo", summary="Sugestão inteligente de tópicos com interleaving")
def sugerir_estudo(quantidade: int = Query(default=3, ge=1, le=20)):
    db = load_db()
    topicos = [_enrich(t) for t in db["topicos"]]
    candidatos = [t for t in topicos if t["status"] != "Meta Atingida"]

    if not candidatos:
        return {
            "sugestoes": [],
            "quantidade_retornada": 0,
            "mensagem": "Parabéns! Todos os 127 tópicos atingiram a meta de 80%.",
        }

    # ── Pré-calcula estatísticas por matéria ─────────────────────────────
    subj_respondidas: dict = defaultdict(int)
    subj_acertadas: dict   = defaultdict(int)
    for t in topicos:
        subj_respondidas[t["materia"]] += t["respondidas"]
        subj_acertadas[t["materia"]]   += t["acertadas"]

    # ── Média Bayesiana ──────────────────────────────────────────────────
    # prior = 50% | k = 5 questões equivalentes de prior
    # Com poucas questões → puxa para 50% (neutro, evita falsos urgentes)
    # Com muitas questões → converge para o desempenho real
    BAYES_PRIOR = 0.5
    BAYES_K     = 5

    def bayesian_acc(acertadas: int, respondidas: int) -> float:
        return (BAYES_PRIOR * BAYES_K + acertadas) / (BAYES_K + respondidas) * 100

    def score(t: dict) -> tuple:
        """
        Prioridade (menor = mais urgente):
          tier 0 – tópico nunca tocado (cobrir todos os tópicos o mais rápido possível)
          tier 1 – tópico iniciado mas abaixo da meta (refinamento após cobertura total)
        Dentro do tier 0: piores matérias bayesianas primeiro (cobre as mais frágeis antes)
        Dentro do tier 1: menor acurácia bayesiana da matéria → menor acurácia bayesiana do tópico
        """
        tier  = 0 if t["respondidas"] == 0 else 1
        s_bay = bayesian_acc(subj_acertadas[t["materia"]], subj_respondidas[t["materia"]])
        t_bay = bayesian_acc(t["acertadas"], t["respondidas"])
        return (tier, s_bay, t_bay)

    candidatos.sort(key=score)

    sugestoes: list = []
    usados: set     = set()
    ultima_materia  = ""

    while len(sugestoes) < quantidade:
        escolhido = None
        # Preferência: matéria diferente da última (interleaving)
        for t in candidatos:
            if t["id"] in usados:
                continue
            if t["materia"] != ultima_materia:
                escolhido = t
                break

        # Relaxa interleaving se só sobrou uma matéria
        if escolhido is None:
            for t in candidatos:
                if t["id"] not in usados:
                    escolhido = t
                    break

        if escolhido is None:
            break

        sugestoes.append(escolhido)
        usados.add(escolhido["id"])
        ultima_materia = escolhido["materia"]

    return {"sugestoes": sugestoes, "quantidade_retornada": len(sugestoes)}


@app.delete("/api/resetar", summary="Zera TODOS os contadores (atenção: irreversível)")
def resetar_banco():
    """Reinicia o progresso.json do zero. Use apenas para testes."""
    db = _build_fresh_db()
    save_db(db)
    return {"mensagem": "Banco zerado com sucesso. Todos os 127 tópicos reiniciados."}


@app.get("/", include_in_schema=False)
def serve_index():
    if os.path.exists("index.html"):
        return FileResponse("index.html")
    return {"api": "PCPR Gestão de Estudos v2", "docs": "/docs"}
