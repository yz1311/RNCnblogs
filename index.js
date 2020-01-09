/**
 * @format
 */

import {AppRegistry, Platform, YellowBox} from 'react-native';
import Root from './src/root';
import {name as appName} from './app.json';

if (Platform.OS !== 'android') {
  global.__ANDROID__ = false;
  global.__IOS__ = true;
} else {
  global.__ANDROID__ = true;
  global.__IOS__ = false;
}

YellowBox.ignoreWarnings([]);
console.disableYellowBox = false;

AppRegistry.registerComponent(appName, () => Root);
