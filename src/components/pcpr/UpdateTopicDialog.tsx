import { useEffect, useState } from "react";
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
  onSave: (answered: number, correct: number) => void;
};

export function UpdateTopicDialog({ topic, subjectName, open, onOpenChange, onSave }: Props) {
  const [answered, setAnswered] = useState("0");
  const [correct, setCorrect] = useState("0");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (topic) {
      setAnswered(String(topic.answered));
      setCorrect(String(topic.correct));
      setError(null);
    }
  }, [topic, open]);

  const submit = () => {
    const a = parseInt(answered || "0", 10);
    const c = parseInt(correct || "0", 10);
    if (isNaN(a) || isNaN(c) || a < 0 || c < 0) {
      setError("Use apenas números positivos.");
      return;
    }
    if (c > a) {
      setError("Acertos não podem ser maiores que respondidas.");
      return;
    }
    onSave(a, c);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_oklch(0.58_0.22_27)]" />
            Atualizar Tópico
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {subjectName} — {topic?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="answered">Questões Respondidas</Label>
            <Input
              id="answered"
              inputMode="numeric"
              value={answered}
              onChange={(e) => setAnswered(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="correct">Questões Acertadas</Label>
            <Input
              id="correct"
              inputMode="numeric"
              value={correct}
              onChange={(e) => setCorrect(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} className="bg-primary hover:bg-primary/90">
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
