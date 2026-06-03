'use client';

import React, { useState } from 'react';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/store/store'; 
import axiosInstance from '@/services/axiosInstance';
import { ErrorAlert } from '../../Alerts/ErrorAlert';
import { SucessAlert } from '../../Alerts/SucessAlert';
import { AttentionAlert } from '../../Alerts/AttentionAlert';
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
    
    <div className="bg-slate-100 dark:bg-slate-800 flex items-center mb-5 justify-center">
  <div className="w-full text-camutanga-azul dark:text-camutanga-amarelo bg-white dark:bg-slate-700 p-2 rounded-lg shadow-lg">
    <h1 className="text-sm font-semibold mb-2">Buscar Cadastro Pelo Nome</h1>
    
    <form onSubmit={handleSubmit} className="flex space-x-4 mb-4">          
      <input
        name={nome}
        type="text"
        value={nome}
        onChange={handleChange}
        className="flex-1 border border-camutanga-azul p-2 bg-white
           dark:bg-transparent dark:border-camutanga-branco dark:text-white
           rounded-md focus:outline-none focus:ring-2 focus:ring-camutanga-azul
           dark:focus:ring-camutanga-amarelo"
        placeholder="Digite um nome"
      />
         
         <button
          type="submit"
          className="w-1/3 bg-camutanga-azul text-white py-2 rounded-md hover:bg-camutanga-vinho 
                    dark:bg-transparent dark:border-2 dark:border-camutanga-branco 
                    dark:text-camutanga-branco dark:hover:bg-white dark:hover:text-camutanga-azul
                    focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
        <button
          type="button"
          onClick={clearUserSystens}
          className="w-1/3 bg-camutanga-amarelo text-white py-2 rounded-md hover:bg-camutanga-vinho 
                    focus:outline-none focus:ring-2 focus:ring-rose-500
                    dark:bg-transparent dark:border dark:border-white dark:text-white 
                    dark:hover:bg-camutanga-vinho dark:hover:border-camutanga-vinho"
        >
          Limpar Busca
        </button>
        </form>
        {errorMessage? <ErrorAlert message={errorMessage} description={`O Nome:${nomeErradoValido} Não è Válido`}/> :null}
        {messageFound? <SucessAlert message={messageFound} description={`O Nome ${nomeErradoValido} foi encontrado com sucesso`}/>:null}
        {messageNotFound? <AttentionAlert message={messageNotFound} botao={!cadastro ? "" : undefined}  description={`Não existe um cadastro com o Nome: ${nomeErradoValido}`}/>:null}
        
        {userSystems.length > 0 && (
          <table className="min-w-full bg-camutanga-branco dark:bg-transparent mt-20" >
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
                      className=" border-2 border-camutanga-azul bg-transparent text-camutanga-azul py-1 px-3 rounded-md
                       hover:bg-camutanga-azul hover:text-camutanga-branco 
                       dark:border-camutanga-amarelo dark:text-camutanga-amarelo dark:hover:bg-camutanga-amarelo dark:hover:text-camutanga-branco
                       "
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
