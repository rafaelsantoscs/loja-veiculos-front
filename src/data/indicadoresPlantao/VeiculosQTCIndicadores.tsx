import { FaAmbulance, FaMotorcycle } from "react-icons/fa";
import { IndicadorItem, QtcData, Turno } from "@/types/types";

export const gerarIndicadoresVeiculosQtc = (
  qtc: QtcData,
  turno: Turno
): IndicadorItem[] => {
  const isDiurno = turno === "diurno";
  const cor = isDiurno ? "text-yellow-500" : "text-blue-500";

  return [
    {
      label: "USA",
      diurno: qtc.usa.diurno,
      noturno: qtc.usa.noturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "USB 1",
      diurno: qtc.usb1.diurno,
      noturno: qtc.usb1.noturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "USB 2",
      diurno: qtc.usb2.diurno,
      noturno: qtc.usb2.noturno,
      icon: <FaAmbulance className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Motolância",
      diurno: qtc.motolancia.diurno,
      noturno: qtc.motolancia.noturno,
      icon: <FaMotorcycle className={`w-6 h-6 ${cor}`} />,
    },
  ];
};
