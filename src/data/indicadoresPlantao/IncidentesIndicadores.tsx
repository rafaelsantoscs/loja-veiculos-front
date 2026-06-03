import { FaAmbulance } from "react-icons/fa";
import { IndicadorItem, IncidenteData, Turno } from "@/types/types";

export const gerarIndicadoresIncidentes = (
  incidente: IncidenteData,
  turno: Turno
): IndicadorItem[] => {
  const isDiurno = turno === "diurno";
  const cor = isDiurno ? "text-yellow-500" : "text-blue-500";

  return [
    {
      label: "Atendimento no Local",
      diurno: incidente.atendimentoNoLocalDiurno,
      noturno: incidente.atendimentoNoLocalNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Nenhum",
      diurno: incidente.nenhumDiurno,
      noturno: incidente.nenhumNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Óbito",
      diurno: incidente.obitoDiurno,
      noturno: incidente.obitoNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Recusa",
      diurno: incidente.recusaDiurno,
      noturno: incidente.recusaNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Removido por Curiosos",
      diurno: incidente.removidoPorCuriososDiurno,
      noturno: incidente.removidoPorCuriososNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Removido por CB",
      diurno: incidente.removidoPorCBDiurno,
      noturno: incidente.removidoPorCBNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "QTA",
      diurno: incidente.qtaDiurno,
      noturno: incidente.qtaNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
  ];
};
