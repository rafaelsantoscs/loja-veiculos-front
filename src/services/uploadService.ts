import axiosInstance from './axiosInstance';
import { getUserLocalStorage } from '@/store/userLocalStorage';

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    filename: string;
    originalFilename: string;
    url: string;
    size: number;
  };
}

class UploadService {
  
  // Método auxiliar para obter headers com token
  private getAuthHeaders() {
    const user = getUserLocalStorage();
    return {
      'Authorization': `Bearer ${user?.token}`,
    };
  }
  
  // Upload de documento para responsável técnico
  async uploadDocumentoResponsavelTecnico(
    file: File, 
    empresaId?: string, 
    cnpjCpf?: string
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Adicionar parâmetros opcionais para incluir no nome do arquivo
      if (empresaId) {
        formData.append('empresaId', empresaId);
      }
      
      if (cnpjCpf) {
        formData.append('cnpjCpf', cnpjCpf);
      }

      const response = await axiosInstance.post('/api/upload/responsavel-tecnico-documento', formData, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return {
        success: true,
        message: response.data.message || 'Arquivo enviado com sucesso',
        data: response.data.data
      };
    } catch (error: unknown) {
      console.error('Erro ao fazer upload do documento:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          return {
            success: false,
            message: axiosError.response.data.message
          };
        }
      }
      
      return {
        success: false,
        message: 'Erro ao enviar arquivo'
      };
    }
  }

  // Deletar documento
  async deleteDocumentoResponsavelTecnico(filename: string): Promise<UploadResponse> {
    try {
      const response = await axiosInstance.delete('/api/upload/responsavel-tecnico-documento', {
        headers: this.getAuthHeaders(),
        params: { filename }
      });
      
      return {
        success: true,
        message: response.data.message || 'Arquivo removido com sucesso'
      };
    } catch (error: unknown) {
      console.error('Erro ao deletar documento:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          return {
            success: false,
            message: axiosError.response.data.message
          };
        }
      }
      
      return {
        success: false,
        message: 'Erro ao remover arquivo'
      };
    }
  }

  // Construir URL completa do arquivo
  getFileUrl(url: string): string {
    if (!url) return '';
    
    // Se já é uma URL completa, retorna como está
    if (url.startsWith('http')) {
      return url;
    }
    
    // Constrói a URL baseada no ambiente usando a mesma base do axiosInstance
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8086/visa-vsa'
      : 'http://localhost:8086/visa-vsa';
    
    // Remove a barra inicial se existir para evitar duplicação
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    
    // Se é apenas o nome do arquivo, usar o endpoint de download
    if (!cleanUrl.includes('/')) {
      return `${baseUrl}/api/upload/responsavel-tecnico-documento/${cleanUrl}`;
    }
    
    return `${baseUrl}/${cleanUrl}`;
  }
}

const uploadService = new UploadService();
export default uploadService;
