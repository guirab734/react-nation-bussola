# Radar de Impacto

App mobile feito em **React Native (Expo)** que funciona como bússola, monitora localização em tempo real e detecta impactos físicos (pancadas, quedas, colisões) usando o acelerômetro do celular — registrando cada ocorrência em um backend na nuvem.

## Funcionalidades

- 🧭 **Bússola** — usa o magnetômetro para mostrar a direção cardinal (N, NE, L, SE, S, SO, O, NO) em tempo real.
- 📍 **Localização** — obtém coordenadas GPS e endereço aproximado (cidade/região) via geocodificação reversa.
- 💥 **Detector de impacto** — usa o acelerômetro para identificar quando a força ultrapassa um limite configurável, disparando vibração e notificação local.
- 🏆 **Ranking de impactos** — tela dedicada que consulta o backend e lista os impactos com maior força já registrados.
- ☁️ **Persistência na nuvem** — cada impacto detectado (força, coordenadas e data/hora) é salvo em um banco de dados remoto, sobrevivendo ao fechamento do app.

## Tecnologias

**App (mobile)**
- [Expo](https://expo.dev/) / React Native
- `expo-sensors` (Magnetometer, Accelerometer)
- `expo-location`
- `expo-notifications`
- `@react-navigation/native` + `@react-navigation/bottom-tabs`

**Backend**
- [Cloudflare Workers](https://workers.cloudflare.com/) — servidor serverless na borda da rede
- [Cloudflare D1](https://developers.cloudflare.com/d1/) — banco de dados SQLite gerenciado

## Estrutura do projeto

```
radar-de-impacto/
├── App.js                     # Configura a navegação por abas (Início / Ranking)
├── index.js                   # Ponto de entrada do Expo
├── screens/
│   ├── InicioScreen.js         # Bússola, localização e detector de impacto
│   └── RankingScreen.js        # Consulta e exibe o ranking de maiores forças
└── radar-backend/
    ├── src/index.js            # Worker: rotas HTTP e acesso ao banco D1
    └── wrangler.toml           # Configuração do Worker e binding com o D1
```

## Como rodar o app

```bash
npm install
npx expo start
```

Escaneie o QR code com o app **Expo Go** no celular (recomendado, para os sensores funcionarem de verdade), ou:

```bash
npx expo start --android   # emulador Android
npx expo start --ios       # simulador iOS (só Mac)
```

## Como rodar/publicar o backend

Dentro da pasta `radar-backend/`:

```bash
npx wrangler dev       # rodar localmente
npx wrangler deploy    # publicar no Cloudflare
```

**Criar a tabela no banco remoto** (necessário na primeira configuração):

```bash
npx wrangler d1 execute radar-db --remote --command "CREATE TABLE impactos (id INTEGER PRIMARY KEY AUTOINCREMENT, forca REAL, lat REAL, lon REAL, criado_em TEXT)"
```

## API do backend

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/impactos` | Salva um novo impacto (`forca`, `lat`, `lon`) |
| `GET` | `/impactos` | Lista todos os impactos, do mais recente ao mais antigo |
| `GET` | `/impactos/top` | Lista os 20 impactos de maior força, em ordem decrescente |

## Configuração necessária

No `screens/InicioScreen.js` e `screens/RankingScreen.js`, ajuste a constante `API_URL` para a URL do seu Worker publicado:

```js
const API_URL = 'https://radar-backend.SEU-SUBDOMINIO.workers.dev';
```

## Possíveis melhorias futuras

- Autenticação de usuários, para cada um ver apenas os próprios impactos
- Exibir o endereço (não só lat/lon) na tela de Ranking
- Paginação na consulta de impactos
- Testes automatizados no Worker
