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
  saving?: boolean;
};

export function UpdateTopicDialog({ topic, subjectName, open, onOpenChange, onSave, saving }: Props) {
  const [novasRespondidas, setNovasRespondidas] = useState("0");
  const [novasAcertadas, setNovasAcertadas] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const handleOpen = (v: boolean) => {
    if (v) {
      // Reseta os campos ao abrir
      setNovasRespondidas("0");
      setNovasAcertadas("0");
      setError(null);
    }
    onOpenChange(v);
  };

  const submit = () => {
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
            Registrar Sessão de Estudos
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {subjectName} — {topic?.name}
          </DialogDescription>
        </DialogHeader>

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

