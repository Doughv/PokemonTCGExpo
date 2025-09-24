import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tcgdexService from '../services/TCGdexService';

const LanguageConfigScreen = ({ navigation, route }) => {
  const { language } = route.params || { language: 'pt' };
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [series, setSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState([]);
  const [expansions, setExpansions] = useState({});
  const [selectedExpansions, setSelectedExpansions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingExpansions, setLoadingExpansions] = useState(false);

  useEffect(() => {
    loadSavedSettings();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      loadSeries();
    }
  }, [selectedLanguage]);

  useEffect(() => {
    if (selectedSeries.length > 0) {
      loadExpansions();
    }
  }, [selectedSeries]);

  const loadSavedSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      const savedSeries = await AsyncStorage.getItem('selectedSeries');
      const savedExpansions = await AsyncStorage.getItem('selectedExpansions');

      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
      if (savedSeries) {
        setSelectedSeries(JSON.parse(savedSeries));
      }
      if (savedExpansions) {
        setSelectedExpansions(JSON.parse(savedExpansions));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações salvas:', error);
    }
  };

  const loadSeries = async () => {
    setLoading(true);
    try {
      // Alterar idioma do serviço
      await tcgdexService.setLanguage(selectedLanguage);
      
      // Buscar séries usando método do serviço
      const seriesData = await tcgdexService.getAllSeries();
      setSeries(seriesData);
      console.log('Séries carregadas:', seriesData.length);
    } catch (error) {
      console.error('Erro ao carregar séries:', error);
      Alert.alert('Erro', 'Não foi possível carregar as séries. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadExpansions = async () => {
    setLoadingExpansions(true);
    try {
      const expansionsData = {};
      
      for (const seriesId of selectedSeries) {
        try {
          const seriesExpansions = await tcgdexService.getSetsBySeries(seriesId);
          expansionsData[seriesId] = seriesExpansions;
        } catch (error) {
          console.error(`Erro ao carregar expansões da série ${seriesId}:`, error);
          expansionsData[seriesId] = [];
        }
      }
      
      setExpansions(expansionsData);
      console.log('Expansões carregadas:', Object.keys(expansionsData).length);
    } catch (error) {
      console.error('Erro ao carregar expansões:', error);
      Alert.alert('Erro', 'Não foi possível carregar as expansões. Tente novamente.');
    } finally {
      setLoadingExpansions(false);
    }
  };

  const toggleSeries = (seriesId) => {
    setSelectedSeries(prev => {
      if (prev.includes(seriesId)) {
        // Remove série e suas expansões
        const newExpansions = { ...expansions };
        delete newExpansions[seriesId];
        setExpansions(newExpansions);
        
        // Remove expansões selecionadas desta série
        setSelectedExpansions(prev => 
          prev.filter(expId => !expId.startsWith(seriesId))
        );
        
        return prev.filter(id => id !== seriesId);
      } else {
        return [...prev, seriesId];
      }
    });
  };

  const toggleExpansion = (expansionId) => {
    setSelectedExpansions(prev => {
      if (prev.includes(expansionId)) {
        return prev.filter(id => id !== expansionId);
      } else {
        return [...prev, expansionId];
      }
    });
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('selectedLanguage', selectedLanguage);
      await AsyncStorage.setItem('selectedSeries', JSON.stringify(selectedSeries));
      await AsyncStorage.setItem('selectedExpansions', JSON.stringify(selectedExpansions));
      
      Alert.alert(
        'Sucesso', 
        'Configurações salvas com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      Alert.alert('Erro', 'Não foi possível salvar as configurações.');
    }
  };

  const getSeriesName = (seriesId) => {
    const seriesData = series.find(s => s.id === seriesId);
    return seriesData ? seriesData.name : seriesId;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Configurações</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Seleção de Idioma */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Idioma</Text>
          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                selectedLanguage === 'pt' && styles.activeLanguageButton
              ]}
              onPress={() => setSelectedLanguage('pt')}
            >
              <Text style={[
                styles.languageButtonText,
                selectedLanguage === 'pt' && styles.activeLanguageButtonText
              ]}>
                Português (BR)
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.languageButton,
                selectedLanguage === 'en' && styles.activeLanguageButton
              ]}
              onPress={() => setSelectedLanguage('en')}
            >
              <Text style={[
                styles.languageButtonText,
                selectedLanguage === 'en' && styles.activeLanguageButtonText
              ]}>
                English (EN)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seleção de Séries */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coleções</Text>
          <Text style={styles.sectionSubtitle}>
            Escolha as coleções que deseja visualizar
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Carregando coleções...</Text>
            </View>
          ) : (
            <View style={styles.seriesContainer}>
              {series.map((seriesItem) => (
                <TouchableOpacity
                  key={seriesItem.id}
                  style={[
                    styles.seriesItem,
                    selectedSeries.includes(seriesItem.id) && styles.selectedSeriesItem
                  ]}
                  onPress={() => toggleSeries(seriesItem.id)}
                >
                  <Text style={[
                    styles.seriesText,
                    selectedSeries.includes(seriesItem.id) && styles.selectedSeriesText
                  ]}>
                    {seriesItem.name}
                  </Text>
                  {selectedSeries.includes(seriesItem.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Seleção de Expansões */}
        {selectedSeries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expansões</Text>
            <Text style={styles.sectionSubtitle}>
              Escolha as expansões específicas de cada coleção
            </Text>
            
            {loadingExpansions ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Carregando expansões...</Text>
              </View>
            ) : (
              <View style={styles.expansionsContainer}>
                {selectedSeries.map((seriesId) => (
                  <View key={seriesId} style={styles.seriesExpansionsContainer}>
                    <Text style={styles.seriesExpansionsTitle}>
                      {getSeriesName(seriesId)}
                    </Text>
                    <View style={styles.expansionsList}>
                      {expansions[seriesId]?.map((expansion) => (
                        <TouchableOpacity
                          key={expansion.id}
                          style={[
                            styles.expansionItem,
                            selectedExpansions.includes(expansion.id) && styles.selectedExpansionItem
                          ]}
                          onPress={() => toggleExpansion(expansion.id)}
                        >
                          <Text style={[
                            styles.expansionText,
                            selectedExpansions.includes(expansion.id) && styles.selectedExpansionText
                          ]}>
                            {expansion.name}
                          </Text>
                          {selectedExpansions.includes(expansion.id) && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Botão Salvar */}
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>Salvar Configurações</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  languageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  languageButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    flex: 0.45,
    alignItems: 'center',
  },
  activeLanguageButton: {
    backgroundColor: '#007AFF',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeLanguageButtonText: {
    color: '#fff',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  seriesContainer: {
    gap: 10,
  },
  seriesItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedSeriesItem: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  seriesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedSeriesText: {
    color: '#007AFF',
  },
  checkmark: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  expansionsContainer: {
    gap: 20,
  },
  seriesExpansionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  seriesExpansionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  expansionsList: {
    gap: 8,
  },
  expansionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedExpansionItem: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  expansionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedExpansionText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default LanguageConfigScreen;
