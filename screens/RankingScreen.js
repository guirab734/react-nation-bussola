// screens/RankingScreen.js
import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = 'https://radar-backend.bussola734.workers.dev';

export default function RankingScreen() {
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const buscarRanking = useCallback(async () => {
    setCarregando(true);
    try {
      const resposta = await fetch(`${API_URL}/impactos/top`);
      const json = await resposta.json();
      setDados(json);
    } catch (erro) {
      console.log('Erro ao buscar ranking:', erro);
    }
    setCarregando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      buscarRanking();
    }, [buscarRanking])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Maiores forças registradas</Text>
      <FlatList
        data={dados}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={buscarRanking} />}
        renderItem={({ item, index }) => (
          <View style={styles.linha}>
            <Text style={styles.posicao}>{index + 1}º</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.forca}>{item.forca.toFixed(2)}g</Text>
              <Text style={styles.detalhe}>
                {new Date(item.criado_em).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.detalhe}>Nenhum impacto registrado ainda.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  posicao: { fontSize: 16, fontWeight: 'bold', width: 32 },
  forca: { fontSize: 16, fontWeight: '600' },
  detalhe: { fontSize: 12, color: '#555' },
});
