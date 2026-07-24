import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import InicioScreen from './screens/InicioScreen';
import RankingScreen from './screens/RankingScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Início" component={InicioScreen} />
        <Tab.Screen name="Ranking" component={RankingScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}