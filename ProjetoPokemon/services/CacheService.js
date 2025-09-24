import AsyncStorage from '@react-native-async-storage/async-storage';

class CacheService {
  constructor() {
    this.cacheKeys = {
      series: 'cached_series',
      sets: 'cached_sets',
      cards: 'cached_cards',
      lastUpdate: 'last_cache_update',
      exchangeRate: 'cached_exchange_rate'
    };
    
    // Duração do cache em milissegundos
    this.cacheDuration = {
      series: 7 * 24 * 60 * 60 * 1000, // 7 dias
      sets: 7 * 24 * 60 * 60 * 1000,    // 7 dias
      cards: 24 * 60 * 60 * 1000,        // 1 dia
      exchangeRate: 24 * 60 * 60 * 1000 // 1 dia
    };
  }

  // Verificar se o cache está válido
  async isCacheValid(key, duration) {
    try {
      const lastUpdate = await AsyncStorage.getItem(`${key}_timestamp`);
      if (!lastUpdate) return false;
      
      const timeDiff = Date.now() - parseInt(lastUpdate);
      return timeDiff < duration;
    } catch (error) {
      console.error('Erro ao verificar validade do cache:', error);
      return false;
    }
  }

  // Salvar dados no cache
  async setCache(key, data) {
    try {
      const timestamp = Date.now().toString();
      await AsyncStorage.setItem(key, JSON.stringify(data));
      await AsyncStorage.setItem(`${key}_timestamp`, timestamp);
      console.log(`✅ Cache salvo: ${key}`);
    } catch (error) {
      console.error(`❌ Erro ao salvar cache ${key}:`, error);
    }
  }

  // Recuperar dados do cache
  async getCache(key) {
    try {
      const cachedData = await AsyncStorage.getItem(key);
      if (cachedData) {
        console.log(`✅ Cache recuperado: ${key}`);
        return JSON.parse(cachedData);
      }
      return null;
    } catch (error) {
      console.error(`❌ Erro ao recuperar cache ${key}:`, error);
      return null;
    }
  }

  // Cache para séries
  async getCachedSeries() {
    const isValid = await this.isCacheValid(this.cacheKeys.series, this.cacheDuration.series);
    if (isValid) {
      return await this.getCache(this.cacheKeys.series);
    }
    return null;
  }

  async setCachedSeries(series) {
    await this.setCache(this.cacheKeys.series, series);
  }

  // Cache para sets/expansões
  async getCachedSets() {
    const isValid = await this.isCacheValid(this.cacheKeys.sets, this.cacheDuration.sets);
    if (isValid) {
      return await this.getCache(this.cacheKeys.sets);
    }
    return null;
  }

  async setCachedSets(sets) {
    await this.setCache(this.cacheKeys.sets, sets);
  }

  // Cache para cartas de um set específico
  async getCachedCards(setId) {
    const key = `${this.cacheKeys.cards}_${setId}`;
    const isValid = await this.isCacheValid(key, this.cacheDuration.cards);
    if (isValid) {
      return await this.getCache(key);
    }
    return null;
  }

  async setCachedCards(setId, cards) {
    const key = `${this.cacheKeys.cards}_${setId}`;
    await this.setCache(key, cards);
  }

  // Cache para taxa de câmbio
  async getCachedExchangeRate() {
    const isValid = await this.isCacheValid(this.cacheKeys.exchangeRate, this.cacheDuration.exchangeRate);
    if (isValid) {
      return await this.getCache(this.cacheKeys.exchangeRate);
    }
    return null;
  }

  async setCachedExchangeRate(rateData) {
    await this.setCache(this.cacheKeys.exchangeRate, rateData);
  }

  // Limpar todo o cache
  async clearAllCache() {
    try {
      const keys = Object.values(this.cacheKeys);
      const allKeys = [];
      
      // Adicionar todas as chaves de cache
      for (const key of keys) {
        allKeys.push(key);
        allKeys.push(`${key}_timestamp`);
      }
      
      // Adicionar chaves de cartas específicas (buscar todas)
      const allStorageKeys = await AsyncStorage.getAllKeys();
      const cardKeys = allStorageKeys.filter(key => key.startsWith(`${this.cacheKeys.cards}_`));
      allKeys.push(...cardKeys);
      
      await AsyncStorage.multiRemove(allKeys);
      console.log('✅ Cache limpo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  }

  // Obter informações do cache
  async getCacheInfo() {
    try {
      const info = {};
      
      for (const [name, key] of Object.entries(this.cacheKeys)) {
        const timestamp = await AsyncStorage.getItem(`${key}_timestamp`);
        if (timestamp) {
          const age = Date.now() - parseInt(timestamp);
          const ageHours = Math.floor(age / (1000 * 60 * 60));
          info[name] = {
            exists: true,
            ageHours: ageHours,
            isValid: age < this.cacheDuration[name] || this.cacheDuration[name] === undefined
          };
        } else {
          info[name] = { exists: false };
        }
      }
      
      return info;
    } catch (error) {
      console.error('❌ Erro ao obter informações do cache:', error);
      return {};
    }
  }

  // Forçar atualização do cache
  async forceRefreshCache() {
    await this.clearAllCache();
    console.log('🔄 Cache forçado a atualizar');
  }
}

// Criar instância única do serviço
const cacheService = new CacheService();

export default cacheService;
