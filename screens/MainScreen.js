import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

const MainScreen = ({ navigation }) => {
  const handleCollectionsPress = () => {
    navigation.navigate('Series');
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Pokémon TCG V2</Text>
        <Text style={styles.subtitle}>Seu guia completo para cartas Pokémon</Text>
        
        <TouchableOpacity 
          style={styles.collectionsButton}
          onPress={handleCollectionsPress}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>📖</Text>
            <Text style={styles.buttonText}>COLEÇÕES</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={handleSettingsPress}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>⚙</Text>
            <Text style={styles.buttonText}>CONFIGURAÇÕES</Text>
          </View>
        </TouchableOpacity>
        
        <Text style={styles.description}>
          Explore todas as coleções e expansões de cartas Pokémon
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  collectionsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  settingsButton: {
    backgroundColor: '#6c757d',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MainScreen;
