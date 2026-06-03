'use client';

import React, { useState, useEffect } from 'react';
import { 
  Fuel, 
  Car, 
  MapPin, 
  User, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  Wifi,
  WifiOff,
  Save,
  Send,
  Trash2,
  Eye,
  X,
  Clock
} from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
import { getUserLocalStorage } from '@/store/userLocalStorage';

// Interfaces
interface VeiculoOffline {
  placa: string;
  modelo: string;
  combustivel: string;
  motorista: string;
  lotacao: string;
  tipo: string;
}

interface DadosAbastecimento {
  kmAtual: string;
  tipoCombustivel: string;
  litros: string;
  valor: string;
  observacoes?: string;
  posto?: string;
}

interface AbastecimentoOffline {
  id: string;
  veiculo: VeiculoOffline;
  dadosAbastecimento: DadosAbastecimento;
  dataHora: string;
  dataHoraFormatada?: string;
  dataHoraSincronizacao?: string;
  status: 'salvo_offline' | 'pendente_sincronizacao' | 'sincronizado';
  tentativasSincronizacao?: number;
}

// Funções de formatação (importadas do FormMapaDoVeiculo)
const formatDecimal = (value: string): string => {
  const cleanValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
  const numericValue = parseFloat(cleanValue);
  
  if (isNaN(numericValue)) return '';
  
  return numericValue.toFixed(1);
};

const formatCurrency = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Se não há números, retorna string vazia
  if (!numbers) return '';
  
  // Converte para centavos
  const cents = parseInt(numbers, 10);
  
  // Formata como moeda brasileira
  const formatted = (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatted;
};

const formatLitros = (value: string): string => {
  // Remove tudo que não é número ou ponto
  let cleanValue = value.replace(/[^\d.]/g, '');
  
  // Se houver mais de um ponto, mantém apenas o primeiro
  const dotIndex = cleanValue.indexOf('.');
  if (dotIndex !== -1) {
    cleanValue = cleanValue.substring(0, dotIndex + 1) + cleanValue.substring(dotIndex + 1).replace(/\./g, '');
    
    // Limita a 2 casas decimais após o ponto
    const parts = cleanValue.split('.');
    if (parts[1] && parts[1].length > 2) {
      cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
    }
  }
  
  // Limita a 3 dígitos antes do ponto
  const parts = cleanValue.split('.');
  if (parts[0].length > 3) {
    cleanValue = parts[0].substring(0, 3) + (parts[1] ? '.' + parts[1] : '');
  }
  
  return cleanValue;
};

const formatToFloat = (value: string): number => {
  // Remove pontos de milhares e converte vírgula para ponto
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

// Interface para histórico de abastecimentos
interface HistoricoAbastecimento {
  id: number;
  km: string;
  data: string;
  hora: string;
  litros: string;
  valor: string;
  combustivel: string;
  observacoes?: string;
}

// Interface para os dados do veículo
interface VeiculoAtivo {
  placa: string;
  modelo: string;
  combustivel: string;
  tipo: string;
  motorista: string;
  kmInicioMapa: string;
  destino: string;
  lotacao: string;
  dataAberturaMapa: string;
  horaAberturaMapa: string;
}

// Interface para os dados do formulário
interface FormAbastecimento {
  kmAtual: string;
  litros: string;
  valor: string;
  observacoes: string;
  tipoCombustivel: string; // Adicionado para permitir edição
}

// Componente de Status de Conexão
const OfflineStatus: React.FC<{ mostrarDetalhes?: boolean }> = ({ mostrarDetalhes = false }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`flex items-center space-x-2 p-3 rounded-lg ${
      isOnline 
        ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
        : 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
    }`}>
      {isOnline ? (
        <Wifi className="w-5 h-5 text-green-600" />
      ) : (
        <WifiOff className="w-5 h-5 text-red-600" />
      )}
      <div>
        <div className={`font-semibold ${
          isOnline ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
        }`}>
          {isOnline ? 'Online' : 'Offline'}
        </div>
        {mostrarDetalhes && (
          <div className={`text-sm ${
            isOnline ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'
          }`}>
            {isOnline ? 'Dados serão enviados imediatamente' : 'Dados serão salvos localmente'}
          </div>
        )}
      </div>
    </div>
  );
};

