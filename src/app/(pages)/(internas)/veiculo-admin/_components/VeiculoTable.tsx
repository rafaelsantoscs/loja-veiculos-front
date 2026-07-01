"use client";

import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  Fuel,
  Gauge,
  MapPin,
  Palette,
  Settings2,
  Star,
} from "lucide-react";
import type { Ordenacao, OrdenacaoCampo, Veiculo } from "@/types/veiculo";
import { useVeiculoTheme } from "./useVeiculoTheme";
import { cambioLabel, combustivelLabel, formatData, formatKm } from "./veiculo.utils";
import StatusBadge from "./StatusBadge";
import ValorBadge from "./ValorBadge";
import VeiculoActions from "./VeiculoActions";
import VeiculoFotoCell from "./VeiculoFotoCell";

interface VeiculoTableProps {
  veiculos: Veiculo[];
  ordenacao: Ordenacao;
  onOrdenar: (campo: OrdenacaoCampo) => void;
  onVisualizar: (veiculo: Veiculo) => void;
  onEditar: (veiculo: Veiculo) => void;
  onFotos: (veiculo: Veiculo) => void;
  onFinanceiro: (veiculo: Veiculo) => void;
  onDuplicar: (veiculo: Veiculo) => void;
  onExcluir: (veiculo: Veiculo) => void;
}

