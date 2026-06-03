"use client";
import Link from "next/link";
import ThemeChanger from "./DarkSwitch";
import Image from "next/image";
// import { Disclosure, DisclosureButton } from "@headlessui/react";
import { usePathname } from "next/navigation";
import { FaLock } from "react-icons/fa";


export const Navbar = () => {
  const pathname = usePathname();
  //  const navigation = [
  //   // { nome: "Serviçose", link: "/externas/servicos" },
  //  // { nome: "Home", link: "/" },
  //   //{ nome: "Institucional", link: "/institucional" },
  //   //{ nome: "Notícias", link: "/noticias" },
  //   //{ nome: "FAQ", link: "/faq" },
  //   //{ nome: "Privacidade", link: "/privacy" },
  //   //{ nome: "Termos de Uso", link: "/termos" },
  // ];
  return (
    <div className="fixed top-0 left-0 w-full z-50
        bg-[url('/images/colaboradores/samu-light.jpg')] dark:bg-[url('/images/colaboradores/samu-dark.jpg')]
        bg-cover bg-center 
        bg-white dark:bg-[#2d3142]
     ">
      <nav className="container relative flex flex-wrap items-center justify-between p-6 mx-auto lg:justify-between xl:px-1">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/images/logo/logoVISA.png"
            width="52"
            height="52"
            alt="Logo VISA"
            className="rounded-md"
            priority
          />
          <span translate="no" className="text-lg font-bold text-samu-vermelho dark:text-samu-branco uppercase">
            CTIC-VSA
          </span>
        </Link>

        {/* Ações à direita */}
       <div className="flex items-center gap-4 ml-auto lg:ml-0">
         {/* <ul className="items-center justify-center flex-1 pt-6 list-none lg:pt-0 lg:flex"> */}
          <ul className="hidden lg:flex items-center gap-4">

          {/* {navigation.map((menu, index) => {
            const isActive = pathname === menu.link;
            return (
              <li className="mr-3 nav__item" key={index}>
                <Link
                  href={menu.link}
                  className={`inline-block px-4 py-2 text-lg font-normal rounded-md transition-colors duration-200
                  ${isActive
                    ? "bg-samu-vermelho text-samu-branco font-bold dark:bg-samu-branco dark:text-samu-vermelho dark:font-bold"
                    : "text-samu-vermelho dark:text-samu-branco hover:bg-samu-vermelho hover:text-samu-branco dark:hover:bg-samu-branco dark:hover:text-samu-vermelho"}
                `}

                 
                >
                  {menu.nome}
                </Link>
              </li>
            );
          })} */}
        </ul>
      <ThemeChanger />
      {pathname !== "/login" ? (
        //  Se for na home, mostra só Área Restrita
        <Link
          href="/login"
          className="px-4 py-2 rounded-md bg-transparent
           text-samu-azul dark:text-samu-branco font-semibold
            hover:text-samu-branco hover:bg-samu-azul transition 
            justify-between items-center gap-2 flex"
        >
          <FaLock size={10} />
          Acessar
        </Link>
      ) : (
        //  Em qualquer outra página, mostra Login e Cadastro
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/login"
            className="px-6 py-2 rounded-md bg-samu-vermelho text-white font-semibold hover:bg-samu-laranja transition"
          >
            Fazer Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-2 rounded-md border-2 border-samu-vermelho text-samu-vermelho dark:border-samu-branco dark:text-samu-branco font-semibold hover:bg-samu-vermelho hover:text-white dark:hover:bg-samu-branco dark:hover:text-slate-900 transition"
          >
            Cadastro
          </Link>
          
        </div>
      )}
    </div>

        {/* Menu mobile */}
        {/* <Disclosure>
          {({ open }) => (
            <>
              <DisclosureButton
                aria-label="Toggle Menu"
                className="px-2 py-1 text-slate-700 rounded-md lg:hidden dark:text-slate-300 focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  {open ? (
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                    />
                  )}
                </svg>
              </DisclosureButton>

              <Disclosure.Panel className="flex flex-col w-full mt-4 space-y-3 lg:hidden">
                <Link
                  href="/register"
                  className="px-6 py-2 text-samu-vermelho dark:text-samu-branco border border-samu-vermelho dark:border-samu-branco rounded-md text-center hover:bg-samu-vermelho hover:text-white dark:hover:bg-samu-branco dark:hover:text-slate-900"
                >
                  Cadastro
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-2 bg-samu-vermelho text-white rounded-md text-center hover:bg-samu-laranja"
                >
                  Fazer Login
                </Link>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure> */}
        
      </nav>
    </div>
  );
};
