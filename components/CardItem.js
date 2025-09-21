import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import ImageDownloadService from '../services/ImageDownloadService';
import TCGdexService from '../services/TCGdexService';
import CurrencyService from '../services/CurrencyService';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

const CardItem = ({ card, onPress }) => {
  const [imageError, setImageError] = useState(false);
  const [localImagePath, setLocalImagePath] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [priceInfo, setPriceInfo] = useState(null);
  
  // Debug: mostrar informações da carta
  console.log('🔍 Carta recebida:', {
    name: card.name,
    rarity: card.rarity,
    category: card.category,
    hp: card.hp,
    types: card.types,
    stage: card.stage,
    suffix: card.suffix,
    dexId: card.dexId,
    illustrator: card.illustrator
  });
  
  const remoteImageUrl = TCGdexService.getImageURL(card, 'high', 'png');

  useEffect(() => {
    loadLocalImage();
    loadPriceInfo();
  }, [card.id]);

  const loadLocalImage = async () => {
    try {
      const localPath = await ImageDownloadService.getLocalImagePath(card.id, card.set.id);
      if (localPath) {
        setLocalImagePath(localPath);
      }
    } catch (error) {
      console.error('Erro ao carregar imagem local:', error);
    } finally {
      setImageLoading(false);
    }
  };

  const loadPriceInfo = async () => {
    try {
      // Verificar se a carta tem informações de preço da API
      if (card.pricing && card.pricing.cardmarket && card.pricing.cardmarket.avg) {
        // Converter EUR para USD (taxa aproximada 1 EUR = 1.1 USD)
        const priceEUR = parseFloat(card.pricing.cardmarket.avg);
        const priceUSD = priceEUR * 1.1; // Conversão EUR -> USD
        
        const priceData = await CurrencyService.formatPrice(priceUSD);
        setPriceInfo(priceData);
        console.log('💰 Preço real da API:', priceEUR, 'EUR →', priceUSD, 'USD');
      } else {
        // Se não tem preço na API, não mostrar preço
        console.log('⚠️ Carta sem informações de preço na API:', card.name);
        setPriceInfo(null);
      }
    } catch (error) {
      console.error('Erro ao carregar preço:', error);
      setPriceInfo(null);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Raro':
        return '#FFD700'; // Dourado
      case 'Incomum':
        return '#C0C0C0'; // Prata
      case 'Comum':
        return '#CD7F32'; // Bronze
      case 'Raro Holo':
        return '#FF6B6B'; // Vermelho
      case 'Raro Ultra':
        return '#9C27B0'; // Roxo
      case 'Raro Secreto':
        return '#E91E63'; // Rosa
      default:
        return '#90A4AE'; // Cinza
    }
  };


  const renderImage = () => {
    // Priorizar imagem local se disponível
    const imageSource = localImagePath 
      ? { uri: localImagePath }
      : { uri: remoteImageUrl };

    return (
      <Image
        source={imageSource}
        style={styles.cardImage}
        resizeMode="contain"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(card)}>
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>📱</Text>
          </View>
        )}
        
        {imageError ? (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>🃏</Text>
            <Text style={styles.placeholderSubtext}>
              {localImagePath ? 'Imagem local não encontrada' : 'Imagem não disponível'}
            </Text>
          </View>
        ) : (
          renderImage()
        )}
        
        {localImagePath && (
          <View style={styles.localBadge}>
            <Text style={styles.localBadgeText}>📱</Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardInfo}>
        {/* Nome | Número */}
        <View style={styles.headerInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {card.name}
          </Text>
          <Text style={styles.cardNumber}>
            {card.localId}/{card.set?.cardCount?.total || '?'}
          </Text>
        </View>
        
        {/* Raridade */}
        {card.rarity && (
          <View style={styles.rarityContainer}>
            <Text style={styles.rarityLabel}>Raridade:</Text>
            <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(card.rarity) }]}>
              <Text style={styles.rarityBadgeText}>{card.rarity}</Text>
            </View>
          </View>
        )}
        
        {/* Tipo */}
        {card.types && card.types.length > 0 && (
          <Text style={styles.typeText}>
            Tipo: {card.types.join(', ')}
          </Text>
        )}
        
        {/* Preço */}
        {priceInfo && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>
              Preço: {priceInfo.display}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    height: cardWidth * 1.4,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 32,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  localBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localBadgeText: {
    fontSize: 12,
    color: '#fff',
  },
  cardInfo: {
    padding: 12,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  cardNumber: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rarityLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    marginRight: 8,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rarityBadgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  typeText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  priceContainer: {
    marginTop: 4,
  },
  priceText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default CardItem;