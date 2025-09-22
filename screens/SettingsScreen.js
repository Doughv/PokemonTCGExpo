import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TCGdexService from '../services/TCGdexService';
import CacheService from '../services/CacheService';

const SettingsScreen = ({ navigation }) => {
  const [allSeries, setAllSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState([]);
  const [language, setLanguage] = useState('pt');
  const [loading, setLoading] = useState(true);
  const [cacheInfo, setCacheInfo] = useState({});

  useEffect(() => {
    loadSeries();
    loadSelectedSeries();
    loadLanguage();
    loadCacheInfo();
  }, []);

  const loadSeries = async () => {
    try {
      setLoading(true);
      console.log('Carregando todas as séries...');
      
      const response = await fetch('https://api.tcgdex.net/v2/pt/series');
      const series = await response.json();
      
      console.log('Séries encontradas:', series.length);
      setAllSeries(series);
    } catch (error) {
      console.error('Erro ao carregar séries:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar as séries. Verifique sua conexão.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedSeries = async () => {
    try {
      const saved = await AsyncStorage.getItem('selectedSeries');
      if (saved) {
        setSelectedSeries(JSON.parse(saved));
      } else {
        // Por padrão, selecionar apenas SV
        setSelectedSeries(['sv']);
      }
    } catch (error) {
      console.error('Erro ao carregar séries selecionadas:', error);
      setSelectedSeries(['sv']);
    }
  };

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('language');
      if (saved) {
        setLanguage(saved);
      }
    } catch (error) {
      console.error('Erro ao carregar idioma:', error);
    }
  };

  const loadCacheInfo = async () => {
    try {
      const info = await CacheService.getCacheInfo();
      setCacheInfo(info);
    } catch (error) {
      console.error('Erro ao carregar informações do cache:', error);
    }
  };

  const refreshCache = async () => {
    try {
      Alert.alert(
        'Atualizar Cache',
        'Isso irá baixar todos os dados novamente da API. Continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Atualizar',
            onPress: async () => {
              setLoading(true);
              await CacheService.forceRefreshCache();
              await loadCacheInfo();
              setLoading(false);
              Alert.alert('Sucesso', 'Cache atualizado com sucesso!');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao atualizar cache:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o cache.');
    }
  };

  const clearCache = async () => {
    try {
      Alert.alert(
        'Limpar Cache',
        'Isso irá remover todos os dados salvos localmente. Continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Limpar',
            style: 'destructive',
            onPress: async () => {
              await CacheService.clearAllCache();
              await loadCacheInfo();
              Alert.alert('Sucesso', 'Cache limpo com sucesso!');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      Alert.alert('Erro', 'Não foi possível limpar o cache.');
    }
  };

  const toggleSeries = (seriesId) => {
    const newSelected = selectedSeries.includes(seriesId)
      ? selectedSeries.filter(id => id !== seriesId)
      : [...selectedSeries, seriesId];
    
    setSelectedSeries(newSelected);
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('selectedSeries', JSON.stringify(selectedSeries));
      await AsyncStorage.setItem('language', language);
      
      // Atualizar idioma no serviço
      await TCGdexService.setLanguage(language);
      
      Alert.alert(
        'Configurações Salvas!',
        'Suas preferências foram salvas com sucesso.',
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

  const selectAll = () => {
    setSelectedSeries(allSeries.map(series => series.id));
  };

  const selectNone = () => {
    setSelectedSeries([]);
  };

  const renderSeriesItem = (series) => {
    const isSelected = selectedSeries.includes(series.id);
    
    return (
      <TouchableOpacity
        key={series.id}
        style={[styles.seriesItem, isSelected && styles.selectedItem]}
        onPress={() => toggleSeries(series.id)}
      >
        <View style={styles.seriesContent}>
          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </View>
          
          <View style={styles.seriesInfo}>
            <Text style={styles.seriesName}>{series.name}</Text>
            <Text style={styles.seriesId}>ID: {series.id}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando configurações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Configurações</Text>
          <Text style={styles.subtitle}>
            Personalize sua experiência
          </Text>
        </View>

        <View style={styles.languageSection}>
          <Text style={styles.sectionTitle}>Idioma</Text>
          <View style={styles.languageOptions}>
            <TouchableOpacity
              style={[styles.languageOption, language === 'pt' && styles.selectedLanguage]}
              onPress={() => setLanguage('pt')}
            >
              <Text style={[styles.languageText, language === 'pt' && styles.selectedLanguageText]}>
Português
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.languageOption, language === 'en' && styles.selectedLanguage]}
              onPress={() => setLanguage('en')}
            >
              <Text style={[styles.languageText, language === 'en' && styles.selectedLanguageText]}>
English
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cacheSection}>
          <Text style={styles.sectionTitle}>Cache Local</Text>
          <Text style={styles.sectionSubtitle}>
            Gerencie os dados salvos no dispositivo
          </Text>
          
          <View style={styles.cacheInfo}>
            <Text style={styles.cacheInfoText}>
              Séries: {cacheInfo.series?.exists ? `${cacheInfo.series.ageHours}h atrás` : 'Não salvo'}
            </Text>
            <Text style={styles.cacheInfoText}>
              Expansões: {cacheInfo.sets?.exists ? `${cacheInfo.sets.ageHours}h atrás` : 'Não salvo'}
            </Text>
            <Text style={styles.cacheInfoText}>
              Taxa de câmbio: {cacheInfo.exchangeRate?.exists ? `${cacheInfo.exchangeRate.ageHours}h atrás` : 'Não salvo'}
            </Text>
          </View>
          
          <View style={styles.cacheButtons}>
            <TouchableOpacity style={styles.cacheButton} onPress={refreshCache}>
              <Text style={styles.cacheButtonText}>Atualizar Cache</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.cacheButton, styles.clearButton]} onPress={clearCache}>
              <Text style={styles.cacheButtonText}>Limpar Cache</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.seriesSection}>
          <Text style={styles.sectionTitle}>Coleções</Text>
          <Text style={styles.sectionSubtitle}>
            Escolha quais coleções deseja visualizar
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={selectAll}>
            <Text style={styles.controlButtonText}>Selecionar Todas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={selectNone}>
            <Text style={styles.controlButtonText}>Desmarcar Todas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.seriesList}>
          {allSeries.map(renderSeriesItem)}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {selectedSeries.length} de {allSeries.length} coleções selecionadas
          </Text>
          
          <TouchableOpacity 
            style={[styles.saveButton, selectedSeries.length === 0 && styles.disabledButton]} 
            onPress={saveSettings}
            disabled={selectedSeries.length === 0}
          >
            <Text style={styles.saveButtonText}>Salvar Configurações</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  languageSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  seriesSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  languageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  languageOption: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
    minWidth: 120,
    alignItems: 'center',
  },
  selectedLanguage: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedLanguageText: {
    color: '#fff',
  },
  cacheSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cacheInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  cacheInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cacheButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cacheButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#dc3545',
  },
  cacheButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  controlButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  seriesList: {
    padding: 16,
  },
  seriesItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  seriesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  checkboxContainer: {
    marginRight: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  seriesInfo: {
    flex: 1,
  },
  seriesName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  seriesId: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  footerText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;