const AbastecimentoOfflinePage: React.FC = () => {
  const [veiculoAtivo, setVeiculoAtivo] = useState<VeiculoAtivo | null>(null);
  const [veiculoCarregando, setVeiculoCarregando] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  
  // Estados do formulário
  const [formData, setFormData] = useState<FormAbastecimento>({
    kmAtual: '',
    litros: '',
    valor: '',
    observacoes: '',
    tipoCombustivel: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  
  // Estados para controle de registros offline
  const [abastecimentosOffline, setAbastecimentosOffline] = useState<AbastecimentoOffline[]>([]);
  const [ultimoRegistro, setUltimoRegistro] = useState<AbastecimentoOffline | null>(null);
  const [mostrarUltimoRegistro, setMostrarUltimoRegistro] = useState(false);
  
  // Estado para histórico de abastecimentos online
  const [historicoAbastecimentos, setHistoricoAbastecimentos] = useState<HistoricoAbastecimento[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  // Carregar dados do veículo ativo
  useEffect(() => {
    const carregarVeiculoAtivo = () => {
      try {
        const dadosStorage = localStorage.getItem('veiculo_ativo_offline');
        if (dadosStorage) {
          const veiculo = JSON.parse(dadosStorage);
          setVeiculoAtivo(veiculo);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do veículo:', error);
      } finally {
        setVeiculoCarregando(false);
      }
    };

    carregarVeiculoAtivo();
  }, []);

  // Carregar abastecimentos offline existentes
  const carregarAbastecimentosOffline = () => {
    try {
      const abastecimentosSalvos = JSON.parse(
        localStorage.getItem('abastecimentos_offline') || '[]'
      );
      
      // Filtrar apenas os abastecimentos do veículo atual
      if (veiculoAtivo) {
        const abastecimentosDoVeiculo = (abastecimentosSalvos as AbastecimentoOffline[]).filter(
          (abastecimento: AbastecimentoOffline) => abastecimento.veiculo?.placa === veiculoAtivo.placa
        );
        setAbastecimentosOffline(abastecimentosDoVeiculo);
      }
    } catch (error) {
      console.error('Erro ao carregar abastecimentos offline:', error);
    }
  };

  useEffect(() => {
    if (veiculoAtivo) {
      carregarAbastecimentosOffline();
      carregarHistoricoAbastecimentos(veiculoAtivo.placa);
      // Inicializar tipo de combustível com o do veículo
      setFormData(prev => ({
        ...prev,
        tipoCombustivel: veiculoAtivo.combustivel
      }));
    }
  }, [veiculoAtivo, carregarAbastecimentosOffline]);

  // Função para carregar histórico de abastecimentos do localStorage
  const carregarHistoricoAbastecimentos = async (placa: string) => {
    setCarregandoHistorico(true);
    try {
      console.log('📈 Carregando histórico online do localStorage para placa:', placa);
      
      // DEBUG: Verificar todo o conteúdo do localStorage
      console.log('🔍 TODOS OS ITENS DO LOCALSTORAGE:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key!);
        console.log(`- ${key}:`, value);
      }
      
      // Buscar no localStorage o histórico salvo quando o mapa foi iniciado
      const historicoSalvo = localStorage.getItem('historico_online_abastecimentos');
      console.log('📊 Raw historico_online_abastecimentos:', historicoSalvo);
      
      if (historicoSalvo && historicoSalvo !== 'null' && historicoSalvo !== '[]') {
        const historico = JSON.parse(historicoSalvo);
        console.log('✅ Histórico encontrado no localStorage:', historico.length, 'registros');
        console.log('📋 Dados do histórico:', historico);
        setHistoricoAbastecimentos(historico);
      } else {
        console.log('⚠️ Nenhum histórico encontrado no localStorage - valor:', historicoSalvo);
        setHistoricoAbastecimentos([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar histórico do localStorage:', error);
      setHistoricoAbastecimentos([]);
    } finally {
      setCarregandoHistorico(false);
    }
  };

  // Função para sincronizar automaticamente registros pendentes
  const sincronizarAutomaticamente = async () => {
    console.log('🔄 Iniciando sincronização automática...');
    
    const user = getUserLocalStorage();
    if (!user?.token) {
      console.error('❌ Token do usuário não encontrado');
      setErro('Token de autenticação não encontrado. Faça login novamente.');
      return;
    }
    
    try {
      const abastecimentosOfflineSalvos = JSON.parse(
        localStorage.getItem('abastecimentos_offline') || '[]'
      ) as AbastecimentoOffline[];
      
      const registrosPendentes = abastecimentosOfflineSalvos.filter(
        (item: AbastecimentoOffline) => item.status === 'pendente_sincronizacao'
      );
      
      if (registrosPendentes.length === 0) {
        console.log('✅ Nenhum registro pendente para sincronizar');
        return;
      }
      
      console.log(`🔄 Sincronizando ${registrosPendentes.length} registros pendentes...`);
      
      let registrosSincronizados = 0;
      const idsParaRemover: string[] = [];
      
      for (const registro of registrosPendentes) {
        try {
          // Preparar payload conforme a API espera
          const payload = {
            placa: registro.veiculo.placa,
            modelo: registro.veiculo.modelo,
            data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            km: parseFloat(registro.dadosAbastecimento.kmAtual),
            combustivel: registro.dadosAbastecimento.tipoCombustivel,
            litros: parseFloat(registro.dadosAbastecimento.litros),
            valor: parseFloat(registro.dadosAbastecimento.valor),
            observacoes: registro.dadosAbastecimento.observacoes || '',
            motorista: registro.veiculo.motorista,
            cpfMotorista: user.cpf, // Usar CPF do usuário logado
            acessadoPor: "ROLE_MOTORISTA",
            lotacao: registro.veiculo.lotacao || ''
          };

          console.log('📤 Enviando registro para API:', payload);

          const response = await axiosInstance.post('/abastecimento-veiculos', payload, {
            headers: {
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.status === 201) {
            console.log('✅ Registro sincronizado com sucesso:', registro.id);
            registrosSincronizados++;
            idsParaRemover.push(registro.id); // Marcar para remoção
          } else {
            console.error('❌ Erro ao sincronizar registro:', registro.id, response.status);
          }
        } catch (error) {
          console.error('❌ Erro ao sincronizar registro individual:', registro.id, error);
        }
      }
      
      // Remover registros sincronizados com sucesso do localStorage
      if (idsParaRemover.length > 0) {
        const registrosRestantes = abastecimentosOfflineSalvos.filter(
          (registro: AbastecimentoOffline) => !idsParaRemover.includes(registro.id)
        );
        
        localStorage.setItem('abastecimentos_offline', JSON.stringify(registrosRestantes));
        console.log(`🗑️ ${idsParaRemover.length} registro(s) sincronizado(s) removido(s) da lista de pendências`);
      } else {
        // Se não removeu nada, salva os registros originais (pode ter havido erro)
        localStorage.setItem('abastecimentos_offline', JSON.stringify(abastecimentosOfflineSalvos));
      }
      
      // Recarregar lista local
      carregarAbastecimentosOffline();
      
      // Mostrar mensagem de sucesso
      if (registrosSincronizados > 0) {
        setMensagem(`✅ ${registrosSincronizados} registro(s) sincronizado(s) e removido(s) da lista de pendências!`);
      }
      
    } catch (error) {
      console.error('❌ Erro durante sincronização automática:', error);
      setErro('Erro ao sincronizar registros. Tente novamente.');
    }
  };

  // Monitorar status de conexão (simplificado para trabalhar com GlobalSync)
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 [PAGE] Conexão restaurada na página offline');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log('📵 [PAGE] Conexão perdida na página offline');
      setIsOnline(false);
    };
    
    // Verificar status inicial
    setIsOnline(navigator.onLine);
    
    // Adicionar listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Limpar mensagens após 5 segundos
  useEffect(() => {
    if (mensagem || erro) {
      const timer = setTimeout(() => {
        setMensagem('');
        setErro('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensagem, erro]);

  // Handler para mudanças no formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;

    if (name === "kmAtual") {
      // Permite apenas números e um ponto decimal
      if (!/^-?\d*\.?\d*$/.test(value)) return;

      // Se houver ponto decimal, limita a uma casa decimal
      if (value.includes(".")) {
        const [integerPart, decimalPart] = value.split(".");
        if (decimalPart && decimalPart.length > 1) return;
        
        // Garante que a parte inteira tenha no máximo 9 dígitos
        if (integerPart.length > 9) return;
      } else {
        // Caso não tenha ponto, garante que tenha no máximo 9 dígitos inteiros
        if (value.length > 9) return;
      }
    }

    // Se o campo for "valor", formata como moeda brasileira
    if (name === "valor") {
      formattedValue = formatCurrency(value);
    }
    
    // Se o campo for "litros", formata conforme a lógica de 3 dígitos antes do ponto e 2 após
    if (name === "litros") {
      formattedValue = formatLitros(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  // Validar formulário
  const validarFormulario = (): boolean => {
    if (!formData.kmAtual.trim()) {
      setErro('KM Atual é obrigatório');
      return false;
    }
    
    if (!formData.litros.trim()) {
      setErro('Litros é obrigatório');
      return false;
    }
    
    if (!formData.valor.trim()) {
      setErro('Valor é obrigatório');
      return false;
    }

    // Validar se KM atual é maior que KM inicial
    const kmAtualFormatado = formatDecimal(formData.kmAtual);
    const kmAtualNum = parseFloat(kmAtualFormatado || '0');
    const kmInicial = parseFloat(veiculoAtivo?.kmInicioMapa || '0');
    
    if (isNaN(kmAtualNum)) {
      setErro('KM Atual deve ser um número válido');
      return false;
    }
    
    if (kmAtualNum <= kmInicial) {
      setErro(`KM atual deve ser maior que KM inicial (${kmInicial})`);
      return false;
    }

    // Verificar se já existe um registro com o mesmo KM
    const registroExistente = abastecimentosOffline.find(
      (registro) => parseFloat(registro.dadosAbastecimento.kmAtual) === kmAtualNum
    );

    if (registroExistente) {
      setErro(`Já existe um registro salvo com KM ${kmAtualNum}. Verifique os registros pendentes acima.`);
      return false;
    }

    // Validações específicas por tipo de combustível (como no FormMapaDoVeiculo)
    const litros = parseFloat(formData.litros);
    const valor = formatToFloat(formData.valor);
    const tipoCombustivel = formData.tipoCombustivel;

    if (tipoCombustivel === 'DIESEL' && litros > 500) {
      setErro('Verifique a quantidade de litros para DIESEL, respeitando a casa decimal. ex: 00.00');
      return false;
    }

    if (tipoCombustivel === 'ARLA' && litros > 90) {
      setErro('Verifique a quantidade de litros para ARLA, respeitando a casa decimal. ex: 00.00');
      return false;
    }

    if (tipoCombustivel === 'GASOLINA' && litros > 99) {
      setErro('Verifique a quantidade de litros para GASOLINA, respeitando a casa decimal. ex: 00.00');
      return false;
    }

    if (tipoCombustivel === 'GASOLINA' && valor > 500) {
      setErro('Verifique o valor para GASOLINA, respeitando a casa decimal. ex: 0,00');
      return false;
    }

    if (tipoCombustivel === 'DIESEL' && valor > 1100) {
      setErro('Verifique o valor para DIESEL, respeitando a casa decimal. ex: 0,00');
      return false;
    }

    if (tipoCombustivel === 'ARLA' && valor > 400) {
      setErro('Verifique o valor para ARLA, respeitando a casa decimal. ex: 0,00');
      return false;
    }

    return true;
  };

  // Salvar abastecimento offline
  const salvarOffline = async (): Promise<boolean> => {
    try {
      if (!veiculoAtivo) {
        setErro('Nenhum veículo ativo encontrado');
        return false;
      }

      // Formatar valores antes de salvar
      const kmAtualFormatado = formatDecimal(formData.kmAtual);
      const litrosFormatado = parseFloat(formData.litros);
      const valorFormatado = formatToFloat(formData.valor);

      const abastecimento: AbastecimentoOffline = {
        id: `offline_${Date.now()}`,
        veiculo: {
          placa: veiculoAtivo.placa,
          modelo: veiculoAtivo.modelo,
          combustivel: veiculoAtivo.combustivel,
          motorista: veiculoAtivo.motorista,
          lotacao: veiculoAtivo.lotacao,
          tipo: veiculoAtivo.tipo
        },
        dadosAbastecimento: {
          ...formData,
          kmAtual: kmAtualFormatado,
          litros: litrosFormatado.toString(),
          valor: valorFormatado.toString()
        },
        dataHora: new Date().toISOString(),
        dataHoraFormatada: new Date().toLocaleString('pt-BR'),
        status: 'pendente_sincronizacao'
      };

      // Buscar abastecimentos salvos anteriormente
      const abastecimentosSalvos = JSON.parse(
        localStorage.getItem('abastecimentos_offline') || '[]'
      );

      // Adicionar novo abastecimento
      abastecimentosSalvos.push(abastecimento);

      // Salvar no localStorage
      localStorage.setItem('abastecimentos_offline', JSON.stringify(abastecimentosSalvos));

      // Atualizar estado local
      const abastecimentosDoVeiculo = (abastecimentosSalvos as AbastecimentoOffline[]).filter(
        (ab: AbastecimentoOffline) => ab.veiculo?.placa === veiculoAtivo?.placa
      );
      setAbastecimentosOffline(abastecimentosDoVeiculo);
      
      // Definir como último registro para mostrar detalhes
      setUltimoRegistro(abastecimento);
      setMostrarUltimoRegistro(true);

      console.log('✅ Abastecimento salvo offline:', abastecimento);
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar offline:', error);
      return false;
    }
  };

  // Enviar abastecimento online
  const enviarOnline = async (): Promise<boolean> => {
    try {
      const user = getUserLocalStorage();
      if (!user?.token) {
        console.error('❌ Token do usuário não encontrado');
        setErro('Token de autenticação não encontrado. Faça login novamente.');
        return false;
      }

      // Formatar valores antes de enviar
      const kmAtualFormatado = formatDecimal(formData.kmAtual);
      const litrosFormatado = parseFloat(formData.litros);
      const valorFormatado = formatToFloat(formData.valor);

      // Preparar payload conforme a API espera
      const payload = {
        placa: veiculoAtivo?.placa,
        modelo: veiculoAtivo?.modelo,
        data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        km: parseFloat(kmAtualFormatado || '0'),
        combustivel: formData.tipoCombustivel,
        litros: litrosFormatado,
        valor: valorFormatado,
        observacoes: formData.observacoes || '',
        motorista: veiculoAtivo?.motorista,
        cpfMotorista: user.cpf,
        acessadoPor: "ROLE_MOTORISTA",
        lotacao: veiculoAtivo?.lotacao || ''
      };

      console.log('📤 Enviando abastecimento online:', payload);

      const response = await axiosInstance.post('/abastecimento-veiculos', payload, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        console.log('✅ Abastecimento enviado online com sucesso');
        return true;
      } else {
        console.error('❌ Erro na resposta da API:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao enviar online:', error);
      return false;
    }
  };

  // Remover abastecimento offline
  const removerAbastecimentoOffline = (id: string) => {
    try {
      const abastecimentosSalvos = JSON.parse(
        localStorage.getItem('abastecimentos_offline') || '[]'
      ) as AbastecimentoOffline[];

      const abastecimentosAtualizados = abastecimentosSalvos.filter(
        (abastecimento: AbastecimentoOffline) => abastecimento.id !== id
      );

      localStorage.setItem('abastecimentos_offline', JSON.stringify(abastecimentosAtualizados));

      // Atualizar estado local
      const abastecimentosDoVeiculo = abastecimentosAtualizados.filter(
        (ab: AbastecimentoOffline) => ab.veiculo?.placa === veiculoAtivo?.placa
      );
      setAbastecimentosOffline(abastecimentosDoVeiculo);
      
      // Se removeu o último registro, ocultar os detalhes
      if (ultimoRegistro?.id === id) {
        setUltimoRegistro(null);
        setMostrarUltimoRegistro(false);
      }

      setMensagem('Registro removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover abastecimento:', error);
      setErro('Erro ao remover registro');
    }
  };

  // Handler do submit do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    setMensagem('');
    setErro('');

    try {
      let sucesso = false;

      if (isOnline) {
        // Tentar enviar online primeiro
        sucesso = await enviarOnline();
        
        if (sucesso) {
          setMensagem('Abastecimento registrado com sucesso!');
          // Limpar formulário
          setFormData({
            kmAtual: '',
            litros: '',
            valor: '',
            observacoes: '',
            tipoCombustivel: veiculoAtivo?.combustivel || ''
          });
        } else {
          // Se falhar online, salvar offline como fallback
          sucesso = await salvarOffline();
          if (sucesso) {
            setMensagem('Conexão instável. Abastecimento salvo localmente e será enviado quando a conexão estiver estável.');
            // Limpar formulário
            setFormData({
              kmAtual: '',
              litros: '',
              valor: '',
              observacoes: '',
              tipoCombustivel: veiculoAtivo?.combustivel || ''
            });
          }
        }
      } else {
        // Salvar offline
        sucesso = await salvarOffline();
        if (sucesso) {
          setMensagem('Abastecimento salvo offline! Será enviado automaticamente quando a conexão for restaurada.');
          // Limpar formulário
          setFormData({
            kmAtual: '',
            litros: '',
            valor: '',
            observacoes: '',
            tipoCombustivel: veiculoAtivo?.combustivel || ''
          });
        }
      }

      if (!sucesso) {
        setErro('Erro ao salvar abastecimento. Tente novamente.');
      }

    } catch (error) {
      console.error('Erro no submit:', error);
      setErro('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Renderização condicional
  if (veiculoCarregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando dados do veículo...</p>
        </div>
      </div>
    );
  }

  if (!veiculoAtivo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <AlertTriangle className="w-12 h-12 text-yellow-600" />
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                Nenhum Veículo Ativo
              </h1>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="text-center space-y-4">
                <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    Como usar o sistema offline?
                  </h3>
                  <div className="text-yellow-700 dark:text-yellow-300 space-y-2 text-left">
                    <p className="flex items-start">
                      <span className="font-bold mr-2">1.</span>
                      Acesse o sistema principal e faça login
                    </p>
                    <p className="flex items-start">
                      <span className="font-bold mr-2">2.</span>
                      Abra um <strong>Mapa do Veículo</strong> para o veículo que deseja abastecer
                    </p>
                    <p className="flex items-start">
                      <span className="font-bold mr-2">3.</span>
                      Após abrir o mapa, volte para esta tela offline
                    </p>
                    <p className="flex items-start">
                      <span className="font-bold mr-2">4.</span>
                      Os dados do veículo estarão disponíveis para registro offline
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <a
                    href="/dashboard"
                    className="block bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Car className="w-6 h-6 text-orange-600" />
                      <div>
                        <div className="font-semibold text-orange-800 dark:text-orange-200">
                          Acessar Dashboard
                        </div>
                        <div className="text-sm text-orange-600 dark:text-orange-300">
                          Para abrir mapa do veículo
                        </div>
                      </div>
                    </div>
                  </a>

                  <button
                    onClick={() => window.location.reload()}
                    className="block bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="font-semibold text-blue-800 dark:text-blue-200">
                          Atualizar Página
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-300">
                          Verificar dados novamente
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Fuel className="w-12 h-12 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Abastecimento Offline
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Registre abastecimentos mesmo sem internet
          </p>
        </div>

        {/* Banner informativo sobre redirecionamento */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className={`rounded-lg p-4 border transition-all duration-300 ${
            isOnline 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          }`}>
            <div className="flex items-start space-x-3">
              {isOnline ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <WifiOff className="w-5 h-5 text-blue-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${
                  isOnline 
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-blue-800 dark:text-blue-200'
                }`}>
                  {isOnline ? 'Conectado!' : 'Modo Offline Ativo'}
                </h3>
                <p className={`text-sm ${
                  isOnline 
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-blue-700 dark:text-blue-300'
                }`}>
                  {isOnline 
                    ? 'Você pode voltar ao dashboard clicando no botão abaixo ou os dados serão enviados diretamente ao servidor.'
                    : 'Você foi redirecionado automaticamente para esta página porque não há conexão com a internet. Os dados serão salvos localmente e sincronizados automaticamente quando a conexão for restaurada.'
                  }
                </p>
                {isOnline && (
                  <div className="mt-3">
                    <button
                      onClick={() => window.location.href = '/'}
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                      </svg>
                      Voltar ao Dashboard
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status de conexão */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <OfflineStatus mostrarDetalhes={true} />
          </div>
        </div>

        {/* Informações do veículo ativo */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Veículo Ativo
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Car className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">Placa:</span>
                <span className="font-semibold text-gray-800 dark:text-white">{veiculoAtivo.placa}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-gray-600 dark:text-gray-300">Modelo:</span>
                <span className="font-semibold text-gray-800 dark:text-white">{veiculoAtivo.modelo}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Fuel className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">Combustível:</span>
                <span className="font-semibold text-gray-800 dark:text-white">{veiculoAtivo.combustivel}</span>
              </div>

              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">Lotação:</span>
                <span className="font-semibold text-gray-800 dark:text-white">{veiculoAtivo.lotacao}</span>
              </div>

              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">Motorista:</span>
                <span className="font-semibold text-gray-800 dark:text-white">{veiculoAtivo.motorista}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">Mapa aberto:</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {veiculoAtivo.dataAberturaMapa} às {veiculoAtivo.horaAberturaMapa}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Último registro salvo offline */}
        {mostrarUltimoRegistro && ultimoRegistro && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-green-800 dark:text-green-200">
                    Registro Salvo com Sucesso!
                  </h2>
                </div>
                <button
                  onClick={() => setMostrarUltimoRegistro(false)}
                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Detalhes do Abastecimento
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">KM:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {ultimoRegistro.dadosAbastecimento.kmAtual}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Fuel className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">Combustível:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {ultimoRegistro.dadosAbastecimento.tipoCombustivel || ultimoRegistro.veiculo?.combustivel}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Fuel className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">Litros:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {ultimoRegistro.dadosAbastecimento.litros} L
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-gray-300">Valor:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      R$ {ultimoRegistro.dadosAbastecimento.valor}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 md:col-span-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">Registrado:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {ultimoRegistro.dataHoraFormatada}
                    </span>
                  </div>
                </div>

                {ultimoRegistro.dadosAbastecimento.observacoes && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-gray-600 dark:text-gray-300 text-sm">Observações:</span>
                    <p className="text-gray-800 dark:text-white mt-1">
                      {ultimoRegistro.dadosAbastecimento.observacoes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex-1">
                  <div className="flex items-center text-blue-800 dark:text-blue-200">
                    <WifiOff className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      Dados salvos localmente - Serão enviados quando houver conexão
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removerAbastecimentoOffline(ultimoRegistro.id)}
                  className="bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 
                           border border-red-200 dark:border-red-800 rounded-lg p-3 
                           text-red-800 dark:text-red-200 flex items-center justify-center space-x-2
                           transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Remover Registro</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de registros offline anteriores */}
        {abastecimentosOffline.length > 0 && !mostrarUltimoRegistro && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200">
                    Registros Pendentes ({abastecimentosOffline.length})
                  </h2>
                </div>
                
                {/* Botão de sincronização manual */}
                {isOnline && (
                  <button
                    onClick={sincronizarAutomaticamente}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg 
                             flex items-center space-x-2 transition-colors text-sm font-medium"
                  >
                    <Send className="w-4 h-4" />
                    <span>Sincronizar Agora</span>
                  </button>
                )}
                
                {!isOnline && (
                  <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                                rounded-lg px-3 py-2 flex items-center space-x-2">
                    <WifiOff className="w-4 h-4 text-red-600" />
                    <span className="text-red-600 dark:text-red-400 text-sm font-medium">Sem conexão</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {abastecimentosOffline.map((registro) => (
                  <div key={registro.id} className={`bg-white dark:bg-gray-800 rounded-lg p-4 border ${
                    registro.status === 'sincronizado' 
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        {/* Indicador de status */}
                        <div className="flex items-center space-x-2">
                          {registro.status === 'sincronizado' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          )}
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            registro.status === 'sincronizado' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                          }`}>
                            {registro.status === 'sincronizado' ? 'Sincronizado' : 'Pendente'}
                          </span>
                        </div>
                        
                        <span className="font-medium text-gray-800 dark:text-white">
                          KM: {registro.dadosAbastecimento.kmAtual}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {registro.dadosAbastecimento.tipoCombustivel || registro.veiculo?.combustivel}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {registro.dadosAbastecimento.litros}L
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">
                          R$ {registro.dadosAbastecimento.valor}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {registro.dataHoraFormatada}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {registro.status === 'sincronizado' && registro.dataHoraSincronizacao && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            Sync: {new Date(registro.dataHoraSincronizacao).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                        
                        <button
                          onClick={() => removerAbastecimentoOffline(registro.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                <div className="flex items-center text-blue-800 dark:text-blue-200">
                  <WifiOff className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    Estes registros serão enviados automaticamente quando a conexão for restaurada
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Histórico de Abastecimentos Online */}
        {historicoAbastecimentos.length > 0 && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Fuel className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-indigo-800 dark:text-indigo-200">
                  Últimos Abastecimentos Online
                </h2>
              </div>

              <div className="space-y-3">
                {historicoAbastecimentos.map((historico) => (
                  <div key={historico.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="font-medium text-indigo-800 dark:text-indigo-200">
                          KM: {historico.km}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {historico.combustivel}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {historico.litros}L
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">
                          R$ {historico.valor}
                        </span>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {historico.data} {historico.hora}
                      </span>
                    </div>
                    {historico.observacoes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {historico.observacoes}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded">
                <div className="flex items-center text-indigo-800 dark:text-indigo-200">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    Últimos registros salvos online no sistema
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {carregandoHistorico && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                <span className="text-gray-600 dark:text-gray-300">Carregando histórico...</span>
              </div>
            </div>
          </div>
        )}

        {/* Formulário */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Fuel className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Dados do Abastecimento
                </h2>
              </div>

              {/* Tipo de Combustível - Só editável se for DIESEL */}
              {veiculoAtivo.combustivel === 'DIESEL' && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Fuel className="w-4 h-4 inline mr-2" />
                    Tipo de Combustível *
                  </label>
                  <select
                    name="tipoCombustivel"
                    value={formData.tipoCombustivel}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700
                             border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="DIESEL">DIESEL</option>
                    <option value="ARLA">ARLA</option>
                  </select>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    💡 Veículo DIESEL pode abastecer DIESEL ou ARLA (aditivo)
                  </p>
                </div>
              )}

              {/* Se não for DIESEL, mostrar apenas informativo */}
              {veiculoAtivo.combustivel !== 'DIESEL' && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Fuel className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">Tipo de Combustível:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {veiculoAtivo.combustivel}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Tipo fixo conforme especificação do veículo
                  </p>
                </div>
              )}

              {/* KM Atual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  KM Atual *
                </label>
                <input
                  type="text"
                  name="kmAtual"
                  value={formData.kmAtual}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700
                           border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="305.5"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  KM inicial do mapa: {veiculoAtivo.kmInicioMapa} - Deve ser maior que este valor
                </p>
              </div>

              {/* Litros e Valor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Fuel className="w-4 h-4 inline mr-2" />
                    Litros *
                  </label>
                  <input
                    type="text"
                    name="litros"
                    value={formData.litros}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700
                             border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="55.50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor (R$) *
                  </label>
                  <input
                    type="text"
                    name="valor"
                    value={formData.valor}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700
                             border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="350,75"
                    required
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700
                           border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Observações adicionais (opcional)"
                />
              </div>

              {/* Mensagens */}
              {erro && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-100 px-4 py-3 rounded-md">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {erro}
                  </div>
                </div>
              )}

              {mensagem && (
                <div className="bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-100 px-4 py-3 rounded-md">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {mensagem}
                  </div>
                </div>
              )}

              {/* Botão Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center space-x-2 px-6 py-3
                         font-medium rounded-md transition-colors
                         ${loading 
                           ? 'bg-gray-400 cursor-not-allowed' 
                           : isOnline 
                           ? 'bg-green-600 hover:bg-green-700 text-white' 
                           : 'bg-orange-600 hover:bg-orange-700 text-white'
                         }`}
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isOnline ? (
                  <>
                    <Send className="w-5 h-5" />
                    <span>{loading ? 'Enviando...' : 'Registrar Online'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{loading ? 'Salvando...' : 'Salvar Offline'}</span>
                  </>
                )}
              </button>

              {/* Informação sobre dados offline */}
              {!isOnline && (
                <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-md p-4">
                  <div className="flex items-center text-blue-800 dark:text-blue-200">
                    <WifiOff className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      Modo offline ativo. Os dados serão enviados automaticamente quando a conexão for restaurada.
                    </span>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center mt-8 text-gray-600 dark:text-gray-400">
          <p>Sistema de Abastecimento - Prefeitura de Vitória</p>
          <p className="text-sm">Funciona online e offline</p>
        </div>
      </div>
    </div>
  );
};

export default AbastecimentoOfflinePage;
