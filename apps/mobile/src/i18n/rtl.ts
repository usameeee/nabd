import { I18nManager } from 'react-native';

// Arabic is the default language and the layout is RTL-first (docs/01).
// `forceRTL` is applied by the native layer on the next app start, so we set it
// as early as possible (index.ts imports this module first).
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);
