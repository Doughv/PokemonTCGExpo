// Importar polyfills primeiro
import '../polyfills';
import TCGdex from '@tcgdex/sdk';

// Polyfill robusto para APIs do navegador no React Native
if (typeof global !== 'undefined') {
  // Garantir que window existe
  if (typeof global.window === 'undefined') {
    global.window = {};
  }
  
  // Polyfill para calSage (erro específico do SDK)
  if (typeof global.window.calSage === 'undefined') {
    global.window.calSage = undefined;
  }
  
  // Polyfill para sessionStorage
  if (typeof global.window.sessionStorage === 'undefined') {
    global.window.sessionStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0
    };
  }
  
  // Polyfill para localStorage se necessário
  if (typeof global.window.localStorage === 'undefined') {
    global.window.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0
    };
  }
}

class TCGdexService {
  constructor(language = 'pt') {
    this.language = language;
    try {
      this.tcgdex = new tcgdex(language);
      console.log('✅ SDK TCGdex inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar SDK TCGdex:', error);
      this.tcgdex = null;
    }
  }

  // Usar a propriedade image da carta ou construir URL manualmente
  getImageURL(card, quality = 'high', extension = 'png') {
    try {
      console.log('🔍 Debug getImageURL:', {
        cardName: card.name,
        cardId: card.id,
        hasImage: !!card.image,
        imageValue: card.image
      });
      
      // Se a carta já tem uma propriedade image, usar ela
      if (card && card.image) {
        // Verificar se a URL já tem qualidade e extensão
        let imageUrl = card.image;
        if (!imageUrl.includes('/high.webp') && !imageUrl.includes('/medium.webp') && !imageUrl.includes('/low.webp')) {
          // Adicionar qualidade e extensão se não tiver
          imageUrl = imageUrl.endsWith('/') ? imageUrl : imageUrl + '/';
          imageUrl += `${quality}.webp`;
        }
        console.log('✅ Usando image da carta:', imageUrl);
        return imageUrl;
      }
      
      // Se tem método getImageURL do SDK, usar ele
      if (card && typeof card.getImageURL === 'function') {
        const url = card.getImageURL(quality, extension);
        console.log('✅ URL do SDK:', url);
        return url;
      }
      
      // Fallback: construir URL manualmente
      const setId = card.set?.id || card.id?.split('-')[0] || 'sv01';
      const cardNumber = card.localId || card.number || '1';
      const manualUrl = `https://assets.tcgdex.net/pt/sv/${setId}/${cardNumber}/${quality}.webp`;
      console.log('🔧 URL manual:', manualUrl);
      return manualUrl;
    } catch (error) {
      console.error('Erro ao obter URL da imagem:', error);
      // Fallback para URL manual
      const setId = card.set?.id || card.id?.split('-')[0] || 'sv01';
      const cardNumber = card.localId || card.number || '1';
      return `https://assets.tcgdex.net/pt/sv/${setId}/${cardNumber}/${quality}.webp`;
    }
  }

  // Método para compatibilidade com o código existente
  getImageUrl(card, quality = 'high', extension = 'png') {
    return this.getImageURL(card, quality, extension);
  }

  // Usar o método card.get() do SDK oficial
  async getCard(cardId) {
    try {
      console.log(`Buscando carta: ${cardId}`);
      const card = await this.tcgdex.card.get(cardId);
      console.log('Carta encontrada:', card.name);
      return card;
    } catch (error) {
      console.error('Erro ao buscar carta:', error);
      throw error;
    }
  }

  // Usar o método set.get() do SDK oficial
  async getSet(setId) {
    try {
      console.log(`Buscando coleção: ${setId}`);
      const set = await this.tcgdex.set.get(setId);
      console.log('Coleção encontrada:', set.name);
      return set;
    } catch (error) {
      console.error('Erro ao buscar coleção:', error);
      throw error;
    }
  }

