'use client';

import React, { useState } from 'react';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/store/store'; 
import axiosInstance from '@/services/axiosInstance';
import { ErrorAlert } from '../Alerts/ErrorAlert';
import { SucessAlert } from '../Alerts/SucessAlert';
import { AttentionAlert } from '../Alerts/AttentionAlert';
import { getUserLocalStorage } from '@/store/userLocalStorage';
import InformacoesDoUsuarioComRole from './InformacoesDoUsuarioComRole';

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
  allowedRoles?: string[];
}

const SearchForUsersRegistrationByNamePorRole = ({ liberarCampos, cadastro, allowedRoles}: ChildComponentProps) => {
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
        console.log(response.data)
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
    console.log("handleSelectUserSystem", userSystem);
    setUserData(userSystem); // Agora TypeScript não reclamará
    setUserSystems([]);
  };

  const handleUserUpdate = (updatedUser: User | null) => {
    console.log("Atualizou")
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
    <div className="bg-transparent  flex items-center mb-5 justify-center">
       <div className="w-full text-samu-azul dark:bg-slate-900  bg-white p-2 rounded-lg shadow-lg">
        <h1 className="text-sm font-semibold mb-2 text-samu-azul dark:text-samu-branco">Buscar Cadastro Pelo Nome</h1>
        
        <form onSubmit={handleSubmit} className="flex space-x-4 mb-4">          
          <input
            name={nome}
            type="text"
            value={nome}
            onChange={handleChange}
            className="border border-slate-500 bg-samu-branco dark:bg-slate-700 text-samu-azul dark:text-samu-branco p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-samu-azul w-[40%]"
            // className="flex-1 border border-slate-300 p-2 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite um nome"
          />
         
          <button
            type="submit"
            className="p-2 border-2 border-samu-azul bg-transparent 
                          text-samu-azul py-2 rounded-md hover:bg-samu-azul hover:text-samu-branco
                          dark:border-samu-branco dark:bg-transparent dark:text-samu-branco dark:hover:bg-samu-branco dark:hover:text-samu-azul
                          focus:outline-none focus:ring-2 focus:ring-samu-azul"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
          <button
             type="button"
             onClick={clearUserSystens}
             className="p-2 border-2 border-samu-laranja bg-transparent 
                          text-samu-laranja py-2 rounded-md hover:bg-samu-laranja hover:text-samu-branco
                          dark:border-samu-branco dark:bg-transparent dark:text-samu-branco dark:hover:bg-samu-branco dark:hover:text-samu-laranja
                          focus:outline-none focus:ring-2 focus:ring-samu-laranja"
          >
           Limpar Busca
          </button>
        </form>
        {errorMessage? <ErrorAlert message={errorMessage} description={`O Nome:${nomeErradoValido} Não è Válido`}/> :null}
        {messageFound? <SucessAlert message={messageFound} description={`O Nome ${nomeErradoValido} foi encontrado com sucesso`}/>:null}
        {messageNotFound? <AttentionAlert message={messageNotFound} botao={!cadastro ? "paciente" : undefined}  description={`Não existe um cadastro com o Nome: ${nomeErradoValido}`}/>:null}
        
        {userSystems.length > 0 && (
          <table className="min-w-full bg-transparent dark:bg-transparent text-samu-azul dark:text-samu-branco">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Nome</th>
                <th className="py-2 px-4 border-b">CPF</th>
                <th className="py-2 px-4 border-b">Ação</th>
              </tr>
            </thead>
            <tbody>
            {userSystems
              .filter(userSystem =>
                userSystem.roles?.some(role =>
                  allowedRoles?.includes(role)
                )
              )
              .map((userSystem, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b">{userSystem.nome}</td>
                  <td className="py-2 px-4 border-b">{userSystem.cpf}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleSelectUserSystem(userSystem)}
                      className=" p-1 border-2 border-samu-azul bg-transparent 
                      text-samu-azul  rounded-md hover:bg-samu-azul hover:text-samu-branco
                      dark:border-samu-branco dark:bg-transparent dark:text-samu-branco dark:hover:bg-samu-branco dark:hover:text-samu-azul
                      focus:outline-none focus:ring-2 focus:ring-samu-azul"
                      // className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600"
                    >
                      Selecionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {userData && <InformacoesDoUsuarioComRole userData={userData} allowedRoles={allowedRoles} onUpdate={handleUserUpdate} />}
      </div>
    </div>
  );
  
};

export default SearchForUsersRegistrationByNamePorRole;
