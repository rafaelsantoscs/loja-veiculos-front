'use client';

import React, { useState } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { getUserLocalStorage } from '@/store/userLocalStorage';
import { Search, X, UserPlus, Users } from 'lucide-react';
import { useTheme } from 'next-themes';

export interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  username: string;
  imagemUrl?: string;
  roles?: string[];
}

interface SearchUsuarioParaTarefaProps {
  usuariosSelecionados: Usuario[];
  onUsuariosChange: (usuarios: Usuario[]) => void;
  multiplo?: boolean; // Se false, permite apenas 1 usuário
}

const SearchUsuarioParaTarefa: React.FC<SearchUsuarioParaTarefaProps> = ({
  usuariosSelecionados,
  onUsuariosChange,
  multiplo = true
}) => {
  const { theme } = useTheme();
  const token = getUserLocalStorage()?.token || '';
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);
  const [usuariosEncontrados, setUsuariosEncontrados] = useState<Usuario[]>([]);
  const [erro, setErro] = useState('');
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const buscarUsuarios = async () => {
    if (!busca.trim()) {
      setErro('Digite um nome ou CPF para buscar');
      setTimeout(() => setErro(''), 3000);
      return;
    }

    setLoading(true);
    setErro('');

    try {
      // Buscar por nome
      const response = await axiosInstance.get(`/usuarios/nome/${busca}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 && response.data.length > 0) {
        setUsuariosEncontrados(response.data);
        setMostrarResultados(true);
      } else {
        setUsuariosEncontrados([]);
        setErro('Nenhum usuário encontrado');
        setTimeout(() => setErro(''), 3000);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setErro('Erro ao buscar usuários');
      setTimeout(() => setErro(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarUsuarios();
    }
  };

  const adicionarUsuario = (usuario: Usuario) => {
    // Verifica se já foi adicionado
    if (usuariosSelecionados.some(u => u.id === usuario.id)) {
      setErro('Usuário já adicionado');
      setTimeout(() => setErro(''), 3000);
      return;
    }

    if (multiplo) {
      onUsuariosChange([...usuariosSelecionados, usuario]);
    } else {
      onUsuariosChange([usuario]);
    }

    // Limpar busca
    setBusca('');
    setUsuariosEncontrados([]);
    setMostrarResultados(false);
  };

  const removerUsuario = (usuarioId: number) => {
    onUsuariosChange(usuariosSelecionados.filter(u => u.id !== usuarioId));
  };

  const colors = {
    background: theme === 'dark' ? 'bg-slate-900/40' : 'bg-white/80',
    border: theme === 'dark' ? 'border-slate-700' : 'border-slate-300',
    text: {
      primary: theme === 'dark' ? 'text-slate-100' : 'text-slate-900',
      secondary: theme === 'dark' ? 'text-slate-400' : 'text-slate-600',
    },
    input: {
      background: theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50',
      border: theme === 'dark' ? 'border-slate-700' : 'border-slate-300',
    },
    card: {
      background: theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80',
      hover: theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-slate-100',
    }
  };

  return (
    <div className="space-y-4">
      {/* Campo de Busca */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${colors.text.secondary}`}>
          {multiplo ? 'Buscar Usuários' : 'Buscar Usuário'}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${colors.text.secondary}`} />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite nome ou CPF..."
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${colors.input.border} ${colors.input.background} ${colors.text.primary} focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all backdrop-blur`}
            />
          </div>
          <button
            type="button"
            onClick={buscarUsuarios}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl transition-all font-medium"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Mensagem de Erro */}
        {erro && (
          <div className={`mt-2 p-3 rounded-xl border ${
            theme === 'dark' 
              ? 'border-red-500/30 bg-red-500/10 text-red-400' 
              : 'border-red-400/30 bg-red-100/80 text-red-700'
          } text-sm`}>
            {erro}
          </div>
        )}
      </div>

      {/* Resultados da Busca */}
      {mostrarResultados && usuariosEncontrados.length > 0 && (
        <div className={`rounded-xl border ${colors.border} ${colors.background} p-4 backdrop-blur max-h-60 overflow-y-auto`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-semibold ${colors.text.primary}`}>
              {usuariosEncontrados.length} usuário(s) encontrado(s)
            </h3>
            <button
              type="button"
              onClick={() => {
                setMostrarResultados(false);
                setUsuariosEncontrados([]);
              }}
              className={`p-1 rounded-lg ${colors.card.hover} transition-colors`}
            >
              <X className={`h-4 w-4 ${colors.text.secondary}`} />
            </button>
          </div>
          <div className="space-y-2">
            {usuariosEncontrados.map((usuario) => (
              <div
                key={usuario.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${colors.border} ${colors.card.background} ${colors.card.hover} transition-colors`}
              >
                <div className="flex-1">
                  <p className={`font-medium ${colors.text.primary}`}>{usuario.nome}</p>
                  <p className={`text-xs ${colors.text.secondary}`}>
                    {usuario.email} • CPF: {usuario.cpf}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => adicionarUsuario(usuario)}
                  disabled={usuariosSelecionados.some(u => u.id === usuario.id)}
                  className={`ml-3 px-3 py-2 rounded-lg transition-all ${
                    usuariosSelecionados.some(u => u.id === usuario.id)
                      ? theme === 'dark'
                        ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-200/50 text-slate-400 cursor-not-allowed'
                      : theme === 'dark'
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-green-500/15 text-green-600 hover:bg-green-500/25'
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usuários Selecionados */}
      {usuariosSelecionados.length > 0 && (
        <div className={`rounded-xl border ${colors.border} ${colors.background} p-4 backdrop-blur`}>
          <div className="flex items-center gap-2 mb-3">
            <Users className={`h-5 w-5 ${colors.text.secondary}`} />
            <h3 className={`text-sm font-semibold ${colors.text.primary}`}>
              {multiplo ? 'Usuários Selecionados' : 'Usuário Selecionado'} ({usuariosSelecionados.length})
            </h3>
          </div>
          <div className="space-y-2">
            {usuariosSelecionados.map((usuario) => (
              <div
                key={usuario.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${colors.border} ${colors.card.background}`}
              >
                <div className="flex-1">
                  <p className={`font-medium ${colors.text.primary}`}>{usuario.nome}</p>
                  <p className={`text-xs ${colors.text.secondary}`}>
                    {usuario.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removerUsuario(usuario.id)}
                  className={`ml-3 p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-red-500/15 text-red-600 hover:bg-red-500/25'
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchUsuarioParaTarefa;
