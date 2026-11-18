// RTL and i18n are set up before anything renders (docs/01: Arabic is the default, RTL-first).
import './src/i18n/rtl';
import './src/i18n';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
