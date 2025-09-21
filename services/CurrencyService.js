import CacheService from './CacheService';

class CurrencyService {
  constructor() {
    this.exchangeRate = null;
    this.lastUpdate = null;
    this.cacheDuration = 24 * 60 * 60 * 1000; // 24 horas em ms
  }

  // Buscar taxa de câmbio atual
  async getExchangeRate() {
    try {
      // Tentar buscar do cache primeiro
      const cachedRate = await CacheService.getCachedExchangeRate();
      if (cachedRate) {
        this.exchangeRate = cachedRate.rate;
        this.lastUpdate = cachedRate.timestamp;
        console.log('⚡ Taxa de câmbio carregada do cache:', this.exchangeRate);
        return this.exchangeRate;
      }

      // Verificar se temos uma taxa válida em memória
      if (this.exchangeRate && this.lastUpdate && 
          (Date.now() - this.lastUpdate) < this.cacheDuration) {
        console.log('✅ Usando taxa de câmbio em memória:', this.exchangeRate);
        return this.exchangeRate;
      }

      console.log('🔍 Buscando nova taxa de câmbio...');
      
      // Usar API gratuita para conversão USD -> BRL
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      
      if (data && data.rates && data.rates.BRL) {
        this.exchangeRate = data.rates.BRL;
        this.lastUpdate = Date.now();
        
        // Salvar no cache
        await CacheService.setCachedExchangeRate({
          rate: this.exchangeRate,
          timestamp: this.lastUpdate
        });
        
        console.log('✅ Taxa de câmbio atualizada:', this.exchangeRate);
        return this.exchangeRate;
      } else {
        throw new Error('Resposta inválida da API de câmbio');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar taxa de câmbio:', error);
      
      // Fallback: usar taxa fixa como backup
      this.exchangeRate = 5.20; // Taxa aproximada como fallback
      this.lastUpdate = Date.now();
      
      console.log('⚠️ Usando taxa de fallback:', this.exchangeRate);
      return this.exchangeRate;
    }
  }

  // Converter USD para BRL
  async convertUSDToBRL(usdAmount) {
    try {
      const rate = await this.getExchangeRate();
      const brlAmount = usdAmount * rate;
      
      return {
        usd: usdAmount,
        brl: brlAmount,
        rate: rate,
        formatted: {
          usd: `US$ ${usdAmount.toFixed(2)}`,
          brl: `R$ ${brlAmount.toFixed(2)}`
        }
      };
    } catch (error) {
      console.error('❌ Erro na conversão:', error);
      
      // Fallback com taxa fixa
      const fallbackRate = 5.20;
      const brlAmount = usdAmount * fallbackRate;
      
      return {
        usd: usdAmount,
        brl: brlAmount,
        rate: fallbackRate,
        formatted: {
          usd: `US$ ${usdAmount.toFixed(2)}`,
          brl: `R$ ${brlAmount.toFixed(2)}`
        }
      };
    }
  }

  // Formatar preço com conversão
  async formatPrice(usdAmount) {
    const conversion = await this.convertUSDToBRL(usdAmount);
    
    // Formatação especial para valores pequenos (centavos)
    let usdFormatted, brlFormatted;
    
    if (usdAmount < 1) {
      // Para valores menores que $1, mostrar em centavos
      const cents = Math.round(usdAmount * 100);
      usdFormatted = `US$ 0,${cents.toString().padStart(2, '0')}`;
      brlFormatted = `R$ ${conversion.brl.toFixed(2).replace('.', ',')}`;
    } else {
      usdFormatted = `US$ ${usdAmount.toFixed(2).replace('.', ',')}`;
      brlFormatted = `R$ ${conversion.brl.toFixed(2).replace('.', ',')}`;
    }
    
    return {
      ...conversion,
      display: `${usdFormatted} | ${brlFormatted}`,
      disclaimer: 'Valor em Real é uma conversão direta do Dólar e pode não representar o valor praticado no mercado local.'
    };
  }
}

// Criar instância única do serviço
const currencyService = new CurrencyService();

export default currencyService;
