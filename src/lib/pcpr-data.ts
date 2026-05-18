export type Topic = {
  id: number;
  name: string;
  answered: number;
  correct: number;
};

export type Subject = {
  key: string;
  name: string;
  short: string;
  topics: Topic[];
};

// ─── Dados iniciais removidos: agora servidos pelo backend FastAPI ──────────
// Os 127 tópicos são carregados via GET /api/topicos e transformados por
// apiTopicosToSubjects() em src/lib/api.ts.
// Mantemos aqui apenas os tipos e funções utilitárias de cálculo.

// Compatibilidade: exporta array vazio — dados reais vêm do backend FastAPI
export const initialSubjects: Subject[] = [];

export function accuracy(t: { answered: number; correct: number }) {
  if (!t.answered) return 0;
  return (t.correct / t.answered) * 100;
}

export function subjectStats(s: Subject) {
  const answered = s.topics.reduce((a, t) => a + t.answered, 0);
  const correct = s.topics.reduce((a, t) => a + t.correct, 0);
  const acc = answered ? (correct / answered) * 100 : 0;
  const startedTopics = s.topics.filter((t) => t.answered > 0).length;
  return { answered, correct, acc, startedTopics, totalTopics: s.topics.length };
}

    name: "Informática",
    short: "Informática",
    topics: [
      { id: 20, name: "Componentes de hardware", answered: 8, correct: 5 },
      { id: 21, name: "Sistemas operacionais — Windows", answered: 0, correct: 0 },
      { id: 22, name: "Sistemas operacionais — conceitos", answered: 0, correct: 0 },
      { id: 23, name: "Linux Ubuntu", answered: 10, correct: 9 },
      { id: 24, name: "Pacote Office — Word", answered: 0, correct: 0 },
      { id: 25, name: "Pacote Office — Excel", answered: 0, correct: 0 },
      { id: 26, name: "BrOffice/LibreOffice", answered: 0, correct: 0 },
      { id: 27, name: "Redes de computadores", answered: 0, correct: 0 },
      { id: 28, name: "Internet e intranet", answered: 0, correct: 0 },
      { id: 29, name: "Correio eletrônico", answered: 0, correct: 0 },
      { id: 30, name: "Segurança da informação", answered: 0, correct: 0 },
      { id: 31, name: "Vírus e ameaças digitais", answered: 0, correct: 0 },
      { id: 32, name: "Armazenamento em nuvem", answered: 0, correct: 0 },
    ],
  },
  {
    key: "logica",
    name: "Raciocínio Lógico e Matemático",
    short: "Lógica",
    topics: [
      { id: 33, name: "Conjuntos numéricos", answered: 10, correct: 7 },
      { id: 34, name: "Operações com frações", answered: 0, correct: 0 },
      { id: 35, name: "Razão e proporção", answered: 0, correct: 0 },
      { id: 36, name: "Regra de três", answered: 0, correct: 0 },
      { id: 37, name: "Porcentagem", answered: 0, correct: 0 },
      { id: 38, name: "Juros simples e compostos", answered: 0, correct: 0 },
      { id: 39, name: "Equações de 1º e 2º grau", answered: 0, correct: 0 },
      { id: 40, name: "Análise combinatória", answered: 0, correct: 0 },
      { id: 41, name: "Probabilidade", answered: 0, correct: 0 },
      { id: 42, name: "Sequências e progressões", answered: 0, correct: 0 },
      { id: 43, name: "Estruturas lógicas", answered: 0, correct: 0 },
      { id: 44, name: "Conectivos lógicos", answered: 10, correct: 6 },
      { id: 45, name: "Tabelas-verdade", answered: 0, correct: 0 },
      { id: 46, name: "Equivalências lógicas", answered: 0, correct: 0 },
      { id: 47, name: "Quantificadores", answered: 0, correct: 0 },
      { id: 48, name: "Argumentação lógica", answered: 0, correct: 0 },
      { id: 49, name: "Diagramas lógicos", answered: 0, correct: 0 },
    ],
  },
  {
    key: "dir_adm",
    name: "Direito Administrativo",
    short: "D. Administrativo",
    topics: [
      { id: 50, name: "Princípios da administração pública", answered: 0, correct: 0 },
      { id: 51, name: "Poderes administrativos", answered: 0, correct: 0 },
      { id: 52, name: "Atos administrativos", answered: 0, correct: 0 },
      { id: 53, name: "Organização administrativa", answered: 0, correct: 0 },
      { id: 54, name: "Servidores públicos", answered: 0, correct: 0 },
      { id: 55, name: "Processo administrativo", answered: 0, correct: 0 },
      { id: 56, name: "Licitações", answered: 0, correct: 0 },
      { id: 57, name: "Contratos administrativos", answered: 0, correct: 0 },
      { id: 58, name: "Improbidade administrativa", answered: 0, correct: 0 },
      { id: 59, name: "Responsabilidade civil do Estado", answered: 0, correct: 0 },
      { id: 60, name: "Controle da administração", answered: 0, correct: 0 },
      { id: 61, name: "Bens públicos", answered: 0, correct: 0 },
      { id: 62, name: "Lei de Acesso à Informação", answered: 0, correct: 0 },
    ],
  },
  {
    key: "dir_const",
    name: "Direito Constitucional",
    short: "D. Constitucional",
    topics: [
      { id: 63, name: "Princípios fundamentais", answered: 0, correct: 0 },
      { id: 64, name: "Direitos e garantias fundamentais", answered: 0, correct: 0 },
      { id: 65, name: "Direitos sociais", answered: 0, correct: 0 },
      { id: 66, name: "Nacionalidade", answered: 0, correct: 0 },
      { id: 67, name: "Direitos políticos", answered: 0, correct: 0 },
      { id: 68, name: "Organização do Estado", answered: 0, correct: 0 },
      { id: 69, name: "Poder Legislativo", answered: 0, correct: 0 },
      { id: 70, name: "Poder Executivo", answered: 0, correct: 0 },
      { id: 71, name: "Poder Judiciário", answered: 0, correct: 0 },
      { id: 72, name: "Funções essenciais à justiça", answered: 0, correct: 0 },
      { id: 73, name: "Segurança pública", answered: 0, correct: 0 },
      { id: 74, name: "Controle de constitucionalidade", answered: 0, correct: 0 },
      { id: 75, name: "Ordem social", answered: 0, correct: 0 },
    ],
  },
  {
    key: "dir_humanos",
    name: "Direitos Humanos",
    short: "D. Humanos",
    topics: [
      { id: 76, name: "Teoria geral dos direitos humanos", answered: 0, correct: 0 },
      { id: 77, name: "Declaração Universal de 1948", answered: 0, correct: 0 },
      { id: 78, name: "Pacto de San José da Costa Rica", answered: 0, correct: 0 },
      { id: 79, name: "Sistema interamericano", answered: 0, correct: 0 },
      { id: 80, name: "Lei Maria da Penha", answered: 0, correct: 0 },
      { id: 81, name: "Estatuto da Criança e do Adolescente", answered: 0, correct: 0 },
      { id: 82, name: "Estatuto do Idoso", answered: 0, correct: 0 },
      { id: 83, name: "Pessoa com deficiência", answered: 0, correct: 0 },
      { id: 84, name: "Igualdade racial", answered: 0, correct: 0 },
      { id: 85, name: "Direitos humanos e atividade policial", answered: 0, correct: 0 },
    ],
  },
  {
    key: "proc_penal",
    name: "Processo Penal",
    short: "Processo Penal",
    topics: [
      { id: 86, name: "Princípios do processo penal", answered: 0, correct: 0 },
      { id: 87, name: "Inquérito policial", answered: 0, correct: 0 },
      { id: 88, name: "Ação penal", answered: 0, correct: 0 },
      { id: 89, name: "Jurisdição e competência", answered: 0, correct: 0 },
      { id: 90, name: "Prova", answered: 0, correct: 0 },
      { id: 91, name: "Prisões e medidas cautelares", answered: 0, correct: 0 },
      { id: 92, name: "Liberdade provisória e fiança", answered: 0, correct: 0 },
      { id: 93, name: "Citações e intimações", answered: 0, correct: 0 },
      { id: 94, name: "Procedimentos", answered: 0, correct: 0 },
      { id: 95, name: "Nulidades", answered: 0, correct: 0 },
      { id: 96, name: "Recursos", answered: 0, correct: 0 },
      { id: 97, name: "Habeas corpus", answered: 0, correct: 0 },
    ],
  },
  {
    key: "leg_esp",
    name: "Legislação Penal Especial",
    short: "Leg. Especial",
    topics: [
      { id: 98, name: "Lei de Drogas (11.343/06)", answered: 0, correct: 0 },
      { id: 99, name: "Estatuto do Desarmamento", answered: 0, correct: 0 },
      { id: 100, name: "Crimes hediondos", answered: 0, correct: 0 },
      { id: 101, name: "Lei de Tortura", answered: 0, correct: 0 },
      { id: 102, name: "Lei das Organizações Criminosas", answered: 0, correct: 0 },
      { id: 103, name: "Lei de Lavagem de Capitais", answered: 0, correct: 0 },
      { id: 104, name: "Crimes contra a ordem tributária", answered: 0, correct: 0 },
      { id: 105, name: "Crimes de trânsito", answered: 0, correct: 0 },
      { id: 106, name: "Abuso de autoridade", answered: 0, correct: 0 },
      { id: 107, name: "Interceptação telefônica", answered: 0, correct: 0 },
      { id: 108, name: "Crimes cibernéticos", answered: 0, correct: 0 },
      { id: 109, name: "Violência doméstica", answered: 0, correct: 0 },
    ],
  },
  {
    key: "dir_penal",
    name: "Direito Penal",
    short: "D. Penal",
    topics: [
      { id: 110, name: "Princípios constitucionais do Direito Penal", answered: 10, correct: 6 },
      { id: 111, name: "Aplicação da lei penal", answered: 0, correct: 0 },
      { id: 112, name: "Tempo e lugar do crime", answered: 0, correct: 0 },
      { id: 113, name: "Lei penal no espaço", answered: 0, correct: 0 },
      { id: 114, name: "Teoria do crime", answered: 0, correct: 0 },
      { id: 115, name: "Tipicidade", answered: 0, correct: 0 },
      { id: 116, name: "Ilicitude e culpabilidade", answered: 0, correct: 0 },
      { id: 117, name: "Fato típico", answered: 10, correct: 9 },
      { id: 118, name: "Concurso de pessoas", answered: 0, correct: 0 },
      { id: 119, name: "Concurso de crimes", answered: 0, correct: 0 },
      { id: 120, name: "Penas e medidas de segurança", answered: 0, correct: 0 },
      { id: 121, name: "Extinção da punibilidade", answered: 0, correct: 0 },
      { id: 122, name: "Crimes contra a pessoa", answered: 0, correct: 0 },
      { id: 123, name: "Crimes contra o patrimônio", answered: 0, correct: 0 },
      { id: 124, name: "Crimes contra a dignidade sexual", answered: 0, correct: 0 },
      { id: 125, name: "Crimes contra a administração pública", answered: 0, correct: 0 },
      { id: 126, name: "Crimes contra a fé pública", answered: 0, correct: 0 },
      { id: 127, name: "Crimes contra a honra", answered: 0, correct: 0 },
    ],
  },
];

