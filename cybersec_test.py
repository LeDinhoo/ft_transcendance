import requests
import json
from time import sleep
import random
import string
import urllib3
import sys

# Désactive les avertissements pour les certificats auto-signés
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class DjangoFormTester:
    def __init__(self, base_url="https://localhost:4430"):
        self.base_url = base_url
        self.session = requests.Session()
        # Configuration SSL
        self.session.verify = False
        self.session.trust_env = False
        self.test_results = []

    def make_request(self, method, url, **kwargs):
        try:
            kwargs['verify'] = False
            response = self.session.request(method, url, **kwargs)
            return response
        except requests.exceptions.RequestException as e:
            print(f"Erreur de requête: {str(e)}")
            return None

    def get_csrf_token(self):
        try:
            response = self.make_request('GET', f"{self.base_url}/login/")
            if response:
                return self.session.cookies.get('csrftoken')
            return None
        except Exception as e:
            print(f"Erreur CSRF: {e}")
            return None

    def random_string(self, length=10):
        return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

    def test_register_form(self):
        print("\nTest du formulaire d'inscription...")
        csrf_token = self.get_csrf_token()
        
        test_cases = [
            # Test 1: Données valides
            {
                "name": "Inscription valide",
                "data": {
                    "username": self.random_string(),
                    "email": f"{self.random_string()}@test.com",
                    "password1": "TestPass123@",
                    "password2": "TestPass123@",
                    "csrfmiddlewaretoken": csrf_token
                },
                "expected_status": [200, 201, 302]
            },
            # Test 2: Email invalide
            {
                "name": "Email invalide",
                "data": {
                    "username": self.random_string(),
                    "email": "invalid.email",
                    "password1": "TestPass123@",
                    "password2": "TestPass123@",
                    "csrfmiddlewaretoken": csrf_token
                },
                "expected_status": [400]
            },
            # ... autres cas de test identiques
        ]

        for test_case in test_cases:
            try:
                print(f"\nExécution du test: {test_case['name']}")
                headers = {
                    'X-CSRFToken': csrf_token,
                    'Referer': self.base_url,
                    'Origin': self.base_url,
                    'Host': self.base_url.split('//')[1],
                }
                
                response = self.make_request(
                    'POST',
                    f"{self.base_url}/register/",
                    data=test_case['data'],
                    headers=headers,
                    allow_redirects=True
                )
                
                if response:
                    success = response.status_code in test_case['expected_status']
                    self.test_results.append({
                        'test_name': test_case['name'],
                        'success': success,
                        'status_code': response.status_code,
                        'expected_status': test_case['expected_status'],
                        'response_text': response.text[:200] if not success else ''
                    })
                    print(f"Résultat: {'Succès' if success else 'Échec'}")
                else:
                    print("Échec de la requête")
                    
            except Exception as e:
                print(f"Erreur lors du test {test_case['name']}: {str(e)}")
                continue

    def test_login_form(self):
        print("\nTest du formulaire de connexion...")
        csrf_token = self.get_csrf_token()
        
        test_cases = [
            # Test 1: Connexion valide
            {
                "name": "Connexion valide",
                "data": {
                    "email": "test@test.com",
                    "password": "TestPass123@",
                    "csrfmiddlewaretoken": csrf_token
                },
                "expected_status": [200, 302]
            },
            # ... autres cas de test identiques
        ]

        for test_case in test_cases:
            try:
                print(f"\nExécution du test: {test_case['name']}")
                headers = {
                    'X-CSRFToken': csrf_token,
                    'Referer': self.base_url,
                    'Origin': self.base_url,
                    'Host': self.base_url.split('//')[1],
                }
                
                response = self.make_request(
                    'POST',
                    f"{self.base_url}/login/",
                    data=test_case['data'],
                    headers=headers,
                    allow_redirects=True
                )
                
                if response:
                    success = response.status_code in test_case['expected_status']
                    self.test_results.append({
                        'test_name': test_case['name'],
                        'success': success,
                        'status_code': response.status_code,
                        'expected_status': test_case['expected_status'],
                        'response_text': response.text[:200] if not success else ''
                    })
                    print(f"Résultat: {'Succès' if success else 'Échec'}")
                else:
                    print("Échec de la requête")
                    
            except Exception as e:
                print(f"Erreur lors du test {test_case['name']}: {str(e)}")
                continue

    def run_all_tests(self):
        self.test_register_form()
        self.test_login_form()
        if self.test_results:  # Vérifie si des résultats existent
            self.print_report()
        else:
            print("\nAucun test n'a pu être effectué avec succès.")

    def print_report(self):
        print("\n=== Rapport des Tests ===")
        total_tests = len(self.test_results)
        if total_tests == 0:
            print("Aucun test n'a été complété.")
            return
            
        successful_tests = len([t for t in self.test_results if t['success']])
        print(f"\nRésumé:")
        print(f"Tests réussis: {successful_tests}/{total_tests}")
        print(f"Taux de succès: {(successful_tests/total_tests)*100:.2f}%")
        
        print("\nDétails des tests:")
        for result in self.test_results:
            print(f"\nTest: {result['test_name']}")
            print(f"Statut: {'✅ Succès' if result['success'] else '❌ Échec'}")
            print(f"Code de statut: {result['status_code']} (attendu: {result['expected_status']})")
            if not result['success'] and 'response_text' in result:
                print(f"Réponse: {result['response_text']}")

if __name__ == "__main__":
    # Utilisation du port 4430
    tester = DjangoFormTester("https://localhost:4430")
    tester.run_all_tests()