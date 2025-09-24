import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import TCGdexService from '../services/TCGdexService';

const { width } = Dimensions.get('window');

const SeriesScreen = ({ navigation }) => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    try {
      setLoading(true);
      console.log('Carregando séries...');
      const seriesData = await TCGdexService.getSeries();
      
      console.log('Dados recebidos:', seriesData.length, 'séries');
      
      // Ordenar por ordem cronológica (mais recentes primeiro)
      const sortedSeries = seriesData.sort((a, b) => {
        const order = ['sv', 'swsh', 'sm', 'xy', 'bw', 'col', 'hgss', 'dp', 'ex', 'base'];
        const aIndex = order.indexOf(a.id);
        const bIndex = order.indexOf(b.id);
        
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        
        return bIndex - aIndex; // Mais recentes primeiro
      });
      
      setSeries(sortedSeries);
      
      if (sortedSeries.length === 0) {
        console.log('Nenhuma série encontrada');
      } else {
        console.log('Séries carregadas:', sortedSeries.map(s => s.name));
      }
    } catch (error) {
      console.error('Erro ao carregar séries:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar as séries. Verifique sua conexão com a internet.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSeries();
    setRefreshing(false);
  };

  const getLogoUrl = (series) => {
    if (!series.logo) return null;
    
    // Se a URL já tem extensão, usar como está
    if (series.logo.includes('.webp') || series.logo.includes('.png') || series.logo.includes('.jpg')) {
      return series.logo;
    }
    
    // Se não tem extensão, adicionar .webp
    return series.logo + '.webp';
  };

  const getLocalLogo = (series) => {
    // Mapeamento de IDs das séries para logos locais
    // Só inclui os logos que realmente existem
    const localLogos = {
      // Adicione aqui os logos que você tiver
      // 'xy': require('../assets/series/xy.png'),
      // 'sm': require('../assets/series/sm.png'),
      // 'swsh': require('../assets/series/swsh.png'),
      // 'sv': require('../assets/series/sv.png'),
      // 'bw': require('../assets/series/bw.png'),
      // 'dp': require('../assets/series/dp.png'),
      // 'ex': require('../assets/series/ex.png'),
      // 'base': require('../assets/series/base.png'),
      // 'col': require('../assets/series/col.png'),
      // 'hgss': require('../assets/series/hgss.png'),
    };
    
    return localLogos[series.id] || null;
  };

  const handleSeriesPress = (series) => {
    navigation.navigate('Sets', { 
      seriesId: series.id, 
      seriesName: series.name 
    });
  };

  const renderSeriesItem = ({ item }) => {
    const itemWidth = (width - 60) / 2;
    
    // Debug para verificar dados da série
    console.log('Série:', item.name, 'Dados:', {
      releaseDate: item.releaseDate,
      release: item.release,
      date: item.date,
      launchDate: item.launchDate
    });
    
    return (
      <TouchableOpacity 
        style={[styles.seriesItem, { width: itemWidth }]} 
        onPress={() => handleSeriesPress(item)}
      >
        <View style={styles.logoContainer}>
          {getLogoUrl(item) ? (
            <Image 
              source={{ uri: getLogoUrl(item) }} 
              style={styles.seriesLogo}
              resizeMode="contain"
            />
          ) : getLocalLogo(item) ? (
            <Image 
              source={getLocalLogo(item)} 
              style={styles.seriesLogo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderLogo}>
              <Text style={styles.placeholderText}>📚</Text>
            </View>
          )}
        </View>
        <View style={styles.seriesInfo}>
          <Text style={styles.seriesName}>{item.name}</Text>
          <Text style={styles.seriesDate}>
            {item.releaseDate || item.release || item.date || item.launchDate 
              ? new Date(item.releaseDate || item.release || item.date || item.launchDate).toLocaleDateString('pt-BR') 
              : 'Data não disponível'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando coleções...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={series}
        renderItem={renderSeriesItem}
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
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 20,
  },
  row: {
    justifyContent: 'center',
    gap: 10,
  },
  seriesItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  logoContainer: {
    width: '100%',
    height: 80,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  seriesLogo: {
    width: '100%',
    height: '100%',
  },
  placeholderLogo: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 8,
  },
  placeholderText: {
    fontSize: 24,
  },
  seriesInfo: {
    alignItems: 'center',
  },
  seriesName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  seriesDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default SeriesScreen;
