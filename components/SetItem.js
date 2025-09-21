import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const setItemWidth = width - 40;

const SetItem = ({ set, onPress }) => {
  const getLogoUrl = (set) => {
    if (!set.logo) return null;
    
    // Se a URL já tem extensão, usar como está
    if (set.logo.includes('.webp') || set.logo.includes('.png') || set.logo.includes('.jpg')) {
      return set.logo;
    }
    
    // Se não tem extensão, adicionar .webp
    return set.logo + '.webp';
  };

  const logoUrl = getLogoUrl(set);

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(set)}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderLogo}>
              <Text style={styles.placeholderText}>{set.name.charAt(0)}</Text>
            </View>
          )}
        </View>
        <View style={styles.setInfo}>
          <Text style={styles.setName} numberOfLines={2}>
            {set.name}
          </Text>
          <Text style={styles.setReleaseDate}>
            {set.releaseDate ? 
              (() => {
                try {
                  const date = new Date(set.releaseDate);
                  return isNaN(date.getTime()) ? 'Data não disponível' : date.toLocaleDateString('pt-BR');
                } catch (error) {
                  return 'Data não disponível';
                }
              })() : 
              'Data não disponível'
            }
          </Text>
          <Text style={styles.setCardCount}>
            {set.cardCount.total} cartas
          </Text>
          {set.serie && (
            <Text style={styles.setSerie}>{set.serie.name}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  logoContainer: {
    width: 70,
    height: 70,
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  logo: {
    width: 60,
    height: 60,
  },
  placeholderLogo: {
    width: 60,
    height: 60,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  setInfo: {
    flex: 1,
  },
  setName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  setReleaseDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  setCardCount: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  setSerie: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default SetItem;





