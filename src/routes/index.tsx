import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/pcpr/Dashboard";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Painel PCPR — Rumo aos 80%" },
      {
        name: "description",
        content:
          "Painel tático de estudos para o concurso da Polícia Civil do Paraná (PCPR) com priorização inteligente de tópicos.",
      },
    ],
  }),
});