  // Buscar todas as séries/coleções
  async getSeries() {
    try {
      console.log('🔍 Buscando séries...');
      const response = await fetch('https://api.tcgdex.net/v2/pt/series');
      const series = await response.json();
      
      console.log('✅ Séries encontradas:', series.length);
      return series;
    } catch (error) {
      console.error('❌ Erro ao buscar séries:', error);
      throw error;
    }
  }

  // Buscar todas as expansões/sets
  async getSets() {
    try {
      console.log('🔍 Buscando expansões...');
      const response = await fetch('https://api.tcgdex.net/v2/pt/sets');
      const sets = await response.json();
      
      // Filtrar apenas expansões com cartas em português
      const filteredSets = sets.filter(set => 
        set.cardCount && set.cardCount.total > 0
      );
      
      // Ordenar por data de lançamento (mais recentes primeiro)
      filteredSets.sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0));
      
      console.log('✅ Expansões encontradas:', filteredSets.length);
      return filteredSets;
    } catch (error) {
      console.error('❌ Erro ao buscar expansões:', error);
      throw error;
    }
  }

  // Buscar expansões de uma série específica
  async getSetsBySeries(seriesId) {
    try {
      console.log('🔍 Buscando expansões da série:', seriesId);
      const allSets = await this.getSets();
      
      // Filtrar expansões que pertencem à série
      const seriesSets = allSets.filter(set => {
        // Verificar se o ID da expansão começa com o ID da série
        return set.id.startsWith(seriesId);
      });
      
      console.log(`✅ Expansões da série ${seriesId}:`, seriesSets.length);
      return seriesSets;
    } catch (error) {
      console.error('❌ Erro ao buscar expansões da série:', error);
      throw error;
    }
  }

  // Buscar cartas de uma coleção específica usando a API correta
  async getCardsBySet(setId) {
    try {
      console.log('Buscando cartas da coleção:', setId);
      
      // Buscar todas as cartas e filtrar por coleção
      const response = await fetch('https://api.tcgdex.net/v2/pt/cards');
      const allCards = await response.json();
      
      console.log('Total de cartas encontradas:', allCards.length);
      
      // Filtrar apenas cartas da coleção específica
      const filteredCards = allCards.filter(card => {
        const cardId = card.id || '';
        return cardId.startsWith(setId + '-');
      });
      
      console.log(`Cartas da coleção ${setId}:`, filteredCards.length);
      
      // Buscar dados completos de cada carta
      const cardsWithDetails = await Promise.all(
        filteredCards.slice(0, 50).map(async (card) => {
          try {
            const cardResponse = await fetch(`https://api.tcgdex.net/v2/pt/cards/${card.id}`);
            const cardDetails = await cardResponse.json();
            return cardDetails;
          } catch (error) {
            console.error(`Erro ao buscar detalhes da carta ${card.id}:`, error);
            return card; // Retornar dados básicos se falhar
          }
        })
      );
      
      console.log('Cartas com detalhes completos:', cardsWithDetails.length);
      return cardsWithDetails;
      
    } catch (error) {
      console.error('Erro ao buscar cartas da coleção:', error);
      console.error('Detalhes do erro:', error.message);
      throw error;
    }
  }

  // Obter URL da imagem da carta em português
  getCardImageUrl(cardId, setId, imageType = 'high') {
    return `https://assets.tcgdex.net/pt/${setId}/${cardId}/${imageType}.webp`;
  }

  // Obter URL da imagem da carta em alta resolução
  getCardImageUrlHigh(cardId, setId) {
    return this.getCardImageUrl(cardId, setId, 'high');
  }

  // Obter URL da imagem da carta em baixa resolução
  getCardImageUrlLow(cardId, setId) {
    return this.getCardImageUrl(cardId, setId, 'low');
  }
}

// Criar instância única do serviço
const tcgdexService = new TCGdexService('pt');

export default tcgdexService;