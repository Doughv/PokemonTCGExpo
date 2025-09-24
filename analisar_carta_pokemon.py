#!/usr/bin/env python3
"""
Script para analisar os campos retornados pela API TCGdex para cartas Pokémon
"""

import requests
import json
from datetime import datetime

def buscar_carta_exemplo():
    """
    Busca uma carta específica da API TCGdx para analisar os campos disponíveis
    """
    
    # URL base da API TCGdx em português
    base_url = "https://api.tcgdex.net/v2/pt"
    
    try:
        print("🔍 Buscando cartas disponíveis...")
        
        # Primeiro, buscar algumas cartas para encontrar um ID válido
        response = requests.get(f"{base_url}/cards")
        response.raise_for_status()
        
        cartas = response.json()
        print(f"✅ Total de cartas encontradas: {len(cartas)}")
        
        if not cartas:
            print("❌ Nenhuma carta encontrada")
            return
        
        # Pegar a primeira carta como exemplo
        carta_exemplo = cartas[0]
        carta_id = carta_exemplo.get('id')
        
        print(f"📋 Analisando carta: {carta_exemplo.get('name', 'Nome não disponível')} (ID: {carta_id})")
        
        # Buscar detalhes completos da carta
        print(f"🔍 Buscando detalhes completos da carta {carta_id}...")
        detalhes_response = requests.get(f"{base_url}/cards/{carta_id}")
        detalhes_response.raise_for_status()
        
        carta_completa = detalhes_response.json()
        
        # Salvar em arquivo JSON para análise
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"carta_pokemon_exemplo_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(carta_completa, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Dados salvos em: {filename}")
        
        # Mostrar estrutura dos campos
        print("\n" + "="*60)
        print("📊 ESTRUTURA DOS CAMPOS DA CARTA:")
        print("="*60)
        
        def analisar_campos(obj, prefixo="", nivel=0):
            """Função recursiva para analisar todos os campos"""
            if nivel > 3:  # Limitar profundidade para evitar loops infinitos
                return
            
            indent = "  " * nivel
            
            if isinstance(obj, dict):
                for chave, valor in obj.items():
                    tipo_valor = type(valor).__name__
                    if isinstance(valor, (dict, list)) and valor:
                        print(f"{indent}📁 {chave}: {tipo_valor}")
                        if isinstance(valor, dict):
                            analisar_campos(valor, f"{prefixo}.{chave}", nivel + 1)
                        elif isinstance(valor, list) and valor:
                            print(f"{indent}  📋 Lista com {len(valor)} item(s)")
                            if valor and isinstance(valor[0], dict):
                                analisar_campos(valor[0], f"{prefixo}.{chave}[0]", nivel + 1)
                    else:
                        valor_str = str(valor)[:50] + "..." if len(str(valor)) > 50 else str(valor)
                        print(f"{indent}📄 {chave}: {tipo_valor} = {valor_str}")
            elif isinstance(obj, list):
                print(f"{indent}📋 Lista com {len(obj)} item(s)")
                if obj and isinstance(obj[0], dict):
                    analisar_campos(obj[0], f"{prefixo}[0]", nivel + 1)
        
        analisar_campos(carta_completa)
        
        print("\n" + "="*60)
        print("🎯 TODOS OS CAMPOS RETORNADOS PELA API:")
        print("="*60)
        
        # Mostrar TODOS os campos que a API retorna, sem filtro
        for campo in carta_completa.keys():
            valor = carta_completa[campo]
            tipo = type(valor).__name__
            if isinstance(valor, str):
                valor_str = valor[:100] + "..." if len(valor) > 100 else valor
            elif isinstance(valor, (dict, list)):
                valor_str = f"{tipo} com {len(valor)} item(s)"
            else:
                valor_str = str(valor)
            print(f"✅ {campo}: {valor_str}")
        
        return carta_completa
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro na requisição: {e}")
    except json.JSONDecodeError as e:
        print(f"❌ Erro ao decodificar JSON: {e}")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    print("🚀 Iniciando análise da API TCGdx...")
    buscar_carta_exemplo()
    print("\n✅ Análise concluída!")
