import { useCallback, useState } from 'react';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono';
import { IBMPlexSansArabic_400Regular } from '@expo-google-fonts/ibm-plex-sans-arabic';
import { Jost_400Regular } from '@expo-google-fonts/jost';
import { Lexend_400Regular } from '@expo-google-fonts/lexend';
import { ReemKufi_400Regular } from '@expo-google-fonts/reem-kufi';
import { LocaleProvider } from './src/i18n/LocaleProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SplashScreen } from './src/screens/SplashScreen';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

function ThemedStatusBar() {
  const { name } = useTheme();
  return <StatusBar style={name === 'dark' ? 'light' : 'dark'} />;
}

// The splash overlays the app until its intro animation finishes (T-018).
function Shell() {
  const [splashDone, setSplashDone] = useState(false);
  const handleFinish = useCallback(() => setSplashDone(true), []);

  return (
    <>
      <RootNavigator />
      {!splashDone && <SplashScreen onFinish={handleFinish} />}
    </>
  );
}

export default function App() {
  // Font keys match `fontFamily` in @nabd/shared/tokens. Bundled offline, no runtime download.
  const [fontsLoaded] = useFonts({
    ReemKufi: ReemKufi_400Regular,
    IBMPlexSansArabic: IBMPlexSansArabic_400Regular,
    Jost: Jost_400Regular,
    Lexend: Lexend_400Regular,
    IBMPlexMono: IBMPlexMono_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocaleProvider>
          <Shell />
          <ThemedStatusBar />
        </LocaleProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
