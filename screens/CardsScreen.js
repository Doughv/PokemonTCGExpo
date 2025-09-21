import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import CardItem from '../components/CardItem';
import DownloadButton from '../components/DownloadButton';
import TCGdexService from '../services/TCGdexService';

const CardsScreen = ({ route, navigation }) => {
  const { setId, setName } = route.params;
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredCards, setFilteredCards] = useState([]);

  useEffect(() => {
    navigation.setOptions({ title: setName });
    loadCards();
  }, [setId]);

  useEffect(() => {
    filterCards();
  }, [cards, searchText]);

  const loadCards = async () => {
    try {
      setLoading(true);
      console.log('🔍 Carregando cartas da expansão:', setName);
      
      const cardsData = await TCGdexService.getCardsBySet(setId);
      
      // Ordenar cartas por número
      const sortedCards = cardsData.sort((a, b) => {
        const numA = parseInt(a.localId) || 0;
        const numB = parseInt(b.localId) || 0;
        return numA - numB;
      });
      
      // Limitar a 50 cartas para melhor performance
      const limitedCards = sortedCards.slice(0, 50);
      console.log(`Exibindo ${limitedCards.length} de ${sortedCards.length} cartas`);
      
      setCards(limitedCards);
    } catch (error) {
      console.error('Erro ao carregar cartas:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar as cartas desta coleção.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCards();
    setRefreshing(false);
  };

  const filterCards = () => {
    if (!searchText.trim()) {
      setFilteredCards(cards);
    } else {
      const filtered = cards.filter(card =>
        card.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCards(filtered);
    }
  };

  const handleCardPress = (card) => {
    navigation.navigate('CardDetail', { card });
  };

  const handleDownloadComplete = (downloadedSetId) => {
    // Recarregar as cartas para mostrar as imagens baixadas
    loadCards();
  };

  const renderCardItem = ({ item }) => (
    <CardItem card={item} onPress={handleCardPress} />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando cartas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cartas..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchText('')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.header}>
        <Text style={styles.headerText}>
          {filteredCards.length} de {cards.length} cartas
        </Text>
      </View>

      <DownloadButton 
        set={{ id: setId, name: setName }}
        cards={cards}
        onDownloadComplete={handleDownloadComplete}
      />

      <FlatList
        data={filteredCards}
        renderItem={renderCardItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
});

export default CardsScreen;
