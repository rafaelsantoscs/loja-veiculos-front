import Link from "next/link";
import React from "react";
import { Container } from "@/components/InitialScreen/Container";
import { AiFillInstagram } from "react-icons/ai";
import Image from "next/image";

export function Footer() {
  const texto = "Prefeitura Da Vitória";
  const texto2 = "de Santo Antão";
  const cores = [
    "text-indigo-600", // P
    "text-blue-500",   // r
    "text-orange-600",   // e
    "text-yellow-500",   // f
    "text-blue-500",   // e
    "text-rose-500",   // i
    "text-indigo-600", // t
    "text-blue-500", // u
    "text-orange-600",  // r
    "text-yellow-500",    // a
    "text-indigo-600", // d
    "text-blue-500",   // a
    "text-indigo-600", // v
    "text-blue-500",   // i
    "text-orange-600",   // t
    "text-yellow-500",   // o
    "text-blue-500",   // r
    "text-rose-700",   // i
    "text-indigo-600", // a
  ];
  const cores2 = [
    "text-indigo-600", // d
    "text-blue-500",   // e
    "text-orange-600",   // s
    "text-yellow-500",   // a
    "text-blue-500",   // n
    "text-rose-700",   // t
    "text-indigo-600", // o
    "text-blue-500", // a
    "text-orange-600",  //n
    "text-yellow-500",    // t
    "text-indigo-600", // a
    "text-blue-500", //o
  ];
  return (
    <div className="relative 
    bg-white dark:bg-[#2d3142] 
        bg-cover bg-center 
        bg-[url('/images/colaboradores/samu-light.jpg')] 
        dark:bg-[url('/images/colaboradores/samu-dark.jpg')]
    ">
      <Container>
        {/* Navegação superior */}
        <div className="grid max-w-screen-xl grid-cols-1 gap-10 pt-10 mx-auto mt-5 border-t border-camutanga-azul/30 dark:border-camutanga-azul/40 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="mt-5">
              <a
                href="https://vercel.com/?utm_source=web3templates&utm_campaign=oss"
                target="_blank"
                rel="noopener"
                className="relative block w-44"
              >
                {/* Você pode adicionar uma logo aqui se quiser */}
              </a>
            </div>
          </div>

          <div className="flex flex-wrap w-full gap-4 mt-4 justify-center sm:justify-start">
                  {/* Link Privacidade */}
                  <div className="w-full sm:w-auto">
                    <Link
                      href="/privacy"
                      className="block py-2 px-4 text-slate-500 rounded-md dark:text-slate-300 hover:text-samu-vermelho focus:text-samu-vermelho focus:bg-samu-vermelho/10 focus:outline-none dark:focus:bg-samu-vermelho/10"
                    >
                      Privacidade
                    </Link>
                  </div>

                  {/* Link Termos */}
                  <div className="w-full sm:w-auto">
                    <Link
                      href="/termos"
                      className="block py-2 px-4 text-slate-500 rounded-md dark:text-slate-300 hover:text-samu-vermelho focus:text-samu-vermelho focus:bg-samu-vermelho/10 focus:outline-none dark:focus:bg-samu-vermelho/10"
                    >
                      Termos
                    </Link>
                  </div>
                </div>

        </div>

        {/* Bloco inferior: Empresa + Gestão */}
        <div className="container mx-auto   py-8 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full mt-10">
            {/* Empresa */}
            <div className="text-center md:text-left">
              <div translate="no" className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Image
                  src="/images/logo/logo-iam.jpg"
                  alt="Logo da IAM Tecnologia"
                  width={60}
                  height={60}
                  className="rounded-md pl-4 md:pl-6"
                />
                <h2 className="text-xl font-semibold text-samu-azul dark:text-white">
                  IAMTEC
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-2 pl-4 md:pl-6">
              Inovação em soluções tecnológicas para o seu dia a dia.
              </p>
               
              <a
                href="https://www.instagram.com/iam.tec.sistemas/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-samu-azul dark:text-pink-700 hover:underline pl-4 md:pl-6"
              >
                <AiFillInstagram className="text-xl" />
                <span>@iam.tec.sistemas</span>
              </a>
            </div>

            <div className="text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                  {/* Imagem à esquerda */}
                  <div className="shrink-0 mt-3">
                    <Image
                      src="/images/logo/logo-VSA.png"
                      alt="Logo da Prefeitura"
                      width={80}
                      height={80}
                      className="rounded-md "
                    />
                  </div>

                  {/* Textos à direita da imagem */}
                 
                  <div translate="no" className="flex flex-col justify-center mt-4">
                  
                    <h2 className="text-xl font-semibold dark:text-white">
                    {texto.split("").map((letra, index) => (
                      <span key={index} className={cores[index % cores.length]}>
                        {letra}
                      </span>
                    ))}
                  </h2>
                  <h2 className="text-xl font-semibold dark:text-white">
                    {texto2.split("").map((letra, index) => (
                      <span key={index} className={cores2[index % cores2.length]}>
                        {letra}
                      </span>
                    ))}
                  </h2>

                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                      Vitória demonstra teu valor.
                    </p>
                    <a
                      href="https://www.instagram.com/prefeituradavitoriaoficial/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-samu-azul dark:text-pink-700 hover:underline mt-1"
                    >
                      <AiFillInstagram className="text-xl" />
                      <span>@prefeituradavitoriaoficial</span>
                    </a>
                  </div>
                </div>



            </div>

            {/* Separador */}
            {/* <div className="hidden md:flex items-center justify-center br-o">
              <div className="h-full w-[2px] bg-slate-400 dark:bg-slate-600"></div>
            </div> */}

            {/* Gestão */}
            <div className=" text-center ">
              <h3 className="text-lg font-semibold text-samu-azul dark:text-white mb-4">
                Gestão
              </h3>
              {/* <div className="flex justify-center gap-8 flex-wrap"> */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                {[
                {
                  id: 9,
                  nome: "Paulo Roberto",
                  funcao: "Prefeito",
                  instagram: "https://www.instagram.com/paulorobertoproficial/",
                },
                {
                  id: 8,
                  nome: "Alex Vasconcelos",
                  funcao: "Secretário de Saúde",
                   instagram: "https://www.instagram.com/alexvasconcelos15/",
                },
                // {
                //     id: 6,
                //     nome: "Nome coordenador",
                //     funcao: "Coordenador 1",
                //     // instagram: "https://www.instagram.com/vitorvercoza/",
                //   },
                //   {
                //     id: 7,
                //     nome: "Nome coordenador 2",
                //     funcao: "Coordenador 2",
                //     // instagram: "https://www.instagram.com/marconesantos192/",
                //   },
                //   {
                //     id:2,
                //     nome: "Nome Coordenador 3",
                //     funcao: "Coordenador 3",
                //     // instagram: "https://www.instagram.com/marconesantos192/",
                //   }
                  
                
                ].map((pessoa) => (
                  <div key={pessoa.id} className="text-center">
                    <a
                      href={pessoa.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 hover:scale-105 transition-transform duration-200"
                    >
                      <Image
                        src={`/images/profile/profile${pessoa.id}.jpg?v=2`}
                        alt={`Perfil de ${pessoa.nome}`}
                        width={96}
                        height={96}
                        className="object-cover object-top w-full h-full"
                      />
                    </a>
                    <div className="flex items-center justify-center gap-2 text-samu-azul dark:text-white">
                      <span className="text-xs font-medium">{pessoa.nome}</span>
                      <a href={pessoa.instagram} target="_blank" rel="noopener noreferrer">
                        <AiFillInstagram className="text-xs font-medium text-samu-azul dark:text-pink-700" />
                      </a>
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {pessoa.funcao}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>
          <div className="w-full h-[1px] bg-samu-vermelho dark:bg-samu-branco opacity-70 my-4" />
          <div className="text-center text-sm text-slate-600 dark:text-slate-300 mb-6">
  © {new Date().getFullYear()} IAM Tecnologia. Todos os direitos reservados.
</div>
{/* inicio desenvolvedores  */}
<div className="flex flex-row justify-center gap-2 flex-wrap">
  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
    Desenvolvedores:
  </span>
  {[
    {
      id: 1,
      nome: "Isaac Martiniano",
      // funcao: "Desenvolvedor",
      instagram: "https://www.instagram.com/isaac.martiniano/",
    },
    {
      id: 2,
      nome: "Adriano Thomaz",
      // funcao: "Desenvolvedor",
      instagram: "https://www.instagram.com/adrianok7s/",
    },
  ].map((pessoa) => (
    <div key={pessoa.id} className="text-center">
      <div className="flex items-center justify-center gap-2 text-samu-azul dark:text-[#E1306C]">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{pessoa.nome}</span>
                      <a href={pessoa.instagram} target="_blank" rel="noopener noreferrer">
                        <AiFillInstagram className="text-xs font-medium text-samu-azul dark:text-pink-700" />
                      </a>
                    </div>
     
    </div>
  ))}
</div>
{/* fim desenvolvedores  */}
        </div>
      </Container>
    </div>
  );
}
