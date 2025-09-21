import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import SetItem from '../components/SetItem';
import DownloadStats from '../components/DownloadStats';
import TCGdexService from '../services/TCGdexService';

const SetsScreen = ({ navigation, route }) => {
  const { seriesId, seriesName } = route.params;
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: seriesName || 'Expansões' });
    loadSets();
  }, [seriesId]);

  const loadSets = async () => {
    try {
      setLoading(true);
      console.log('🔍 Carregando expansões da série:', seriesName);
      
      const setsData = await TCGdexService.getSetsBySeries(seriesId);
      
      console.log('📊 Dados recebidos:', setsData.length, 'expansões');
      
      setSets(setsData);
    } catch (error) {
      console.error('Erro ao carregar coleções:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar as coleções. Verifique sua conexão com a internet.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSets();
    setRefreshing(false);
  };

  const handleSetPress = (set) => {
    console.log('Navegando para coleção:', set.name);
    navigation.navigate('Cards', { setId: set.id, setName: set.name });
  };

  const renderSetItem = ({ item }) => (
    <SetItem set={item} onPress={handleSetPress} />
  );

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
      <View style={styles.header}>
        <Text style={styles.title}>Coleções Pokemon TCG</Text>
        <Text style={styles.subtitle}>
          {sets.length} coleções disponíveis
        </Text>
      </View>

      <DownloadStats />
      
      <FlatList
        data={sets}
        renderItem={renderSetItem}
        keyExtractor={(item) => item.id}
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 20,
  },
});

export default SetsScreen;