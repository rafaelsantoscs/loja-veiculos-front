import { FaAmbulance } from "react-icons/fa";
import { DestinoData, IndicadorItem, Turno } from "@/types/types";

export const gerarIndicadoresDestino = (
  destino: DestinoData,
  turno: Turno
): IndicadorItem[] => {
  const isDiurno = turno === "diurno";
  const cor = isDiurno ? "text-yellow-500" : "text-blue-500";

  return [
    {
      label: "Hospital João Murilo",
      diurno: destino.hjmoDiurno,
      noturno: destino.hjmoNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Outros",
      diurno: destino.outrosDiurno,
      noturno: destino.outrosNoturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
  ];
};
