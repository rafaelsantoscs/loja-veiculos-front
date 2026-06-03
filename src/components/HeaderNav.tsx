// src/components/HeaderNav.tsx
'use client';

import { useState } from 'react';
// Importando o Link do Next.js
import Link from 'next/link';
import { FaBars, FaTimes, FaTachometerAlt, FaShuttleVan, FaTable, FaAlignLeft, FaTabletAlt, FaCalendar, FaCogs, FaUser, FaSignOutAlt } from 'react-icons/fa';

const HeaderNav = () => {
  const [isOpen, setIsOpen] = useState(true);
  

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-blue-500 py-5 px-6">
      <div className="flex items-center justify-between">
        <a href="index.html" className="text-white text-3xl font-semibold uppercase hover:text-gray-300">Admin</a>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white text-3xl focus:outline-none"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <nav className="flex flex-col pt-4">
        <Link href="/dashboard" className="flex items-center text-white py-2 pl-4 nav-item">
          <FaTachometerAlt className="mr-3" />
          Dashboard
        </Link>
        <Link href="/cadastro-cidadao" className="flex items-center text-white opacity-75 hover:opacity-100 py-2 pl-4 nav-item">
          <FaUser className="mr-3" />
          Cadastro Cidadão
        </Link>
        <Link href="/agendar-viagens-tfd" className="flex items-center text-white opacity-75 hover:opacity-100 py-2 pl-4 nav-item">
          <FaShuttleVan className="mr-3" />
          Agendar Viagem TFD
        </Link>
        <Link href="/listar-viagens-tfd" className="flex items-center text-white opacity-75 hover:opacity-100 py-2 pl-4 nav-item">
          <FaTable className="mr-3" />
          Listar Viagens TFD
        </Link>
        <Link href="/listar-viagens-por-cpf" className="flex items-center text-white opacity-75 hover:opacity-100 py-2 pl-4 nav-item">
          <FaAlignLeft className="mr-3" />
          Listar Viagens por CPF
        </Link>
        <Link href="/tabs" className="flex items-center text-white opacity-75 hover:opacity-100 py-2 pl-4 nav-item">
          <FaTabletAlt className="mr-3" />
          Tabbed Content
        </Link>
        <Link href="/calendar" className="flex items-center text-white opacity-75 hover:opacity-100 py-2 pl-4 nav-item">
          <FaCalendar className="mr-3" />
          Calendar
        </Link>
        <Link href="/support" className="flex items-center text-white opacity-75 hover:opacity-100 py-2 pl-4 nav-item">
          <FaCogs className="mr-3" />
          Support
        </Link>
        <Link href="/account" className="flex items-center text-white opacity-75 hover:opacity-100 py-2 pl-4 nav-item">
          <FaUser className="mr-3" />
          My Account
        </Link>
        <a href="#" className="flex items-center text-white opacity-75 hover:opacity-100 py-2 pl-4 nav-item">
          <FaSignOutAlt className="mr-3" />
          Sign Out
        </a>
        {/* <button className="w-full bg-white cta-btn font-semibold py-2 mt-3 rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-300 flex items-center justify-center">
          <FaArrowCircleUp className="mr-3" /> Upgrade to Pro!
        </button> */}
      </nav>
    </aside>
  );
};

export default HeaderNav;
