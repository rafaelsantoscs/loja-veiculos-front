import { FaAmbulance } from "react-icons/fa";
import { BsPeopleFill } from "react-icons/bs";
import { IndicadorItem, LocalOcorrenciaData, Turno } from "@/types/types";

export const gerarIndicadoresLocais = (
  local: LocalOcorrenciaData,
  turno: Turno
): IndicadorItem[] => {
  const isDiurno = turno === "diurno";
  const cor = isDiurno ? "text-yellow-500" : "text-blue-500";

  return [
    {
      label: "Via Pública",
      diurno: local.viaPublicaDiurno,
      noturno: local.viaPublicaNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Domicílio",
      diurno: local.domicilioDiurno,
      noturno: local.domicilioNoturno,
      icon: <BsPeopleFill className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Unidade Hospitalar",
      diurno: local.unidadeHospitalarDiurno,
      noturno: local.unidadeHospitalarNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Local de Trabalho",
      diurno: local.localDeTrabalhoDiurno,
      noturno: local.localDeTrabalhoNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Unidade de Saúde",
      diurno: local.unidadeDeSaudeDiurno,
      noturno: local.unidadeDeSaudeNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Outros",
      diurno: local.outrosDiurno,
      noturno: local.outrosNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
  ];
};
