import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTriangle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { onosApi } from '@/services/onosApi';

export default function Settings() {
  const [controllerIp, setControllerIp] = useState('127.0.0.1');
  const [controllerPort, setControllerPort] = useState('8181');
  const [username, setUsername] = useState('onos');
  const [password, setPassword] = useState('rocks');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [testing, setTesting] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('5000');
  
  const { toast } = useToast();

  useEffect(() => {
    // Charger les paramètres sauvegardés
    const savedSettings = localStorage.getItem('onosSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setControllerIp(settings.controllerIp || '127.0.0.1');
      setControllerPort(settings.controllerPort || '8181');
      setUsername(settings.username || 'onos');
      setPassword(settings.password || 'rocks');
      setAutoRefresh(settings.autoRefresh || true);
      setRefreshInterval(settings.refreshInterval || '5000');
    }
  }, []);

  const saveSettings = () => {
    const settings = {
      controllerIp,
      controllerPort,
      username,
      password,
      autoRefresh,
      refreshInterval
    };
    
    localStorage.setItem('onosSettings', JSON.stringify(settings));
    
    toast({
      title: "Paramètres sauvegardés",
      description: "La configuration a été enregistrée avec succès.",
    });
  };

  const testConnection = async () => {
    setTesting(true);
    
    try {
      const result = await onosApi.testConnection();
      
      if (result.success) {
        setConnectionStatus('connected');
        toast({
          title: "Connexion réussie",
          description: `Connecté au contrôleur ONOS sur ${controllerIp}:${controllerPort}`,
        });
      } else {
        setConnectionStatus('error');
        console.error('Connection failed:', result.error, result.suggestions);
        toast({
          title: "Échec de la connexion",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Erreur de test",
        description: "Impossible de tester la connexion",
        variant: "destructive",
      });
    }
    
    setTesting(false);
  };

  const resetToDefaults = () => {
    setControllerIp('127.0.0.1');
    setControllerPort('8181');
    setUsername('onos');
    setPassword('rocks');
    setAutoRefresh(true);
    setRefreshInterval('5000');
    setConnectionStatus('disconnected');
    
    localStorage.removeItem('onosSettings');
    
    toast({
      title: "Paramètres réinitialisés",
      description: "Les paramètres par défaut ont été restaurés.",
    });
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500/20 text-green-400';
      case 'error': return 'bg-red-500/20 text-red-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connecté';
      case 'error': return 'Erreur';
      default: return 'Déconnecté';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Paramètres</h1>
          <p className="text-slate-400">Configuration du contrôleur ONOS et de l'application</p>
        </div>
        <Badge className={getStatusColor()}>
          {getStatusText()}
        </Badge>
      </div>

      {/* Add CORS Warning */}
      <Alert className="bg-yellow-500/10 border-yellow-500/20">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-yellow-200">
          <strong>Problème CORS détecté:</strong> Les navigateurs bloquent les requêtes vers {controllerIp}:8181.
          <br />
          <strong>Solutions:</strong>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Installer une extension CORS (CORS Unblock, CORS Everywhere)</li>
            <li>Démarrer Chrome avec --disable-web-security --user-data-dir=/tmp/chrome_dev</li>
            <li>Configurer ONOS pour autoriser CORS</li>
            <li>Utiliser un proxy/tunnel (ngrok, serveo)</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration du contrôleur */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Configuration du Contrôleur ONOS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ip" className="text-slate-300">Adresse IP</Label>
                <Input
                  id="ip"
                  value={controllerIp}
                  onChange={(e) => setControllerIp(e.target.value)}
                  placeholder="127.0.0.1"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port" className="text-slate-300">Port</Label>
                <Input
                  id="port"
                  value={controllerPort}
                  onChange={(e) => setControllerPort(e.target.value)}
                  placeholder="8181"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="onos"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="rocks"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                onClick={testConnection}
                disabled={testing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {testing ? 'Test en cours...' : 'Tester la connexion'}
              </Button>
              <Button
                onClick={saveSettings}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                Sauvegarder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Paramètres de l'application */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Paramètres de l'Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-300">Actualisation automatique</Label>
                <p className="text-sm text-slate-400">Mise à jour automatique des données</p>
              </div>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {autoRefresh ? 'Activé' : 'Désactivé'}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interval" className="text-slate-300">
                Intervalle d'actualisation (ms)
              </Label>
              <Input
                id="interval"
                type="number"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                min="1000"
                step="1000"
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400">
                Recommandé: 5000ms (5 secondes)
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <Button
                onClick={resetToDefaults}
                variant="outline"
                className="w-full border-slate-600 text-white hover:bg-slate-700"
              >
                Réinitialiser aux valeurs par défaut
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations sur l'API */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Endpoints API ONOS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-slate-700 rounded-lg">
              <h4 className="font-medium text-white mb-2">Dispositifs</h4>
              <p className="text-blue-400 font-mono">/onos/v1/devices</p>
              <p className="text-slate-400">Liste des switches</p>
            </div>
            <div className="p-3 bg-slate-700 rounded-lg">
              <h4 className="font-medium text-white mb-2">Hôtes</h4>
              <p className="text-blue-400 font-mono">/onos/v1/hosts</p>
              <p className="text-slate-400">Terminaux connectés</p>
            </div>
            <div className="p-3 bg-slate-700 rounded-lg">
              <h4 className="font-medium text-white mb-2">Flux</h4>
              <p className="text-blue-400 font-mono">/onos/v1/flows</p>
              <p className="text-slate-400">Règles OpenFlow</p>
            </div>
            <div className="p-3 bg-slate-700 rounded-lg">
              <h4 className="font-medium text-white mb-2">Topologie</h4>
              <p className="text-blue-400 font-mono">/onos/v1/topology</p>
              <p className="text-slate-400">Structure du réseau</p>
            </div>
            <div className="p-3 bg-slate-700 rounded-lg">
              <h4 className="font-medium text-white mb-2">Liens</h4>
              <p className="text-blue-400 font-mono">/onos/v1/links</p>
              <p className="text-slate-400">Connexions inter-switch</p>
            </div>
            <div className="p-3 bg-slate-700 rounded-lg">
              <h4 className="font-medium text-white mb-2">Applications</h4>
              <p className="text-blue-400 font-mono">/onos/v1/applications</p>
              <p className="text-slate-400">Apps ONOS actives</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add CORS Configuration Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Configuration CORS & Connectivité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-700 rounded-lg">
              <h4 className="font-medium text-white mb-2">Extension Chrome</h4>
              <p className="text-sm text-slate-300 mb-2">Installer "CORS Unblock" depuis Chrome Web Store</p>
              <Button
                onClick={() => window.open('https://chrome.google.com/webstore/search/cors%20unblock', '_blank')}
                variant="outline"
                size="sm"
                className="border-slate-600 text-white hover:bg-slate-600"
              >
                Ouvrir Chrome Store
              </Button>
            </div>
            
            <div className="p-4 bg-slate-700 rounded-lg">
              <h4 className="font-medium text-white mb-2">Command Chrome</h4>
              <p className="text-sm text-slate-300 mb-2">Démarrer Chrome sans sécurité CORS</p>
              <code className="text-xs bg-slate-800 p-2 rounded block text-green-400">
                chrome --disable-web-security --user-data-dir=/tmp/chrome_dev
              </code>
            </div>
            
            <div className="p-4 bg-slate-700 rounded-lg">
              <h4 className="font-medium text-white mb-2">ONOS CORS Config</h4>
              <p className="text-sm text-slate-300 mb-2">Configurer ONOS pour autoriser CORS</p>
              <code className="text-xs bg-slate-800 p-2 rounded block text-green-400">
                onos-app-cors
              </code>
            </div>
            
            <div className="p-4 bg-slate-700 rounded-lg">
              <h4 className="font-medium text-white mb-2">Proxy/Tunnel</h4>
              <p className="text-sm text-slate-300 mb-2">Utiliser ngrok pour créer un tunnel</p>
              <code className="text-xs bg-slate-800 p-2 rounded block text-green-400">
                ngrok http 192.168.94.129:8181
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations système */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Informations Système</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-white mb-2">Version de l'application</h4>
              <p className="text-slate-300">1.0.0</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Protocole OpenFlow</h4>
              <p className="text-slate-300">Version 1.3</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Dernière connexion</h4>
              <p className="text-slate-300">
                {connectionStatus === 'connected' ? new Date().toLocaleString() : 'Jamais'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
