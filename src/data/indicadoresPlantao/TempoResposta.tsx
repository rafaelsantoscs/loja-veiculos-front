import { FaClock } from "react-icons/fa";
import { TempoRespostaData, Turno, IndicadorItem } from "@/types/types";

export const gerarIndicadoresTempoResposta = (
  dados: TempoRespostaData,
  turno: Turno
): IndicadorItem[] => {
  const isDiurno = turno === "diurno";

  return [
    {
      label: "Tempo Mínimo",
       diurno: `${dados.tempoRespostaMinimoDiurno ?? 0} min`,
      noturno: `${dados.tempoRespostaMinimoNoturno ?? 0} min`,
      icon: <FaClock className={`w-6 h-6 ${isDiurno ? "text-green-500" : "text-green-300"}`} />,
    },
    {
      label: "Tempo Médio",
      diurno: `${dados.tempoRespostaMedioDiurno ?? 0} min`,
      noturno: `${dados.tempoRespostaMedioNoturno ?? 0} min`,
      icon: <FaClock className={`w-6 h-6 ${isDiurno ? "text-yellow-500" : "text-yellow-300"}`} />,
    },
    {
      label: "Tempo Máximo",
      diurno: `${dados.tempoRespostaMaximoDiurno ?? 0} min`,
      noturno: `${dados.tempoRespostaMaximoNoturno ?? 0} min`,
      icon: <FaClock className={`w-6 h-6 ${isDiurno ? "text-rose-500" : "text-rose-300"}`} />,
    },
  ];
};
