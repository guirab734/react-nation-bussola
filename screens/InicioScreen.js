import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button, Vibration } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Magnetometer, Accelerometer } from 'expo-sensors';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const LIMITE_IMPACTO_G = 1.8; // força (em "g") 
const COOLDOWN_IMPACTO_MS = 3000; // tempo mínimo entre dois avisos de impacto

const DIRECOES_CARDINAIS = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];

export default function App() {
  const [grausBussola, setGrausBussola] = useState(0);

  const [localizacao, setLocalizacao] = useState(null);
  const [enderecoTexto, setEnderecoTexto] = useState('Toque em "Atualizar localização"');
  const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false);

  const [monitoramentoAtivo, setMonitoramentoAtivo] = useState(true);
  const [totalImpactos, setTotalImpactos] = useState(0);
  const [ultimoImpacto, setUltimoImpacto] = useState(null);

  const ultimoImpactoTimestampRef = useRef(0);

  // Bússola (magnetômetro)
  useEffect(() => {
    Magnetometer.setUpdateInterval(150);
    const assinaturaMagnetometro = Magnetometer.addListener(({ x, y }) => {
      let angulo = Math.atan2(y, x) * (180 / Math.PI) - 90;
      if (angulo < 0) angulo += 360;
      setGrausBussola(Math.round(angulo));
    });
    return () => assinaturaMagnetometro.remove();
  }, []);

  // Permissão de notificações (pedida uma vez ao abrir o app)
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  // Detector de impacto (acelerômetro)
  useEffect(() => {
    if (!monitoramentoAtivo) return;

    Accelerometer.setUpdateInterval(100);
    const assinaturaAcelerometro = Accelerometer.addListener(({ x, y, z }) => {
      const forca = Math.sqrt(x * x + y * y + z * z);
      const agora = Date.now();
      const tempoDesdeUltimoImpacto = agora - ultimoImpactoTimestampRef.current;

if (forca > LIMITE_IMPACTO_G && tempoDesdeUltimoImpacto > COOLDOWN_IMPACTO_MS) {
  ultimoImpactoTimestampRef.current = agora;
  setTotalImpactos((anterior) => anterior + 1);
  setUltimoImpacto(new Date());

  Vibration.vibrate([0, 200, 100, 200]);
  Notifications.scheduleNotificationAsync({
    content: { title: 'Impacto detectado!', body: `Força registrada: ${forca.toFixed(2)}g` },
    trigger: null,
  });

  fetch(`${API_URL}/impactos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      forca,
      lat: localizacao?.latitude ?? null,
      lon: localizacao?.longitude ?? null,
    }),
  }).catch((erro) => console.log('Erro ao salvar impacto:', erro));
}

    return () => assinaturaAcelerometro.remove();
  }, [monitoramentoAtivo]);

  const direcaoCardinal = (graus) => DIRECOES_CARDINAIS[Math.round(graus / 45) % 8];

  const atualizarLocalizacao = async () => {
    setCarregandoLocalizacao(true);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setEnderecoTexto('Permissão de localização negada.');
      setCarregandoLocalizacao(false);
      return;
    }

    try {
      const posicao = await Location.getCurrentPositionAsync({});
      setLocalizacao(posicao.coords);

      const [endereco] = await Location.reverseGeocodeAsync(posicao.coords);
      if (endereco) {
        const cidade = endereco.city || endereco.subregion || 'Local desconhecido';
        const regiao = endereco.region ? `, ${endereco.region}` : '';
        setEnderecoTexto(`${cidade}${regiao}`);
      } else {
        setEnderecoTexto('Endereço não encontrado.');
      }
    } catch (erro) {
      setEnderecoTexto('Não foi possível obter a localização.');
    }

    setCarregandoLocalizacao(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Radar de Impacto</Text>

      <View style={styles.areaBussola}>
        <View style={[styles.agulhaContorno, { transform: [{ rotate: `${-grausBussola}deg` }] }]}>
          <View style={styles.agulhaNorte} />
          <View style={styles.agulhaSul} />
        </View>
        <Text style={styles.texto}>
          {grausBussola}° • {direcaoCardinal(grausBussola)}
        </Text>
      </View>

      <View style={styles.areaLocalizacao}>
        <Text style={styles.texto}>{enderecoTexto}</Text>
        {localizacao && (
          <Text style={styles.textoPequeno}>
            Lat: {localizacao.latitude.toFixed(4)} · Lon: {localizacao.longitude.toFixed(4)}
          </Text>
        )}
        <Button
          title={carregandoLocalizacao ? 'Buscando...' : 'Atualizar localização'}
          onPress={atualizarLocalizacao}
          disabled={carregandoLocalizacao}
        />
      </View>

      <View style={styles.areaImpacto}>
        <Text style={styles.texto}>
          Monitoramento de impacto: {monitoramentoAtivo ? 'ativo' : 'pausado'}
        </Text>
        <Text style={styles.contador}>{totalImpactos}</Text>
        <Text style={styles.textoPequeno}>impacto(s) detectado(s)</Text>
        {ultimoImpacto && (
          <Text style={styles.textoPequeno}>Último às {ultimoImpacto.toLocaleTimeString()}</Text>
        )}
        <Button
          title={monitoramentoAtivo ? 'Pausar monitoramento' : 'Retomar monitoramento'}
          onPress={() => setMonitoramentoAtivo((anterior) => !anterior)}
          color={monitoramentoAtivo ? 'red' : 'green'}
        />
      </View>
    </View>
  );
}

fetch('https://radar-backend.seu-usuario.workers.dev/impactos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    forca,
    lat: localizacao?.latitude,
    lon: localizacao?.longitude,
  }),
});

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 24, backgroundColor: '#fff', padding: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold' },
  texto: { fontSize: 16, color: '#000', textAlign: 'center' },
  textoPequeno: { fontSize: 12, color: '#555', textAlign: 'center' },

  areaBussola: { alignItems: 'center', gap: 8 },
  agulhaContorno: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  agulhaNorte: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 36,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#dc2626',
    top: 7,
  },
  agulhaSul: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: 36,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1e293b',
    bottom: 7,
  },

  areaLocalizacao: { alignItems: 'center', gap: 6 },
  areaImpacto: { alignItems: 'center', gap: 6 },
  contador: { fontSize: 40, fontWeight: 'bold' },
});
