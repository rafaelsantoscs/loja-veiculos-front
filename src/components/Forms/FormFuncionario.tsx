import {  useCallback, useEffect, useState } from "react";
import axiosInstance from "@/services/axiosInstance";
import { formatarData, formatCPF, formatPhoneNumberForInput } from "@/utils/formatters";
import { getUserLocalStorage } from "@/store/userLocalStorage";
import { obterDataHora } from "@/utils/dataHora";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

interface ErrorResponse {
  error: string; // Aqui você define que a resposta de erro tem a propriedade 'error' do tipo string
}

interface Funcionario {
  nome: string;
  nomeSocial: string;
  dataDeNasc: string;
  cpf: string;
  sus: string;
  pis: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  pontoDeReferencia: string;
  cep: string;
  telefone1: string;
  telefone2: string;
  email: string;
  dataRegistro:string;
  registradoPor: string;
  filiacao1: string;
  filiacao2: string;
}

const FormFuncionario = () => {
  const user = getUserLocalStorage();
  const token = user?.token || "";

  const [formData, setFormData] = useState<Funcionario>({
    nome: "",
    nomeSocial: "",
    dataDeNasc: "",
    cpf: "",
    sus: "",
    pis: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "Camutanga",
    pontoDeReferencia: "",
    cep: "",
    telefone1: "",
    telefone2: "",
    email: "",
    dataRegistro:obterDataHora(),
    registradoPor: user?.nomeCompleto || "admin",
    filiacao1: "",
    filiacao2: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [funcionarioSalvo, setFuncionarioSalvo] = useState<Partial<Funcionario> | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalFuncionarios, setTotalFuncionarios] = useState<number | null>(null);

  // Memoriza a função para que ela não seja redefinida em cada render
  const fetchTotalFuncionarios = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/funcionario/total-cadastrados", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTotalFuncionarios(response.data.totalCidadaosCadastrados);
    } catch (error) {
      console.error("Erro ao buscar total de funcionários:", error);
    }
  }, [token]); // token é dependência da função
  
  useEffect(() => {
    fetchTotalFuncionarios();
  }, [fetchTotalFuncionarios]); // agora tudo certo!
  


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "cpf" ? value.replace(/\D/g, "") : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const funcionarioParaEnviar = {
      ...formData,
      dataRegistro: obterDataHora(),
    };

    try {
      const response = await axiosInstance.post("/funcionario", funcionarioParaEnviar, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if(response.status == 201) {
        toast.success("Funcionário cadastrado com sucesso!");
      setFuncionarioSalvo(response.data);
      setFormData({
        nome: "",
        nomeSocial: "",
        dataDeNasc: "",
        cpf: "",
        sus: "",
        pis: "",
        rua: "",
        numero: "",
        bairro: "",
        cidade: "Camutanga",
        pontoDeReferencia: "",
        cep: "",
        telefone1: "",
        telefone2: "",
        email: "",
        dataRegistro: obterDataHora(),
        registradoPor: user?.nomeCompleto || "admin",
        filiacao1: "",
        filiacao2: "",
      });
      fetchTotalFuncionarios();
    }
  } catch (error) {
    // Definindo o tipo do erro como AxiosError
    const axiosError = error as AxiosError<ErrorResponse>;
  
    console.error("Erro ao cadastrar:", axiosError);
    
    const mensagem = axiosError.response?.data?.error || "Erro ao cadastrar funcionário.";
    
    // Exibindo o erro usando o Toast
    toast.error(mensagem);
  } finally {
      setLoading(false);
      setShowModal(true);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto max-h-[90vh] overflow-y-auto p-6 md:p-8 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg shadow-md space-y-6 transition-colors duration-300">
        {totalFuncionarios !== null && (
          <div className="mb-4 text-lg font-medium text-green-700 dark:text-green-400">
            Total de funcionários cadastrados: {totalFuncionarios}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold mb-4 text-slate-700 dark:text-white">
            Dados de Funcionário
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nome" className="block mb-1 text-sm font-medium dark:text-slate-200">Nome completo</label>
              <input id="nome" name="nome" placeholder="Digite o nome completo" value={formData.nome} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>

            <div>
              <label htmlFor="nomeSocial" className="block mb-1 text-sm font-medium dark:text-slate-200">Nome social</label>
              <input id="nomeSocial" name="nomeSocial" placeholder="Digite o nome social" value={formData.nomeSocial} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="dataDeNasc" className="block mb-1 text-sm font-medium dark:text-slate-200">Data de nascimento</label>
              <input id="dataDeNasc" name="dataDeNasc" type="date" value={formData.dataDeNasc} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>

            <div>
              <label htmlFor="cpf" className="block mb-1 text-sm font-medium dark:text-slate-200">CPF</label>
              <input id="cpf" name="cpf" placeholder="Digite o CPF" value={formatCPF(formData.cpf)} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>

            <div>
              <label htmlFor="sus" className="block mb-1 text-sm font-medium dark:text-slate-200">Número do SUS</label>
              <input id="sus" name="sus" placeholder="Digite o número do SUS" value={formData.sus} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>

            <div>
              <label htmlFor="pis" className="block mb-1 text-sm font-medium dark:text-slate-200">PIS</label>
              <input id="pis" name="pis" placeholder="PIS (NIS)" value={formData.pis} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="filiacao1" className="block mb-1 text-sm font-medium dark:text-slate-200">Filiação 1</label>
              <input id="filiacao1" name="filiacao1" placeholder="Digite o nome da mãe ou responsável" value={formData.filiacao1} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>

            <div>
              <label htmlFor="filiacao2" className="block mb-1 text-sm font-medium dark:text-slate-200">Filiação 2</label>
              <input id="filiacao2" name="filiacao2" placeholder="Digite o nome do pai ou outro responsável" value={formData.filiacao2} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
          </div>

          <h3 className="font-semibold text-slate-700 dark:text-slate-200">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label htmlFor="rua" className="block mb-1 text-sm font-medium dark:text-slate-200">Rua</label>
              <input id="rua" name="rua" placeholder="Digite o nome da rua" value={formData.rua} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="numero" className="block mb-1 text-sm font-medium dark:text-slate-200">Número</label>
              <input id="numero" name="numero" placeholder="Digite o número da residência" value={formData.numero} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>

            <div className="md:col-span-4">
              <label htmlFor="bairro" className="block mb-1 text-sm font-medium dark:text-slate-200">Bairro/Distrito</label>
              <input id="bairro" name="bairro" placeholder="Digite o bairro" value={formData.bairro} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label htmlFor="pontoDeReferencia" className="block mb-1 text-sm font-medium dark:text-slate-200">Ponto de Referência</label>
              <input id="pontoDeReferencia" name="pontoDeReferencia" placeholder="Digite um ponto de referência" value={formData.pontoDeReferencia} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>

            <div className="md:col-span-4">
              <label htmlFor="cidade" className="block mb-1 text-sm font-medium dark:text-slate-200">Cidade</label>
              <input id="cidade" name="cidade" placeholder="Cidade" value={formData.cidade} onChange={handleChange} className="w-full p-2 border rounded bg-slate-100 dark:bg-slate-600 dark:text-white" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="cep" className="block mb-1 text-sm font-medium dark:text-slate-200">CEP</label>
              <input id="cep" name="cep" placeholder="Digite o CEP" value={formData.cep} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
          </div>

          <h3 className="font-semibold text-slate-700 dark:text-slate-200">Contato</h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
              <label htmlFor="telefone1" className="block mb-1 text-sm font-medium dark:text-slate-200">Telefone 1</label>
              <input id="telefone1" name="telefone1" placeholder="Digite o telefone principal" value={formatPhoneNumberForInput(formData.telefone1)} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>

            <div className="md:col-span-3">
              <label htmlFor="telefone2" className="block mb-1 text-sm font-medium dark:text-slate-200">Telefone 2</label>
              <input id="telefone2" name="telefone2" placeholder="Digite um telefone adicional" value={formatPhoneNumberForInput(formData.telefone2)} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>

            <div className="md:col-span-6">
              <label htmlFor="email" className="block mb-1 text-sm font-medium dark:text-slate-200">Email</label>
              <input id="email" name="email" placeholder="Digite um email"  value={formData.email} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-3 rounded transition text-white ${
              loading
                ? 'bg-gray-400 cursor-not-allowed flex items-center justify-center gap-2'
                : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 text-blue-700 border-green border-t-transparent rounded-full animate-spin-1.5"></div>
                <p className="text-blue-700 animate-pulse-scale">Enviando...</p>
              </>
            ) : (
              'Cadastrar Funcionário'
            )}
          </button>
        </form>
      </div>
      {showModal && funcionarioSalvo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4 text-green-600">Funcionário cadastrado com sucesso!</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Nome:</strong> {funcionarioSalvo.nome}</p>
              <p><strong>CPF:</strong> {formatCPF(funcionarioSalvo.cpf || "")}</p>
              <p><strong>PIS:</strong> {formatCPF(funcionarioSalvo.pis || "")}</p>
              <p><strong>SUS:</strong> {formatCPF(funcionarioSalvo.sus || "")}</p>
              <p><strong>Data de Nascimento:</strong> {formatarData(funcionarioSalvo.dataDeNasc || "")}</p>
              <p><strong>Telefone:</strong> {formatPhoneNumberForInput(funcionarioSalvo.telefone1 || "")}</p>
              <p><strong>E-mail:</strong> {funcionarioSalvo.email}</p>
              <p><strong>Cidade:</strong> {funcionarioSalvo.cidade}</p>
              <p><strong>Registrado por:</strong> {funcionarioSalvo.registradoPor}</p>
              <p><strong>Registrado Em:</strong> {funcionarioSalvo.dataRegistro}</p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FormFuncionario;
