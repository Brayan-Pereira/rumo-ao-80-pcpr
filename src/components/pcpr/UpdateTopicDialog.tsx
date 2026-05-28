import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Topic } from "@/lib/pcpr-data";

type Props = {
  topic: Topic | null;
  subjectName?: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Recebe novas_respondidas e novas_acertadas desta sessão (delta, não total) */
  onSave: (novasRespondidas: number, novasAcertadas: number) => void;
  /** Recebe total_respondidas e total_acertadas absolutos */
  onEdit: (totalRespondidas: number, totalAcertadas: number) => void;
  saving?: boolean;
};

export function UpdateTopicDialog({ topic, subjectName, open, onOpenChange, onSave, onEdit, saving }: Props) {
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [novasRespondidas, setNovasRespondidas] = useState("0");
  const [novasAcertadas, setNovasAcertadas] = useState("0");
  const [totalRespondidas, setTotalRespondidas] = useState("0");
  const [totalAcertadas, setTotalAcertadas] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const handleOpen = (v: boolean) => {
    if (v) {
      setMode("add");
      setNovasRespondidas("0");
      setNovasAcertadas("0");
      setTotalRespondidas(String(topic?.answered ?? 0));
      setTotalAcertadas(String(topic?.correct ?? 0));
      setError(null);
    }
    onOpenChange(v);
  };

  const switchMode = (m: "add" | "edit") => {
    setMode(m);
    setError(null);
    if (m === "edit") {
      setTotalRespondidas(String(topic?.answered ?? 0));
      setTotalAcertadas(String(topic?.correct ?? 0));
    } else {
      setNovasRespondidas("0");
      setNovasAcertadas("0");
    }
  };

  const submit = () => {
    if (mode === "add") {
      const r = parseInt(novasRespondidas || "0", 10);
      const a = parseInt(novasAcertadas   || "0", 10);
      if (isNaN(r) || isNaN(a) || r < 0 || a < 0) {
        setError("Use apenas números positivos.");
        return;
      }
      if (a > r) {
        setError("Acertos não podem ser maiores que respondidas.");
        return;
      }
      onSave(r, a);
    } else {
      const r = parseInt(totalRespondidas || "0", 10);
      const a = parseInt(totalAcertadas   || "0", 10);
      if (isNaN(r) || isNaN(a) || r < 0 || a < 0) {
        setError("Use apenas números positivos.");
        return;
      }
      if (a > r) {
        setError("Acertos não podem ser maiores que respondidas.");
        return;
      }
      onEdit(r, a);
    }
    onOpenChange(false);
  };

  const acc = topic && topic.answered > 0
    ? ((topic.correct / topic.answered) * 100).toFixed(1)
    : null;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_oklch(0.58_0.22_27)]" />
            {mode === "add" ? "Registrar Sessão de Estudos" : "Editar Total do Tópico"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {subjectName} — {topic?.name}
          </DialogDescription>
        </DialogHeader>

        {/* Toggle de modo */}
        <div className="flex rounded-md border border-border overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => switchMode("add")}
            className={`flex-1 py-1.5 transition-colors ${mode === "add" ? "bg-primary text-primary-foreground font-medium" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
          >
            Registrar Sessão
          </button>
          <button
            type="button"
            onClick={() => switchMode("edit")}
            className={`flex-1 py-1.5 transition-colors ${mode === "edit" ? "bg-primary text-primary-foreground font-medium" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
          >
            Editar Total
          </button>
        </div>

        {/* Progresso atual (referência) */}
        {topic && (
          <div className="rounded-md bg-secondary/50 border border-border px-4 py-3 text-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Progresso atual
            </p>
            <p className="font-mono">
              {topic.correct}/{topic.answered} questões
              {acc !== null && (
                <span className={`ml-2 font-semibold ${parseFloat(acc) >= 80 ? "text-success" : "text-danger"}`}>
                  ({acc}%)
                </span>
              )}
              {topic.answered === 0 && (
                <span className="ml-2 text-muted-foreground">Não iniciado</span>
              )}
            </p>
          </div>
        )}

        {mode === "add" ? (
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="novas-respondidas">Questões respondidas hoje</Label>
              <Input
                id="novas-respondidas"
                inputMode="numeric"
                value={novasRespondidas}
                onChange={(e) => { setNovasRespondidas(e.target.value); setError(null); }}
                className="bg-secondary border-border"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="novas-acertadas">Acertos desta sessão</Label>
              <Input
                id="novas-acertadas"
                inputMode="numeric"
                value={novasAcertadas}
                onChange={(e) => { setNovasAcertadas(e.target.value); setError(null); }}
                className="bg-secondary border-border"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="total-respondidas">Total respondidas</Label>
              <Input
                id="total-respondidas"
                inputMode="numeric"
                value={totalRespondidas}
                onChange={(e) => { setTotalRespondidas(e.target.value); setError(null); }}
                className="bg-secondary border-border"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total-acertadas">Total de acertos</Label>
              <Input
                id="total-acertadas"
                inputMode="numeric"
                value={totalAcertadas}
                onChange={(e) => { setTotalAcertadas(e.target.value); setError(null); }}
                className="bg-secondary border-border"
              />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={submit} className="bg-primary hover:bg-primary/90" disabled={saving}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

