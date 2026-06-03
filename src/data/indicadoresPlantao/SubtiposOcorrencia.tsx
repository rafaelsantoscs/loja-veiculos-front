import { SubtipoData, Turno, IndicadorItem } from "@/types/types";
import { FaAmbulance } from "react-icons/fa";

export const gerarIndicadoresSubtipoOcorrencia = (
  subtipo: SubtipoData,
  turno: Turno
): IndicadorItem[] => {
  const isDiurno = turno === "diurno";
  const cor = isDiurno ? "text-yellow-500" : "text-blue-500";

  return [
    {
      label: "Acidente de Trânsito",
      diurno: subtipo.acidenteDeTransitoDiurno,
      noturno: subtipo.acidenteDeTransitoNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Vítima de Violência",
      diurno: subtipo.vitimasDeViolenciaDiurno,
      noturno: subtipo.vitimasDeViolenciaNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Outros Acidentes",
      diurno: subtipo.outrosAcidentesDiurno,
      noturno: subtipo.outrosAcidentesNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Psiquiátrico",
      diurno: subtipo.psiquiatricoDiurno,
      noturno: subtipo.psiquiatricoNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Obstétrico",
      diurno: subtipo.obstetricoDiurno,
      noturno: subtipo.obstetricoNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Outros Clínico",
      diurno: subtipo.outrosDiurno,
      noturno: subtipo.outrosNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
  ];
};
