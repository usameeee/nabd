import { DefaultTheme, DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { LessonRewardScreen } from '../screens/LessonRewardScreen';
import { LessonScreen } from '../screens/LessonScreen';
import { ReviewScreen } from '../screens/ReviewScreen';
import { ViewerScreen } from '../screens/ViewerScreen';
import { useTheme } from '../theme/ThemeProvider';

export type RootStackParamList = {
  Home: undefined;
  Viewer: undefined;
  /** Which lesson to play (T-043). The runner resolves it to a fixture/API lesson. */
  Lesson: { lessonKey: string };
  /** What a finished lesson earned (T-045); it replaces the runner in the stack. */
  LessonReward: { xp: number; terms: number; streak: number };
  /** Spaced-repetition review of the collected terms (T-046). */
  Review: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { name, colors } = useTheme();
  const base = name === 'dark' ? DarkTheme : DefaultTheme;

  // Navigation chrome is themed from our tokens, not the library defaults.
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.action,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Viewer" component={ViewerScreen} />
        <Stack.Screen name="Lesson" component={LessonScreen} />
        <Stack.Screen name="LessonReward" component={LessonRewardScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
