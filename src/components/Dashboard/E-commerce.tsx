"use client";
import React from "react";
import { getUserLocalStorage } from "@/store/userLocalStorage";
import GrupoDeServicosCard from "../GrupoDeServicosCard/GrupoDeServicosCard";

const ECommerce: React.FC = () => {
  const user = getUserLocalStorage() || {};
  const { roles = [] } = user;
  
  const gruposDeServicos = [
     
    {
      titulo: "USUARIOS SISTEMA",
      bgColor: "bg-indigo-600 dark:bg-indigo-800",
      backgroundImage: "/images/cards/users.png",
      rolesPermitidos: ["ROLE_ADMIN"],
      acoes: [
        { label: "Área Usuários", route: "/administrador/geral/usuarios-sistema" },
      ],
    },
    {
      titulo: "DADOS CADASTRAIS",
      bgColor: "bg-teal-600 dark:bg-teal-800",
      backgroundImage: "/images/cards/company.png",
      rolesPermitidos: ["ROLE_USUARIO", "ROLE_ADMIN"],
      acoes: [
        { label: "Dados Empresa", route: "/formularios/dados-da-empresa" },
        { label: "Dados Resp. Legal", route: "/formularios/responsavel-legal" },
        { label: "Dados Resp. Técnico", route: "/formularios/responsavel-tecnico" },
        { label: "Definir porte da empresa", route: "/formularios/definicao-porte" },
        { label: "Ver Todos os Dados", route: "/formularios/ver-todos-os-dados" },
      ],
    },
    {
      titulo: "APROVAÇÃO",
      bgColor: "bg-green-600 dark:bg-green-800",
      backgroundImage: "/images/cards/approval.png",
      rolesPermitidos: ["ROLE_USUARIO", "ROLE_ADMIN"],
      acoes: [
        { label: "Dados Resp. Técnico", route: "/formularios/dados-pendentes-responsavel-tecnico" },
        { label: "Dar Baixa Resp. Técnico", route: "/formularios/dar-baixa-responsavel-tecnico" },
        { label: "Rascunho", route: "/formularios/rascunho" },
        { label: "Termo & Resp. Técnica", route: "/formularios/termo-de-compromisso-e-responsabilidade-tecnica" },
        { label: "Baixa de Resp. Técnica", route: "/formularios/requerimento-baixa" },
      ],
    },
    {
      titulo: "ESTABELECIMENTO",
      bgColor: "bg-yellow-600 dark:bg-yellow-800",
      backgroundImage: "/images/cards/store.png",
      rolesPermitidos: ["ROLE_USUARIO", "ROLE_ADMIN"],
      acoes: [
        { label: "Definição de Porte", route: "/formularios/definicao-porte-estabelecimento" },
        { label: "Serviço de Pequeno Porte", route: "/formularios/servico-pequeno-porte" },
      ],
    },
    {
      titulo: "DENUNCIAS",
      bgColor: "bg-red-600 dark:bg-red-800",
      backgroundImage: "/images/cards/equipe.PNG",
      rolesPermitidos: ["ROLE_ADMIN", "ROLE_MOTORISTA", "ROLE_ASSISTENTE", "ROLE_ADMINISTRADOR"],
      acoes: [
        { label: "Criar", route: "/formularios/denuncia" },
        { label: "Consultar", route: "/formularios/denuncia/buscar-protocolo" },
      ],
    },
    {
      titulo: "SISTEMA DE NOTÍCIAS",
      bgColor: "bg-blue-600 dark:bg-blue-800",
      backgroundImage: "/images/cards/news.PNG",
      rolesPermitidos: ["ROLE_ADMIN", "ROLE_ADMINISTRADOR"],
      acoes: [
        { label: "Gerenciar Postagens", route: "/admin/postagens" },
        { label: "Criar Nova Postagem", route: "/admin/postagens/nova" },
        { label: "Estatísticas", route: "/admin/postagens/stats" },
        { label: "Ver Site Público", route: "/noticias" },
       
      ],
    },
  ];
  return (
    <>
      {roles.length > 0 && (
        (() => {
          const gruposFiltrados = gruposDeServicos.filter(
            (grupo: typeof gruposDeServicos[0]) =>
              !grupo.rolesPermitidos || grupo.rolesPermitidos.some((role: string) => roles.includes(role))
          );

          return gruposFiltrados.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6 dark:text-samu-laranja md:grid-cols-2 xl:grid-cols-3 2xl:gap-7.5 mt-10 px-4">
                {gruposFiltrados.map((grupo: typeof gruposDeServicos[0], i: number) => (
                  <GrupoDeServicosCard key={i} {...grupo} />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <p className="text-center text-slate-500 dark:text-slate-400 mt-10">
                Nenhum serviço disponível para o seu perfil.
              </p>
            </div>
          );
        })()
      )}
    </>
  );
};

export default ECommerce;