export function accuracy(t: { answered: number; correct: number }) {
  if (!t.answered) return 0;
  return (t.correct / t.answered) * 100;
}

export function subjectStats(s: Subject) {
  const answered = s.topics.reduce((a, t) => a + t.answered, 0);
  const correct = s.topics.reduce((a, t) => a + t.correct, 0);
  const acc = answered ? (correct / answered) * 100 : 0;
  const startedTopics = s.topics.filter((t) => t.answered > 0).length;
  return { answered, correct, acc, startedTopics, totalTopics: s.topics.length };
}

/**
 * Smart suggestion: pick 3 topics prioritizing low accuracy / not started,
 * never two consecutive from the same subject (interleaving).
 */
export function suggestTopics(subjects: Subject[], n = 3) {
  type Cand = { subjectKey: string; subjectName: string; topic: Topic; score: number };
  const cands: Cand[] = [];
  for (const s of subjects) {
    for (const t of s.topics) {
      const acc = accuracy(t);
      // Lower score = higher priority.
      // Not started => slightly less urgent than struggling (<80%) ones so we surface gaps first.
      let score: number;
      if (t.answered === 0) score = 85; // baseline for unseen
      else if (acc < 80) score = acc; // 0..79 -> very high priority
      else score = 200 + acc; // mastered, deprioritize
      cands.push({ subjectKey: s.key, subjectName: s.name, topic: t, score });
    }
  }
  cands.sort((a, b) => a.score - b.score);

  const picked: Cand[] = [];
  const used = new Set<number>();
  // Greedy with interleaving: never pick same subject as previous.
  while (picked.length < n) {
    let advanced = false;
    for (let i = 0; i < cands.length; i++) {
      if (used.has(i)) continue;
      const c = cands[i];
      if (picked.length && picked[picked.length - 1].subjectKey === c.subjectKey) continue;
      picked.push(c);
      used.add(i);
      advanced = true;
      break;
    }
    if (!advanced) {
      // Relax interleaving if impossible
      for (let i = 0; i < cands.length; i++) {
        if (!used.has(i)) {
          picked.push(cands[i]);
          used.add(i);
          break;
        }
      }
    }
    if (used.size >= cands.length) break;
  }
  return picked;
}
