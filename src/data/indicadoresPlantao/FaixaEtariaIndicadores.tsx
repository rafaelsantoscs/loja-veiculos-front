import { FaChild, FaUser, FaUserClock } from "react-icons/fa";
import { IndicadorItem, Turno, FaixaEtariaData } from "@/types/types";

export const gerarIndicadoresFaixaEtaria = (
  faixaEtaria: FaixaEtariaData,
  turno: Turno
): IndicadorItem[] => {
  const isDiurno = turno === "diurno";
  const cor = isDiurno ? "text-yellow-500" : "text-blue-500";

  return [
    {
      label: "Menor de 01 ano",
      diurno: faixaEtaria.menorDeUmAnoDiurno,
      noturno: faixaEtaria.menorDeUmAnoNoturno,
      icon: <FaChild className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "01-09 anos",
      diurno: faixaEtaria.deUmANoveDiurno,
      noturno: faixaEtaria.deUmANoveNoturno,
      icon: <FaChild className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "10-19 anos",
      diurno: faixaEtaria.deDezDezenoveDiurno,
      noturno: faixaEtaria.deDezDezenoveNoturno,
      icon: <FaUser className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "20-39 anos",
      diurno: faixaEtaria.deVinteTrintaNoveDiurno,
      noturno: faixaEtaria.deVinteTrintaNoveNoturno,
      icon: <FaUser className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "40-59 anos",
      diurno: faixaEtaria.deQuarentaCinquentaNoveDiurno,
      noturno: faixaEtaria.deQuarentaCinquentaNoveNoturno,
      icon: <FaUserClock className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Acima de 60 anos",
      diurno: faixaEtaria.deSessentaOuMaisDiurno,
      noturno: faixaEtaria.deSessentaOuMaisNoturno,
      icon: <FaUserClock className={`w-6 h-6 ${cor}`} />,
    },
    {
      label: "Não informado",
      diurno: faixaEtaria.naoInformadoDiurno,
      noturno: faixaEtaria.naoInformadoNoturno,
      icon: <FaUser className={`w-6 h-6 ${cor}`} />,
    },
  ];
};
