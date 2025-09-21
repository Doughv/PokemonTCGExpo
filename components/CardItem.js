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

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

const CardItem = ({ card, onPress }) => {
  const [imageError, setImageError] = useState(false);
  const [localImagePath, setLocalImagePath] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  
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

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Raro': return '#FFD700';
      case 'Incomum': return '#C0C0C0';
      case 'Comum': return '#CD7F32';
      default: return '#888';
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'Fogo': '#FF6B6B',
      'Água': '#4ECDC4',
      'Planta': '#45B7D1',
      'Elétrico': '#FFA726',
      'Lutador': '#FF8A65',
      'Psíquico': '#BA68C8',
      'Incolor': '#90A4AE',
      'Treinador': '#8D6E63',
      'Energia': '#795548'
    };
    return colors[type] || '#90A4AE';
  };

  const renderTypes = () => {
    if (!card.types || card.types.length === 0) return null;
    
    return (
      <View style={styles.typesContainer}>
        {card.types.map((type, index) => (
          <View key={index} style={[styles.typeBadge, { backgroundColor: getTypeColor(type) }]}>
            <Text style={styles.typeText}>{type}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderHP = () => {
    if (!card.hp) return null;
    return (
      <View style={styles.hpContainer}>
        <Text style={styles.hpText}>HP: {card.hp}</Text>
      </View>
    );
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
        {/* Nome e Número */}
        <View style={styles.headerInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {card.name}
            {card.suffix && <Text style={styles.suffix}> {card.suffix}</Text>}
          </Text>
          <Text style={styles.cardNumber}>
            {card.localId}/{card.set?.cardCount?.total || '?'}
          </Text>
        </View>
        
        {/* Stage e DexId */}
        {(card.stage || card.dexId) && (
          <View style={styles.stageRow}>
            {card.stage && (
              <Text style={styles.stageText}>{card.stage}</Text>
            )}
            {card.dexId && card.dexId.length > 0 && (
              <Text style={styles.dexIdText}>#{card.dexId[0]}</Text>
            )}
          </View>
        )}
        
        {/* HP */}
        {renderHP()}
        
        {/* Tipos */}
        {renderTypes()}
        
        {/* Raridade */}
        {card.rarity && (
          <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(card.rarity) }]}>
            <Text style={styles.cardRarity}>{card.rarity}</Text>
          </View>
        )}
        
        {/* Categoria */}
        {card.category && (
          <Text style={styles.cardCategory}>{card.category}</Text>
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
  suffix: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: 'bold',
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
  stageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stageText: {
    fontSize: 11,
    color: '#8E24AA',
    fontWeight: '600',
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dexIdText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hpContainer: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  hpText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 4,
    marginBottom: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  typeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  rarityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  cardRarity: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
  cardCategory: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  evolveFrom: {
    fontSize: 10,
    color: '#8E24AA',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  cardIllustrator: {
    fontSize: 9,
    color: '#999',
    fontStyle: 'italic',
  },
  regulationMark: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
});

export default CardItem;