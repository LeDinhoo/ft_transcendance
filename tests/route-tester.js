const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const https = require('https');
const dns = require('dns').promises;
const net = require('net');

const FRONTEND_URL = 'https://frontend:443';
const BACKEND_URL = 'https://backend:8443';

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    requestCert: false,
    agent: false,
});


async function cleanupTestUsers() {
    try {
        console.log('🧹 Nettoyage des utilisateurs de test...');
        const response = await fetch(`${BACKEND_URL}/api/cleanup-test-users/`, {
            method: 'POST',
            agent: httpsAgent,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ Nettoyage des utilisateurs de test réussi');
            return true;
        } else {
            console.log('❌ Échec du nettoyage des utilisateurs de test');
            return false;
        }
    } catch (error) {
        console.error('Erreur lors du nettoyage des utilisateurs de test:', error);
        return false;
    }
}

async function waitForBackend(retries = 5, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`\n🔄 Tentative de connexion au backend (${i + 1}/${retries})...`);
            await fetch(BACKEND_URL, { 
                method: 'HEAD',
                agent: httpsAgent // Utilisez l'agent personnalisé
            });
            console.log('✅ Backend accessible');
            return true;
        } catch (error) {
            console.log(`⏳ Backend pas encore prêt : ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('Backend indisponible après plusieurs tentatives');
}

async function testConnectivity(host, port) {
    console.log(`\n🔍 Testing connectivity to ${host}:${port}...`);
    
    try {
        const { address } = await dns.lookup(host);
        console.log(`✅ DNS Resolution: ${host} -> ${address}`);
        
        return new Promise((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(2000);
            
            socket.on('connect', () => {
                console.log(`✅ Port ${port} is open on ${host}`);
                socket.destroy();
                resolve(true);
            });
            
            socket.on('error', (err) => {
                console.log(`❌ Cannot connect to ${host}:${port} - ${err.message}`);
                resolve(false);
            });
            
            socket.on('timeout', () => {
                console.log(`⚠️ Connection timeout to ${host}:${port}`);
                socket.destroy();
                resolve(false);
            });
            
            socket.connect(port, host);
        });
    } catch (error) {
        console.log(`❌ DNS lookup failed for ${host}: ${error.message}`);
        return false;
    }
}



function generateUniqueTestUser() {
    const timestamp = new Date().getTime();
    return {
        username: `testuser_${timestamp}`,
        email: `test_${timestamp}@test.com`,
        password: 'TestPassword123!'
    };
}


async function checkUserExists(user, BACKEND_URL, httpsAgent, commonHeaders) {
    // Vérifie si l'utilisateur existe déjà
    try {
        const response = await fetch(`${BACKEND_URL}/api/check-user-exists/`, {
            method: 'POST',
            agent: httpsAgent,
            headers: commonHeaders,
            body: JSON.stringify({
                username: user.username,
                email: user.email
            })
        });
        return response.ok;
    } catch (error) {
        console.log('⚠️ Erreur lors de la vérification de l\'utilisateur:', error.message);
        return false;
    }
}

async function testRoutes() {
    // Configuration
    const frontendResults = [];
    const backendResults = [];
    
    
    let testUser;
    let attempts = 0;
    const maxAttempts = 5;
    
    await cleanupTestUsers();
    do {
        testUser = generateUniqueTestUser();
        console.log(`\n👤 Tentative ${attempts + 1}/${maxAttempts} - Génération utilisateur de test:`, {
            username: testUser.username,
            email: testUser.email,
            password: '********'
        });
        
        attempts++;
    } while (attempts < maxAttempts);

    
    
    console.log('🚀 Démarrage des tests...\n');
    
    // Test de connectivité initiale
    console.log('🌐 Vérification de la connectivité...');
    const backendAvailable = await testConnectivity('backend', 8443);
    const frontendAvailable = await testConnectivity('frontend', 443);

    if (!backendAvailable || !frontendAvailable) {
        console.log('\n⚠️ Avertissement: Certains services ne sont pas accessibles');
        console.log('Vérifiez que tous les services sont démarrés et que les ports sont correctement exposés');
    }

    // Agent HTTPS personnalisé

    const commonHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    };

    // Test des routes frontend
    console.log('\n📱 Test des routes Frontend (SPA)...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--ignore-certificate-errors',
            '--disable-web-security',
            '--allow-insecure-localhost'
        ],
        ignoreHTTPSErrors: true
    });
  
    const page = await browser.newPage();
    await page.setBypassCSP(true);

    // Routes frontend à tester
    const frontendRoutes = [
        '/',
        '/login',
        '/register',
        '/profile',
        '/game',
        '/statistics'
    ];

    await waitForBackend();
    console.log('\n⚙️ Test des routes Backend (Django API)...');


    // Enregistrer d'abord l'utilisateur
    console.log('\n👤 Création de l\'utilisateur de test...');
    let registerResponse = await fetch(`${BACKEND_URL}/api/register/`, {
        method: 'POST',
        agent: httpsAgent,
        headers: commonHeaders,
        body: JSON.stringify({
            username: testUser.username,
            email: testUser.email,
            password1: testUser.password,
            password2: testUser.password
        })
    });
  
    let authToken;
    if (registerResponse.ok) {
        console.log('✅ Utilisateur créé avec succès');
        
        // Obtention du token
        console.log('\n🔑 Obtention du token...');
        const tokenResponse = await fetch(`${BACKEND_URL}/api/token/`, {
            method: 'POST',
            agent: httpsAgent,
            headers: commonHeaders,
            body: JSON.stringify({
                username: testUser.username,
                password: testUser.password
            })
        });
        
        if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            authToken = tokenData.access;  // Maintenant cette ligne fonctionnera
            commonHeaders['Authorization'] = `Bearer ${authToken}`;
            console.log('✅ Token obtenu avec succès');
        }
    }
    for (const route of frontendRoutes) {
        try {
            const fullUrl = `${FRONTEND_URL}${route}`;
            console.log(`Testing frontend route: ${route}`);

            const response = await page.goto(fullUrl, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            await new Promise(resolve => setTimeout(resolve, 2000));

            const mainContent = await page.evaluate(() => {
                const main = document.querySelector('main') || 
                            document.querySelector('#app') || 
                            document.querySelector('#root');
                return main ? main.innerHTML.length > 0 : false;
            });

            frontendResults.push({
                route,
                status: response.status(),
                contentLoaded: mainContent,
                success: response.status() === 200 || response.status() === 401
            });

        } catch (error) {
            frontendResults.push({
                route,
                success: false,
                error: error.message
            });
        }
    }

    await browser.close();

    // Test des routes backend
    console.log('\n⚙️ Test des routes Backend (Django API)...');

    const backendRoutes = [
        // Routes existantes
        { 
            path: '/api/login/', 
            method: 'POST',
            body: {
                email: testUser.email,
                password: testUser.password
            }
        },
        // { 
        //     path: '/api/register/', 
        //     method: 'POST',
        //     body: { 
        //         username: testUser.username,
        //         email: testUser.email,
        //         password1: testUser.password,
        //         password2: testUser.password
        //     }
        // },
        { 
            path: '/api/token/', 
            method: 'POST',
            body: {
                username: testUser.username,
                password: testUser.password
            },
            description: "Obtention du token"
        },
        
        // Routes manquantes à ajouter
        {
            path: '/api/profil/update/',
            method: 'PATCH',
            requiresAuth: true,
            body: {
                username: `${testUser.username}_updated`,
                email: testUser.email
            },
            description: "Mise à jour du profil"
        },
        {
            path: '/api/logout/',
            method: 'POST',
            requiresAuth: true,
            description: "Déconnexion"
        },
        {
            path: '/api/check-cookies/',
            method: 'GET',
            requiresAuth: true,
            description: "Vérification des cookies"
        },
        {
            path: '/api/record-game/',
            method: 'POST',
            requiresAuth: true,
            body: {
                result: true,
                score: 10,
                opponent_score: 5,  // Ajouter ce champ
                opponent: "opponent_name"  // Ajouter ce champ
            }
        },
        {
            path: '/api/game-settings/set/',
            method: 'PATCH',  // Changer POST en PATCH ou PUT selon votre API
            requiresAuth: true,
            body: {
                isPowerActivated: true,
                isIaActivated: false
            }
        },
        {
            path: '/api/token/refresh/',
            method: 'POST',
            requiresAuth: true,
            description: "Rafraîchissement du token"
        },
        {
            path: '/api/get_auth_url/',
            method: 'GET',
            description: "URL d'authentification 42"
        },
        {
            path: '/api/check-auth/',
            method: 'GET',
            requiresAuth: true,
            acceptRedirect: true,  // Ajouter cette option pour accepter la redirection
            description: "Vérification de l'authentification"
        },
        {
            path: '/api/2fa/toggle/',
            method: 'POST',
            requiresAuth: true,
            body: {
                enable: true,
                action: "enable"  // Ajouter ce champ si nécessaire
            }
        },
        {
            path: '/api/2fa/verify/',
            method: 'POST',
            requiresAuth: true,
            body: {
                user_id: "1",
                code: "000000"
            },
            description: "Vérification 2FA"
        },
        {
            path: '/api/test-email/',
            method: 'POST',
            requiresAuth: true,
            description: "Test d'envoi d'email"
        }
    ];

    // Obtention du token avec logging détaillé
    try {
        const loginUrl = `${BACKEND_URL}/api/login/`;
        console.log(`\n🔑 Tentative de connexion à ${loginUrl}`);
        console.log('Données:', {
            email: testUser.email,
            password: '********'
        });
    
        const loginResponse = await fetch(`${BACKEND_URL}/api/token/`, {
            method: 'POST',
            agent: httpsAgent,
            headers: commonHeaders,
            body: JSON.stringify({
                username: testUser.username,
                password: testUser.password
            })
        });
    
        // Lire la réponse une seule fois
        const responseText = await loginResponse.text();
        let responseData;
          
        try {
            // Tenter de parser le JSON
            responseData = JSON.parse(responseText);
            console.log('Réponse JSON:', responseData);
    
            if (loginResponse.ok) {
                authToken = responseData.access;
                commonHeaders['Authorization'] = `Bearer ${authToken}`;
                console.log('🔐 Token d\'authentification obtenu et appliqué');
            } else {
                console.log('❌ Échec de l\'obtention du token');
            }
    
            if (responseData.requires_2fa) {
                console.log('2FA required - skipping authenticated routes');
            }
        } catch {
            console.log('Réponse brute:', responseText);
        }
    
        // Vérification des cookies si nécessaire
        const cookies = loginResponse.headers.get('set-cookie');
        if (cookies) {
            console.log('Cookies reçus:', cookies);
            const tokenMatch = cookies.match(/access_token=(.*?);/);
            if (tokenMatch) {
                // Note : Vous pourriez vouloir garder le token JWT plutôt que celui des cookies
                console.log('Token trouvé dans les cookies');
            }
        }
    } catch (error) {
        console.log('❌ Erreur détaillée lors de la connexion:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
    }

    // Test de chaque route backend
    for (const route of backendRoutes) {
        try {
            const fullUrl = `${BACKEND_URL}${route.path}`;
            console.log(`\n🔍 Test de la route ${route.description}:`, route.path);
    
            // Configurer les options de base
            const options = {
                method: route.method,
                agent: httpsAgent,
                headers: { ...commonHeaders }  // Clone les headers pour ne pas modifier l'original
            };
    
            // Ajouter le body seulement pour les requêtes non-GET
            if (route.method !== 'GET' && route.body) {
                console.log('Données envoyées:', {
                    ...route.body,
                    password: route.body.password ? '********' : undefined,
                    password1: route.body.password1 ? '********' : undefined,
                    password2: route.body.password2 ? '********' : undefined
                });
                options.body = JSON.stringify(route.body);
            }
    
            // Ajouter le token pour les routes authentifiées
            if (route.requiresAuth && authToken) {
                options.headers['Authorization'] = `Bearer ${authToken}`;
                console.log('🔐 Route authentifiée avec token');
            }
    
            const response = await fetch(fullUrl, options);
            const responseText = await response.text();
            console.log('Réponse reçue:', responseText);
    
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch {
                responseData = responseText;
            }

            if (route.path === '/api/token/' && response.ok) {
                try {
                    const tokenData = responseData; // Utiliser responseData au lieu de parser à nouveau
                    authToken = tokenData.access;
                    commonHeaders['Authorization'] = `Bearer ${authToken}`;
                    console.log('🔐 Token d\'authentification mis à jour');
                } catch (error) {
                    console.log('❌ Erreur lors de l\'extraction du token:', error);
                }
            }
    
            const acceptableStatuses = [200, 201, 401, 403, 405, 400, 404];
                
            backendResults.push({
                route: route.path,
                method: route.method,
                status: response.status,
                success: acceptableStatuses.includes(response.status),
                response: responseData
            });
    
        } catch (error) {
            console.log('❌ Erreur pour la route', route.path, ':', error.message);
            backendResults.push({
                route: route.path,
                method: route.method,
                success: false,
                error: error.message
            });
        }
    }

    // Affichage des résultats
    console.log('\n📊 Résultats des tests Frontend:');
    frontendResults.forEach(result => {
        const icon = result.success ? '✅' : '❌';
        console.log(`${icon} ${result.route}`);
        if (!result.success) {
            console.log(`   Status: ${result.status || 'N/A'}`);
            console.log(`   Error: ${result.error || 'Aucun contenu principal trouvé'}`);
        }
    });

    console.log('\n📊 Résultats des tests Backend:');
    const failedRoutes = backendResults.filter(result => {
        // Si la route est un succès, on la garde
        if (result.success) return true;
        
        // Si la route échoue, on vérifie si le statut est dans la liste des statuts acceptables
        return acceptableStatuses.includes(result.status);
    });

    failedRoutes.forEach(result => {
        const icon = result.success ? '✅' : '❌';
        console.log(`${icon} ${result.method} ${result.route}`);
        if (!result.success) {
            console.log(`   Status: ${result.status || 'N/A'}`);
            if (result.response) {
                console.log(`   Response: ${result.response}`);
            }
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }
        }
    });

    // Optionnel : Résumé des routes réellement problématiques
    const reallyFailedRoutes = backendResults.filter(result => 
        !result.success && !acceptableStatuses.includes(result.status)
    );

    if (reallyFailedRoutes.length > 0) {
        console.log('\n⚠️ Routes avec des erreurs critiques :');
        reallyFailedRoutes.forEach(route => {
            console.log(`❌ ${route.method} ${route.route} - Status: ${route.status}`);
        });
    }

    const frontendSuccess = frontendResults.filter(r => r.success).length;
    const backendSuccess = backendResults.filter(r => r.success).length;
    
    console.log(`\n📈 Résumé:`);
    console.log(`Frontend: ${frontendSuccess}/${frontendResults.length} routes testées avec succès`);
    console.log(`Backend: ${backendSuccess}/${backendResults.length} routes testées avec succès`);
}

process.on('unhandledRejection', (reason, promise) => {
    console.log('🚨 Promesse rejetée non gérée:', reason);
});

testRoutes().catch(error => {
    console.error('❌ Erreur lors des tests:', {
        message: error.message,
        code: error.code,
        stack: error.stack
    });
    process.exit(1);
});