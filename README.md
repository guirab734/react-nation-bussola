# Radar de Impacto

Aplicativo mobile com bússola, localização e detecção de impactos por acelerômetro.
Desenvolvido com React Native e Expo SDK 54; o backend usa Cloudflare Workers e D1.

## Desenvolvimento

Na raiz, execute `npm install` e `npm start`. Abra o projeto pelo Expo Go em
um aparelho com os sensores necessários. O acesso à localização e às notificações
depende da permissão da pessoa que usa o aplicativo.

`screens/InicioScreen.js` acompanha os sensores e a localização.
`screens/RankingScreen.js` consulta ocorrências no backend.
O serviço em `radar-backend/` registra força, coordenadas e horário.

## Dados

O código não inclui o banco de produção. Para testar, configure um backend e
um banco próprios; não use dados pessoais em uma demonstração pública.
