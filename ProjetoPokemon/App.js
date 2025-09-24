import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TCGdexService from './services/TCGdexService';

// Importar as telas
import MainScreen from './screens/MainScreen';
import SeriesScreen from './screens/SeriesScreen';
import SetsScreen from './screens/SetsScreen';
import CardsScreen from './screens/CardsScreen';
import CardDetailScreen from './screens/CardDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import DownloadsScreen from './screens/DownloadsScreen';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Carregar idioma salvo na inicialização
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('language');
        if (savedLanguage) {
          await TCGdexService.setLanguage(savedLanguage);
          console.log('✅ Idioma carregado:', savedLanguage);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar idioma:', error);
      }
    };

    loadLanguage();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={MainScreen}
          options={{ 
            title: 'Pokémon TCG V2',
            headerShown: false 
          }}
        />
        <Stack.Screen 
          name="Series" 
          component={SeriesScreen}
          options={{ title: 'Coleções' }}
        />
        <Stack.Screen 
          name="Sets" 
          component={SetsScreen}
          options={{ title: 'Expansões' }}
        />
        <Stack.Screen 
          name="Cards" 
          component={CardsScreen}
          options={{ title: 'Cartas' }}
        />
        <Stack.Screen 
          name="CardDetail" 
          component={CardDetailScreen}
          options={{ title: 'Detalhes da Carta' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: 'Configurações' }}
        />
        <Stack.Screen 
          name="Downloads" 
          component={DownloadsScreen}
          options={{ title: 'Downloads' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}