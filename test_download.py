#!/usr/bin/env python3
"""
Script de teste para verificar se o download está funcionando.
Baixa apenas algumas cartas para testar.
"""

import requests
import json
import time

def test_single_card():
    """Testa o download de uma carta específica."""
    card_id = "sv01-225"  # Gyarados ex que já testamos
    url = f"https://api.tcgdex.net/v2/pt/cards/{card_id}"
    
    print(f"🧪 Testando download da carta: {card_id}")
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        print("✅ Download bem-sucedido!")
        print(f"📋 Nome: {data['name']}")
        print(f"🏷️  Categoria: {data['category']}")
        print(f"⚡ Tipos: {', '.join(data['types'])}")
        print(f"❤️  HP: {data['hp']}")
        print(f"⭐ Raridade: {data['rarity']}")
        print(f"🗡️  Ataques: {len(data['attacks'])}")
        
        if data['attacks']:
            print("   Primeiro ataque:")
            attack = data['attacks'][0]
            print(f"     Nome: {attack['name']}")
            print(f"     Custo: {', '.join(attack['cost'])}")
            print(f"     Dano: {attack['damage']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

def test_multiple_cards():
    """Testa o download de várias cartas."""
    test_cards = ["sv01-225", "sv01-226", "sv01-227"]
    
    print(f"\n🧪 Testando download de {len(test_cards)} cartas...")
    
    success_count = 0
    
    for i, card_id in enumerate(test_cards, 1):
        print(f"[{i}/{len(test_cards)}] {card_id}...", end=' ')
        
        url = f"https://api.tcgdex.net/v2/pt/cards/{card_id}"
        
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            print(f"✅ {data['name']}")
            success_count += 1
            
        except Exception as e:
            print(f"❌ {e}")
        
        # Pequena pausa entre requests
        time.sleep(0.5)
    
    print(f"\n📊 Resultado: {success_count}/{len(test_cards)} sucessos")
    return success_count == len(test_cards)

def main():
    print("🚀 Iniciando testes da API tcgdex...\n")
    
    # Teste 1: Uma carta
    test1_success = test_single_card()
    
    # Teste 2: Múltiplas cartas
    test2_success = test_multiple_cards()
    
    print("\n" + "="*50)
    print("📊 RESUMO DOS TESTES:")
    print(f"✅ Teste individual: {'PASSOU' if test1_success else 'FALHOU'}")
    print(f"✅ Teste múltiplo: {'PASSOU' if test2_success else 'FALHOU'}")
    
    if test1_success and test2_success:
        print("\n🎉 Todos os testes passaram! O script principal deve funcionar.")
    else:
        print("\n⚠️  Alguns testes falharam. Verifique a conexão com a API.")

if __name__ == "__main__":
    main()
