// src/services/offlineStorage.ts

interface OfflineAbastecimento {
  id: string;
  placa: string;
  modelo: string;
  data: string;
  hora: string;
  km: number;
  combustivel: string;
  litros: number;
  valor: number;
  observacoes: string;
  motorista: string;
  cpfMotorista: string;
  acessadoPor: string;
  lotacao: string;
  timestamp: number; // Para ordenação
  tentativas: number; // Contador de tentativas de envio
}

class OfflineStorageService {
  private dbName = 'FrotaVSAOffline';
  private version = 1;
  private storeName = 'abastecimentos';
  private db: IDBDatabase | null = null;

  // Inicializa o banco IndexedDB
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('placa', 'placa', { unique: false });
        }
      };
    });
  }

  // Salva abastecimento offline
  async salvarAbastecimentoOffline(abastecimento: Omit<OfflineAbastecimento, 'id' | 'timestamp' | 'tentativas'>): Promise<string> {
    if (!this.db) await this.init();

    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const registro: OfflineAbastecimento = {
      ...abastecimento,
      id,
      timestamp: Date.now(),
      tentativas: 0
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(registro);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  // Lista todos os abastecimentos offline
  async listarAbastecimentosOffline(): Promise<OfflineAbastecimento[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Remove abastecimento após sincronização
  async removerAbastecimentoOffline(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Atualiza contador de tentativas
  async atualizarTentativas(id: string, tentativas: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const registro = getRequest.result;
        if (registro) {
          registro.tentativas = tentativas;
          const putRequest = store.put(registro);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Registro não encontrado'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Limpa registros muito antigos (opcional - limpeza automática)
  async limparRegistrosAntigos(diasMaximos: number = 7): Promise<void> {
    if (!this.db) await this.init();

    const timestampLimite = Date.now() - (diasMaximos * 24 * 60 * 60 * 1000);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(timestampLimite);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineStorageService = new OfflineStorageService();
export type { OfflineAbastecimento };
