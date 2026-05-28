import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTopicos,
  fetchSugestoes,
  atualizarTopico,
  editarTopico,
  apiTopicosToSubjects,
  apiToSuggestion,
  type SuggestionItem,
} from "@/lib/api";
import {
  accuracy,
  subjectStats,
  subjectProgress,
  type Subject,
  type Topic,
} from "@/lib/pcpr-data";
import { AccuracyBar } from "./AccuracyBar";
import { UpdateTopicDialog } from "./UpdateTopicDialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Crosshair,
  Activity,
  Shield,
  Flame,
  ListChecks,
  Brain,
  ArrowUpRight,
} from "lucide-react";

const TARGET = 80;

function statusColor(acc: number, answered: number) {
  if (!answered) return "text-muted-foreground";
  if (acc >= TARGET) return "text-success";
  if (acc >= 60) return "text-warning";
  return "text-danger";
}

function statusBadge(acc: number, answered: number) {
  if (!answered)
    return (
      <Badge variant="outline" className="border-border text-muted-foreground bg-secondary/40">
        Não Iniciado
      </Badge>
    );
  if (acc >= TARGET)
    return (
      <Badge className="bg-success/15 text-success border border-success/30 hover:bg-success/20">
        {acc.toFixed(0)}% • Meta ✓
      </Badge>
    );
  if (acc >= 60)
    return (
      <Badge className="bg-warning/15 text-warning border border-warning/30 hover:bg-warning/20">
        {acc.toFixed(0)}% • Atenção
      </Badge>
    );
  return (
    <Badge className="bg-danger/15 text-danger border border-danger/30 hover:bg-danger/20">
      {acc.toFixed(0)}% • Crítico
    </Badge>
  );
}

