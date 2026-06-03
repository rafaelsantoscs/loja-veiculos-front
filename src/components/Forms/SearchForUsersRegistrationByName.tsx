'use client';

import React, { useState } from 'react';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/store/store'; 
import axiosInstance from '@/services/axiosInstance';
import { ErrorAlert } from '../Alerts/ErrorAlert';
import { SucessAlert } from '../Alerts/SucessAlert';
import { AttentionAlert } from '../Alerts/AttentionAlert';
import InformacoesDoUsuario from './InformacoesDoUsuario';
import { getUserLocalStorage } from '@/store/userLocalStorage';

interface User {
  id: number | null;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  username: string;
  imagemUrl?: string;
  roles?: string[]; // Opcional
}

interface ChildComponentProps {
  setFormData?: React.Dispatch<React.SetStateAction<{
    id: number | null;
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    imagemUrl?: string;
    username: string;
    roles?: string[]; 
  }>>;
  liberarCampos?: (foundCpf:boolean) => void;
  cadastro?:boolean;
  setNotFoundNome?:(value: string) => void;
}

const SearchForUsersRegistrationByName = ({ liberarCampos, cadastro}: ChildComponentProps) => {
  // const { token } = useSelector((state: RootState) => state.user);
  const token = getUserLocalStorage()?.token || '';
  const [ errorMessage, setErrorMessage] = useState('')
  const [ messageFound, setMessageFound ] = useState('')
  const [ messageNotFound, setMessageNotFound ] = useState('')
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [ nomeErradoValido ] = useState('');
  const [userSystems, setUserSystems] = useState<User[]>([]);
  const [userData, setUserData] = useState<User | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNome(e.target.value); // Atualiza o estado com o valor do input
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verifica se o Nome está preenchido corretamente
    if (!nome ) {
      setErrorMessage('O campo não pode ir vazio.');
      setMessageNotFound('')
      setMessageFound('')
      return;
    }
  
    setLoading(true);

    console.log('nome do input', nome)
  
    try {
      // Envia os dados para o servidor
      const response = await axiosInstance.get(`/usuarios/nome/${nome}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 && response.data.length > 0) {
       // console.log(response.data)
        setUserSystems(response.data); // Armazena a lista de cidadãos
        setMessageFound(`${response.data.length} Cadastro(s) encontrado(s) com sucesso!`);
        setMessageNotFound('');
      //  liberarCampos && cadastro ? liberarCampos(false) : liberarCampos && liberarCampos(true);
      //  dispatch(clearCidadao())
        
      } else {
        setUserSystems([]);
        setMessageNotFound('Cadastro não encontrado.');
        setMessageFound('');
        liberarCampos && cadastro ? liberarCampos(true) : liberarCampos && liberarCampos(false);
      }
    } catch (error) {
      setErrorMessage('Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
      
    }
  };

  if (messageNotFound){
    setTimeout(() => {setMessageNotFound("")}, 4000);
  }

  if (messageFound){
    setTimeout(() => {setMessageFound("")}, 4000);
  }

  if (errorMessage){
    setTimeout(() => {setErrorMessage("")}, 4000);
  }

  const handleSelectUserSystem = (userSystem: User) => {
   // console.log("handleSelectUserSystem", userSystem);
    setUserData(userSystem); // Agora TypeScript não reclamará
    setUserSystems([]);
  };

  const handleUserUpdate = (updatedUser: User | null) => {
   // console.log("Atualizou")
    if (updatedUser === null) {
      setUserData(null); // Limpa o estado do usuário
      setNome(''); // Limpa o CPF, se necessário
      setMessageFound("Cadastro atualizado com sucesso!");
    }
  };

  const clearUserSystens = () => {
    setUserSystems([]);
  };
  
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-full max-w-xl rounded-2xl shadow-xl overflow-hidden bg-white dark:bg-slate-800">
        {/* Cover Image */}
        <div className="relative h-28 bg-gradient-to-br from-blue-800 to-blue-600 flex items-end">
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-2xl"></div>
          <div className="relative w-full z-10 pb-3 px-6 flex flex-col items-start">
            <h1 className="text-xl font-bold text-white drop-shadow mb-1 w-full text-center">Buscar Cadastro Pelo Nome</h1>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-1 inline-block mx-auto">
              <span className="text-white text-sm font-medium">Buscar Nome</span>
            </div>
          </div>
        </div>
        {/* Card Content */}
        <div className="px-6 pb-8 pt-4 text-center">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-4 items-center justify-center">
            <input
              name={nome}
              type="text"
              value={nome}
              onChange={handleChange}
              className="flex-1 border border-slate-300 dark:border-slate-600 p-2 rounded-lg shadow-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite um nome"
            />
            <button
              type="submit"
              className="w-full md:w-1/3 bg-gradient-to-r from-blue-800 to-blue-400 text-white font-semibold py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
            <button
              type="button"
              onClick={clearUserSystens}
              className="w-full md:w-1/3 bg-gradient-to-r from-yellow-500 to-pink-500 text-white font-semibold py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-300 dark:focus:ring-pink-800"
            >
              Limpar Busca
            </button>
          </form>
          {errorMessage? <ErrorAlert message={errorMessage} description={`O Nome:${nomeErradoValido} Não è Válido`}/> :null}
          {messageFound? <SucessAlert message={messageFound} description={`O Nome ${nomeErradoValido} foi encontrado com sucesso`}/>:null}
          {messageNotFound? <AttentionAlert message={messageNotFound} botao={!cadastro ? "paciente" : undefined}  description={`Não existe um cadastro com o Nome: ${nomeErradoValido}`}/>:null}

          {userSystems.length > 0 && (
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full bg-white dark:bg-slate-800 rounded-xl">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-slate-700 dark:text-slate-200">Nome</th>
                    <th className="py-2 px-4 border-b text-slate-700 dark:text-slate-200">CPF</th>
                    <th className="py-2 px-4 border-b text-slate-700 dark:text-slate-200">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {userSystems.map((userSystem, index) => (
                    <tr key={index}>
                      <td className="py-2 px-4 border-b">{userSystem.nome}</td>
                      <td className="py-2 px-4 border-b">{userSystem.cpf}</td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => handleSelectUserSystem(userSystem)}
                          className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600"
                        >
                          Selecionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {userData && <InformacoesDoUsuario userData={userData}  onUpdate={handleUserUpdate} />}
        </div>
      </div>
    </div>
  );
  
};

export default SearchForUsersRegistrationByName;
