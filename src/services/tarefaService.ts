import axiosInstance from './axiosInstance';
import { Tarefa, Subtarefa, StatusTarefa } from '@/types';

export const tarefaService = {
  // Criar nova tarefa
  async criar(tarefa: Partial<Tarefa>): Promise<Tarefa> {
    const response = await axiosInstance.post('/api/tarefas', tarefa);
    return response.data;
  },

  // Buscar tarefas do usuário
  async buscarPorUsuario(email: string): Promise<Tarefa[]> {
    const response = await axiosInstance.get('/api/tarefas/usuario', {
      params: { email }
    });
    return response.data;
  },

  // Buscar tarefas criadas (admin)
  async buscarCriadasPor(email: string): Promise<Tarefa[]> {
    const response = await axiosInstance.get('/api/tarefas/criadas-por', {
      params: { email }
    });
    return response.data;
  },

  // Buscar por status
  async buscarPorStatus(email: string, status: StatusTarefa): Promise<Tarefa[]> {
    const response = await axiosInstance.get('/api/tarefas/usuario/status', {
      params: { email, status }
    });
    return response.data;
  },

  // Buscar tarefas vencidas
  async buscarVencidas(email: string): Promise<Tarefa[]> {
    const response = await axiosInstance.get('/api/tarefas/usuario/vencidas', {
      params: { email }
    });
    return response.data;
  },

  // Buscar por ID
  async buscarPorId(id: number): Promise<Tarefa> {
    const response = await axiosInstance.get(`/api/tarefas/${id}`);
    return response.data;
  },

  // Atualizar tarefa
  async atualizar(id: number, tarefa: Partial<Tarefa>): Promise<Tarefa> {
    const response = await axiosInstance.put(`/api/tarefas/${id}`, tarefa);
    return response.data;
  },

  // Atualizar status
  async atualizarStatus(id: number, status: StatusTarefa): Promise<Tarefa> {
    const response = await axiosInstance.patch(`/api/tarefas/${id}/status`, { status });
    return response.data;
  },

  // Marcar subtarefa como concluída
  async marcarSubtarefa(tarefaId: number, subtarefaId: number, usuario: string): Promise<Tarefa> {
    const response = await axiosInstance.patch(
      `/api/tarefas/${tarefaId}/subtarefas/${subtarefaId}/concluir`,
      { usuario }
    );
    return response.data;
  },

  // Desmarcar subtarefa
  async desmarcarSubtarefa(tarefaId: number, subtarefaId: number): Promise<Tarefa> {
    const response = await axiosInstance.patch(
      `/api/tarefas/${tarefaId}/subtarefas/${subtarefaId}/desmarcar`
    );
    return response.data;
  },

  // Deletar tarefa
  async deletar(id: number): Promise<void> {
    await axiosInstance.delete(`/api/tarefas/${id}`);
  },

  // Buscar todas (admin)
  async buscarTodas(): Promise<Tarefa[]> {
    const response = await axiosInstance.get('/api/tarefas');
    return response.data;
  }
};