export function Dashboard() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<{ subjectKey: string; topic: Topic } | null>(null);
  const [open, setOpen] = useState(false);

  // ── Busca tópicos do backend ──────────────────────────────────────────────
  const { data: topicosData, isLoading: loadingTopicos } = useQuery({
    queryKey: ["topicos"],
    queryFn: () => fetchTopicos(),
    staleTime: 0,
  });

  const subjects: Subject[] = useMemo(
    () => (topicosData ? apiTopicosToSubjects(topicosData.topicos) : []),
    [topicosData],
  );

  // ── Busca sugestões do backend ────────────────────────────────────────────
  const { data: sugestoesData } = useQuery({
    queryKey: ["sugestoes"],
    queryFn: () => fetchSugestoes(3),
    staleTime: 0,
    enabled: !!topicosData,
  });

  const suggestions: SuggestionItem[] = useMemo(
    () => (sugestoesData?.sugestoes ?? []).map(apiToSuggestion),
    [sugestoesData],
  );

  // ── Mutation: registrar nova sessão de estudos ────────────────────────────
  const mutation = useMutation({
    mutationFn: atualizarTopico,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topicos"] });
      queryClient.invalidateQueries({ queryKey: ["sugestoes"] });
    },
  });

  // ── Mutation: editar total absoluto de um tópico ──────────────────────────
  const editMutation = useMutation({
    mutationFn: editarTopico,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topicos"] });
      queryClient.invalidateQueries({ queryKey: ["sugestoes"] });
    },
  });

  const totals = useMemo(() => {
    let answered = 0;
    let correct = 0;
    let reviewed = 0;
    for (const s of subjects) {
      for (const t of s.topics) {
        answered += t.answered;
        correct += t.correct;
        if (t.answered > 0) reviewed++;
      }
    }
    const acc = answered ? (correct / answered) * 100 : 0;
    const progress = subjects.length
      ? subjects.reduce((sum, s) => sum + subjectProgress(s), 0) / subjects.length
      : 0;
    return { answered, correct, reviewed, acc, progress };
  }, [subjects]);

  const openUpdate = (subjectKey: string, topic: Topic) => {
    setEditing({ subjectKey, topic });
    setOpen(true);
  };

  const handleSave = (novasRespondidas: number, novasAcertadas: number) => {
    if (!editing) return;
    mutation.mutate({
      id_topico:        editing.topic.id,
      novas_respondidas: novasRespondidas,
      novas_acertadas:   novasAcertadas,
    });
  };

  const handleEdit = (totalRespondidas: number, totalAcertadas: number) => {
    if (!editing) return;
    editMutation.mutate({
      id_topico:         editing.topic.id,
      total_respondidas: totalRespondidas,
      total_acertadas:   totalAcertadas,
    });
  };

  const overallOk = totals.acc >= TARGET;
  const progressOk = totals.progress >= TARGET;

  if (loadingTopicos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Carregando dados do edital…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <header className="border-b border-border bg-card/40 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-md bg-primary/15 border border-primary/40 flex items-center justify-center shadow-[0_0_24px_-6px_oklch(0.58_0.22_27/0.7)]">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                Painel de Controle PCPR
              </h1>
              <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">
                Rumo aos 80% — Operação Aprovação
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/15 text-primary border border-primary/40 uppercase tracking-wider font-mono text-[10px]">
              <Crosshair className="h-3 w-3 mr-1" /> Tático • Ao Vivo
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* QUICK STATS */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<ListChecks className="h-4 w-4" />}
            label="Tópicos Revisados"
            value={`${totals.reviewed}`}
            sub={`de ${subjects.reduce((a, s) => a + s.topics.length, 0)} no edital`}
          />
          <StatCard
            icon={<Activity className="h-4 w-4" />}
            label="Questões Respondidas"
            value={`${totals.answered}`}
            sub={`${totals.correct} acertos`}
          />
          <StatCard
            icon={<Target className="h-4 w-4" />}
            label="Acurácia Geral"
            value={`${totals.acc.toFixed(1)}%`}
            sub={overallOk ? "Meta atingida" : `Faltam ${(TARGET - totals.acc).toFixed(1)}p.p.`}
            valueClass={overallOk ? "text-success" : "text-danger"}
          />
          <div className="rounded-lg border border-border bg-card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground text-xs uppercase tracking-wider">
              <span>Progresso para 80%</span>
              <Flame className="h-4 w-4" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-end justify-between">
                <span className={`text-2xl font-semibold ${progressOk ? "text-success" : "text-danger"}`}>
                  {totals.progress.toFixed(0)}%
                </span>
                <span className="text-xs text-muted-foreground">Meta {TARGET}%</span>
              </div>
              <AccuracyBar value={totals.progress} size="lg" />
            </div>
          </div>
        </section>

        {/* SMART SUGGESTIONS */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold tracking-tight">
                Sugestão Inteligente do Dia
              </h2>
            </div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hidden sm:block">
              Interleaving • Priorização de lacunas
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestions.map((s, i) => {
              const acc = accuracy(s.topic);
              const notStarted = s.topic.answered === 0;
              return (
                <div
                  key={s.topic.id}
                  className="group relative rounded-lg border border-border bg-card p-5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_oklch(0.58_0.22_27/0.4)]"
                >
                  <div className="absolute top-3 right-3 font-mono text-[10px] text-muted-foreground">
                    PRIO #{i + 1}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-primary mb-2">
                    {s.subjectName}
                  </div>
                  <h3 className="text-base font-semibold leading-snug mb-3 pr-12">
                    {s.topic.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    {statusBadge(acc, s.topic.answered)}
                    <span className="text-xs text-muted-foreground font-mono">
                      {s.topic.correct}/{s.topic.answered || 0}
                    </span>
                  </div>
                  <AccuracyBar value={notStarted ? 0 : acc} />
                  <Button
                    onClick={() => openUpdate(s.subjectKey, s.topic)}
                    className="w-full mt-4 bg-primary hover:bg-primary/90 group/btn"
                  >
                    Responder Questões
                    <ArrowUpRight className="h-4 w-4 ml-1 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        </section>

        {/* SUBJECT METRICS */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold tracking-tight">
              Métricas por Disciplina
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((s) => {
              const st = subjectStats(s);
              const prog = subjectProgress(s);
              const topicsOnTarget = s.topics.filter(
                (t) => t.answered > 0 && (t.correct / t.answered) * 100 >= TARGET
              ).length;
              const ok = prog >= TARGET;
              const color = st.startedTopics === 0
                ? "text-muted-foreground"
                : ok
                  ? "text-success"
                  : "text-danger";
              return (
                <div
                  key={s.key}
                  className="rounded-lg border border-border bg-card p-5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-semibold leading-tight">{s.name}</h3>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
                        {topicsOnTarget}/{st.totalTopics} tópicos na meta
                      </p>
                    </div>
                    {statusBadge(prog, st.startedTopics)}
                  </div>
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Progresso
                      </div>
                      <div className={`text-2xl font-semibold ${color}`}>
                        {prog.toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Acurácia média
                      </div>
                      <div className="font-mono text-sm">
                        {st.answered ? `${st.acc.toFixed(0)}%` : "—"}
                      </div>
                    </div>
                  </div>
                  <AccuracyBar value={prog} />
                </div>
              );
            })}
          </div>
        </section>

        {/* FULL EDITAL QUEUE */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="h-5 w-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold tracking-tight">
              Fila de Tópicos — Edital Completo (127)
            </h2>
          </div>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Accordion type="multiple" className="divide-y divide-border">
              {subjects.map((s) => {
                const st = subjectStats(s);
                const prog = subjectProgress(s);
                return (
                  <AccordionItem
                    key={s.key}
                    value={s.key}
                    className="border-0 px-4 sm:px-6"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center justify-between w-full pr-4 gap-3">
                        <div className="flex items-center gap-3 text-left">
                          <span className="font-semibold">{s.name}</span>
                          <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
                            {st.startedTopics}/{st.totalTopics}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-mono text-sm ${statusColor(prog, st.startedTopics)}`}
                          >
                            {prog.toFixed(0)}%
                          </span>
                          <div className="w-24 hidden sm:block">
                            <AccuracyBar value={prog} size="sm" />
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="divide-y divide-border/60 rounded-md border border-border/60 bg-background/40 overflow-hidden">
                        {s.topics.map((t) => {
                          const acc = accuracy(t);
                          return (
                            <div
                              key={t.id}
                              className="flex items-center gap-3 px-3 sm:px-4 py-3 hover:bg-secondary/40 transition-colors"
                            >
                              <span className="font-mono text-[11px] text-muted-foreground w-10 shrink-0">
                                #{String(t.id).padStart(3, "0")}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm truncate">{t.name}</div>
                                <div className="text-[11px] text-muted-foreground font-mono">
                                  {t.answered ? `${t.correct}/${t.answered} acertos` : "Não iniciado"}
                                </div>
                              </div>
                              <div className="hidden sm:block w-28">
                                <AccuracyBar value={acc} size="sm" />
                              </div>
                              <div className="shrink-0">{statusBadge(acc, t.answered)}</div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openUpdate(s.key, t)}
                                className="border-border hover:border-primary/60 hover:text-primary"
                              >
                                Atualizar
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </section>

        <footer className="pt-4 pb-8 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Painel Tático • PCPR • Foco • Disciplina • Aprovação
        </footer>
      </main>

      <UpdateTopicDialog
        topic={editing?.topic ?? null}
        subjectName={subjects.find((s) => s.key === editing?.subjectKey)?.name}
        open={open}
        onOpenChange={setOpen}
        onSave={handleSave}
        onEdit={handleEdit}
        saving={mutation.isPending || editMutation.isPending}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between text-muted-foreground text-xs uppercase tracking-wider">
        <span>{label}</span>
        <span className="text-primary">{icon}</span>
      </div>
      <div className={`mt-2 text-2xl font-semibold ${valueClass ?? ""}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}
