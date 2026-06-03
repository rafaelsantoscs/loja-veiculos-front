import { IndicadorItem, Turno } from "@/types/types";
import {  FaFemale, FaMale } from "react-icons/fa";

export const gerarIndicadoresSexo = (
  sexo: {
    sexoMasculinoDiurno: number;
    sexoMasculinoNoturno: number;
    sexoFemininoDiurno: number;
    sexoFemininoNoturno: number;
  },
  turno: Turno
): IndicadorItem[] => {
  const cor = turno === "diurno" ? "text-yellow-500" : "text-blue-500";

  return [
    {
      label: "Masculino",
      diurno: sexo.sexoMasculinoDiurno,
      noturno: sexo.sexoMasculinoNoturno,
      icon: <FaMale className={`w-6 h-6 ${cor}`} />,

    },
    {
      label: "Feminino",
      diurno: sexo.sexoFemininoDiurno,
      noturno: sexo.sexoFemininoNoturno,
      icon: <FaFemale className={`w-6 h-6 ${cor}`} />


    },
  ];
};
