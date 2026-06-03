import type { Subject, Topic } from "@/lib/pcpr-data";

// ─── Configuração ─────────────────────────────────────────────────────────────
// Em desenvolvimento: backend FastAPI rodando em localhost:8000
// Em produção (build): trocar para a URL real do servidor
export const API_BASE = "http://localhost:8000";

// ─── Tipos da API ─────────────────────────────────────────────────────────────

export type ApiTopic = {
  id: number;
  materia: string;
  topico: string;
  respondidas: number;
  acertadas: number;
  percentual: number;
  status: "Não Iniciado" | "Abaixo da Meta" | "Meta Atingida";
  prioridade: 1 | 2 | 3 | 4;
  label_prioridade: "Máxima" | "Alta" | "Média" | "Complementar";
  questoes_prova: number;
  peso_percentual: number;
};

export type ApiTopicosResponse = {
  topicos: ApiTopic[];
  total: number;
};

export type ApiMateria = {
  materia: string;
  respondidas: number;
  acertadas: number;
  percentual: number;
  abaixo_da_meta: boolean;
  total_topicos: number;
  topicos_meta: number;
  prioridade: 1 | 2 | 3 | 4;
  label_prioridade: "Máxima" | "Alta" | "Média" | "Complementar";
  questoes_prova: number;
  peso_percentual: number;
};

export type ApiMateriaConfig = {
  materia: string;
  prioridade: 1 | 2 | 3 | 4;
  label_prioridade: "Máxima" | "Alta" | "Média" | "Complementar";
  questoes_prova: number;
  peso_percentual: number;
  ordem: number;
};

export type ApiMateriasConfigResponse = {
  materias: ApiMateriaConfig[];
  total: number;
};

export type ApiDashboard = {
  percentual_geral: number;
  total_respondidas: number;
  total_acertadas: number;
  materias: ApiMateria[];
  alertas_abaixo_meta: string[];
};

export type ApiSugestoes = {
  sugestoes: ApiTopic[];
  quantidade_retornada: number;
  mensagem?: string;
};

export type AtualizarPayload = {
  id_topico: number;
  novas_respondidas: number;
  novas_acertadas: number;
};

export type EditarPayload = {
  id_topico: number;
  total_respondidas: number;
  total_acertadas: number;
};

// ─── Tipo de sugestão compatível com o Dashboard ─────────────────────────────
export type SuggestionItem = {
  subjectKey: string;
  subjectName: string;
  topic: Topic;
  score: number;
};

// ─── Mapeamento matéria → chave/abreviação do frontend ───────────────────────
const MATERIA_META: Record<string, { key: string; short: string }> = {
  "Língua Portuguesa":           { key: "portugues",  short: "Português" },
  "Informática":                  { key: "informatica", short: "Informática" },
  "Raciocínio Lógico e Matemático": { key: "logica",   short: "Lógica" },
  "Direito Administrativo":       { key: "dir_adm",    short: "D. Administrativo" },
  "Direito Constitucional":       { key: "dir_const",  short: "D. Constitucional" },
  "Direitos Humanos":             { key: "dir_humanos", short: "D. Humanos" },
  "Processo Penal":               { key: "proc_penal", short: "Processo Penal" },
  "Legislação Penal Especial":    { key: "leg_esp",    short: "Leg. Especial" },
  "Direito Penal":                { key: "dir_penal",  short: "D. Penal" },
  "Tecnologia, Sistemas de Informação/Comunicação, Segurança Cibernética e Crimes Digitais": { key: "tecnologia_seg", short: "Tecnologia/Seg." },
  "Ciências Forenses":            { key: "ciencias_forenses", short: "C. Forenses" },
  "Estatística":                  { key: "estatistica", short: "Estatística" },
  "Contabilidade Geral":          { key: "contabilidade", short: "Contabilidade" },
  "Realidade do Paraná":          { key: "realidade_pr",  short: "Realidade PR" },
};

// Ordem de exibição das matérias no painel
const ORDEM_MATERIAS = Object.keys(MATERIA_META);

// ─── Transformações ───────────────────────────────────────────────────────────

/** Converte ApiTopic → Topic (formato interno do frontend) */
export function apiToTopic(t: ApiTopic): Topic {
  return { id: t.id, name: t.topico, answered: t.respondidas, correct: t.acertadas };
}

/** Converte array flat de ApiTopic → Subject[] agrupado (usado pelo Dashboard) */
export function apiTopicosToSubjects(apiTopicos: ApiTopic[]): Subject[] {
  const map = new Map<string, Subject>();

  for (const t of apiTopicos) {
    const meta = MATERIA_META[t.materia] ?? { key: t.materia.toLowerCase(), short: t.materia };
    if (!map.has(t.materia)) {
      map.set(t.materia, { key: meta.key, name: t.materia, short: meta.short, topics: [] });
    }
    map.get(t.materia)!.topics.push(apiToTopic(t));
  }

  // Ordena por ordem canônica do edital
  const resultado: Subject[] = [];
  for (const nome of ORDEM_MATERIAS) {
    if (map.has(nome)) resultado.push(map.get(nome)!);
  }
  for (const [nome, s] of map) {
    if (!ORDEM_MATERIAS.includes(nome)) resultado.push(s);
  }
  return resultado;
}

/** Converte ApiTopic de sugestão → SuggestionItem (compatível com cards do Dashboard) */
export function apiToSuggestion(t: ApiTopic): SuggestionItem {
  const meta = MATERIA_META[t.materia] ?? { key: t.materia.toLowerCase(), short: t.materia };
  return {
    subjectKey:  meta.key,
    subjectName: t.materia,
    topic:       apiToTopic(t),
    score:       t.percentual,
  };
}

// ─── Funções de fetch ─────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `Erro HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignora erros de parse
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export async function fetchTopicos(materia?: string): Promise<ApiTopicosResponse> {
  const url = materia
    ? `${API_BASE}/api/topicos?materia=${encodeURIComponent(materia)}`
    : `${API_BASE}/api/topicos`;
  return handleResponse<ApiTopicosResponse>(await fetch(url));
}

export async function fetchDashboard(): Promise<ApiDashboard> {
  return handleResponse<ApiDashboard>(await fetch(`${API_BASE}/api/dashboard`));
}

export async function fetchSugestoes(quantidade = 3): Promise<ApiSugestoes> {
  return handleResponse<ApiSugestoes>(
    await fetch(`${API_BASE}/api/sugerir_estudo?quantidade=${quantidade}`)
  );
}

export async function atualizarTopico(
  payload: AtualizarPayload
): Promise<{ topico: ApiTopic }> {
  return handleResponse<{ topico: ApiTopic }>(
    await fetch(`${API_BASE}/api/atualizar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function editarTopico(
  payload: EditarPayload
): Promise<{ topico: ApiTopic }> {
  return handleResponse<{ topico: ApiTopic }>(
    await fetch(`${API_BASE}/api/editar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function fetchMateriasConfig(): Promise<ApiMateriasConfigResponse> {
  return handleResponse<ApiMateriasConfigResponse>(await fetch(`${API_BASE}/api/materias/config`));
}