/** Tabela rica de veículos (linhas densas) com fallback em cards no mobile. */
export default function VeiculoTable({
  veiculos,
  ordenacao,
  onOrdenar,
  onVisualizar,
  onEditar,
  onFotos,
  onFinanceiro,
  onDuplicar,
  onExcluir,
}: VeiculoTableProps) {
  const { isDark, colors } = useVeiculoTheme();

  const SortIcon = ({ campo }: { campo: OrdenacaoCampo }) => {
    if (ordenacao.campo !== campo)
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
    return ordenacao.direcao === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-blue-500" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-blue-500" />
    );
  };

  const headerBtn = (label: string, campo: OrdenacaoCampo) => (
    <button
      onClick={() => onOrdenar(campo)}
      className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-blue-500"
    >
      {label}
      <SortIcon campo={campo} />
    </button>
  );

  const publicacaoTags = (veiculo: Veiculo) => {
    const tags: { label: string; className: string }[] = [];
    const site = isDark
      ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
      : "bg-sky-100 text-sky-700 border-sky-200";
    const destaque = isDark
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : "bg-amber-100 text-amber-700 border-amber-200";
    tags.push({ label: "Site", className: site });
    tags.push({ label: "Home", className: site });
    if (veiculo.destaque) {
      tags.push({ label: "Promoção", className: destaque });
      tags.push({ label: "Destaque", className: destaque });
    }
    return tags;
  };

  const InfoChip = ({
    icon: Icon,
    children,
  }: {
    icon: React.ElementType;
    children: React.ReactNode;
  }) => (
    <span className={`inline-flex items-center gap-1 ${colors.text.secondary}`}>
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  );

  const VeiculoInfo = ({ veiculo }: { veiculo: Veiculo }) => (
    <div className="min-w-0">
      <p className="truncate font-semibold">
        {veiculo.marca} {veiculo.modelo}
        {veiculo.versao ? (
          <span className={`ml-1 font-normal ${colors.text.secondary}`}>{veiculo.versao}</span>
        ) : null}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <InfoChip icon={Calendar}>
          {veiculo.anoFabricacao}/{veiculo.anoModelo}
        </InfoChip>
        {veiculo.placa ? (
          <span className="font-mono font-medium uppercase tracking-wide">{veiculo.placa}</span>
        ) : null}
        {veiculo.cor ? <InfoChip icon={Palette}>{veiculo.cor}</InfoChip> : null}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {veiculo.motor ? <InfoChip icon={Settings2}>{veiculo.motor}</InfoChip> : null}
        {veiculo.combustivel ? (
          <InfoChip icon={Fuel}>{combustivelLabel(veiculo.combustivel as string)}</InfoChip>
        ) : null}
        {veiculo.cambio ? (
          <InfoChip icon={Settings2}>{cambioLabel(veiculo.cambio as string)}</InfoChip>
        ) : null}
        {veiculo.cidade || veiculo.estado ? (
          <InfoChip icon={MapPin}>
            {[veiculo.cidade, veiculo.estado].filter(Boolean).join(" - ")}
          </InfoChip>
        ) : null}
      </div>
    </div>
  );

  const DestaqueCell = ({ veiculo }: { veiculo: Veiculo }) =>
    veiculo.destaque ? (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
          isDark
            ? "border-amber-500/30 bg-amber-500/15 text-amber-400"
            : "border-amber-200 bg-amber-100 text-amber-700"
        }`}
      >
        <Star className="h-3.5 w-3.5 fill-current" />
        Destaque
      </span>
    ) : (
      <span className={colors.text.muted}>—</span>
    );

  const PublicacaoCell = ({ veiculo }: { veiculo: Veiculo }) => (
    <div className="flex max-w-[9rem] flex-wrap gap-1">
      {publicacaoTags(veiculo).map((t) => (
        <span
          key={t.label}
          className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${t.className}`}
        >
          {t.label}
        </span>
      ))}
    </div>
  );

  return (
    <div>
      {/* ===== Tabela (telas grandes) ===== */}
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full border-collapse">
          <thead>
            <tr
              className={`text-left text-sm ${
                isDark ? "text-slate-300" : "text-slate-600"
              } border-b ${isDark ? "border-slate-800/60" : "border-slate-200/70"}`}
            >
              <th className="px-3 py-3 font-medium">Foto</th>
              <th className="px-3 py-3 font-medium">
                <span className="inline-flex items-center gap-3">
                  {headerBtn("Marca", "marca")}
                  {headerBtn("Modelo", "modelo")}
                  {headerBtn("Ano", "anoModelo")}
                </span>
              </th>
              <th className="px-3 py-3 font-medium">{headerBtn("Valor", "valor")}</th>
              <th className="px-3 py-3 font-medium">{headerBtn("KM", "quilometragem")}</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Destaque</th>
              <th className="px-3 py-3 font-medium">Publicação</th>
              <th className="px-3 py-3 font-medium">{headerBtn("Cadastro", "dataCadastro")}</th>
              <th className="px-3 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {veiculos.map((veiculo, idx) => (
              <motion.tr
                key={veiculo.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                className={`border-b transition-colors ${
                  isDark
                    ? "border-slate-800/50 hover:bg-slate-800/30"
                    : "border-slate-100 hover:bg-slate-50/70"
                }`}
              >
                <td className="px-3 py-3 align-middle">
                  <VeiculoFotoCell
                    veiculoId={veiculo.id}
                    fotoPrincipal={veiculo.fotoPrincipal}
                    alt={`${veiculo.marca} ${veiculo.modelo}`}
                  />
                </td>
                <td className="px-3 py-3 align-middle">
                  <VeiculoInfo veiculo={veiculo} />
                </td>
                <td className="px-3 py-3 align-middle">
                  <ValorBadge valor={veiculo.valor} valorFipe={veiculo.valorFipe} />
                </td>
                <td className="px-3 py-3 align-middle">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Gauge className={`h-4 w-4 ${colors.text.secondary}`} />
                    {formatKm(veiculo.quilometragem)}
                  </span>
                </td>
                <td className="px-3 py-3 align-middle">
                  <StatusBadge status={veiculo.status as string} />
                </td>
                <td className="px-3 py-3 align-middle">
                  <DestaqueCell veiculo={veiculo} />
                </td>
                <td className="px-3 py-3 align-middle">
                  <PublicacaoCell veiculo={veiculo} />
                </td>
                <td className={`px-3 py-3 align-middle text-sm ${colors.text.secondary}`}>
                  {formatData(veiculo.dataCadastro)}
                </td>
                <td className="px-3 py-3 align-middle">
                  <div className="flex justify-end">
                    <VeiculoActions
                      veiculo={veiculo}
                      onVisualizar={onVisualizar}
                      onEditar={onEditar}
                      onFotos={onFotos}
                      onFinanceiro={onFinanceiro}
                      onDuplicar={onDuplicar}
                      onExcluir={onExcluir}
                    />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Cards (mobile / tablet) ===== */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:hidden">
        {veiculos.map((veiculo, idx) => (
          <motion.div
            key={veiculo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.03, 0.3) }}
            className={`rounded-2xl border p-4 transition-colors ${
              isDark
                ? "border-slate-800/60 bg-slate-900/40 hover:bg-slate-900/60"
                : "border-slate-200/70 bg-white/70 hover:bg-white"
            }`}
          >
            <div className="flex gap-3">
              <VeiculoFotoCell
                veiculoId={veiculo.id}
                fotoPrincipal={veiculo.fotoPrincipal}
                alt={`${veiculo.marca} ${veiculo.modelo}`}
              />
              <div className="min-w-0 flex-1">
                <VeiculoInfo veiculo={veiculo} />
              </div>
            </div>

            <div className="mt-3 flex items-end justify-between gap-3">
              <ValorBadge valor={veiculo.valor} valorFipe={veiculo.valorFipe} />
              <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                <Gauge className={`h-4 w-4 ${colors.text.secondary}`} />
                {formatKm(veiculo.quilometragem)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={veiculo.status as string} />
              <DestaqueCell veiculo={veiculo} />
            </div>

            <div className="mt-3">
              <PublicacaoCell veiculo={veiculo} />
            </div>

            <div className={`mt-3 flex items-center justify-between border-t pt-3 ${
              isDark ? "border-slate-800/60" : "border-slate-200/70"
            }`}>
              <span className={`text-xs ${colors.text.secondary}`}>
                Cadastro: {formatData(veiculo.dataCadastro)}
              </span>
            </div>

            <div className="mt-2">
              <VeiculoActions
                veiculo={veiculo}
                onVisualizar={onVisualizar}
                onEditar={onEditar}
                onFotos={onFotos}
                onFinanceiro={onFinanceiro}
                onDuplicar={onDuplicar}
                onExcluir={onExcluir}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
