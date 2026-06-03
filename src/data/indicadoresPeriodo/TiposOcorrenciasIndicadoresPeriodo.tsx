import { FaAmbulance, FaBriefcaseMedical, FaProcedures } from "react-icons/fa";
import { IndicadorItem, TipoOcorrenciaData, Turno } from "@/types/types";

export const gerarIndicadoresTipoOcorrencia = (
  tipo: TipoOcorrenciaData,
  turno: Turno
): IndicadorItem[] => {
  const isDiurno = turno === "diurno";
  const cor = isDiurno ? "text-yellow-500" : "text-blue-500";

  return [
    {
      label: "Trauma",
      diurno: tipo.TRAUMADiurno,
      noturno: tipo.TRAUMANoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Clínico",
      diurno: tipo.CLINICODiurno,
      noturno: tipo.CLINICONoturno,
      icon: <FaBriefcaseMedical className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Remoções",
      diurno: tipo.REMOCAODiurno,
      noturno: tipo.REMOCAONoturno,
      icon: <FaProcedures className={`w-6 h-6 ${cor}`} />,
    },
  ];
};
