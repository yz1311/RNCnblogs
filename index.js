/**
 * @format
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import {AppRegistry, Platform, YellowBox} from 'react-native';
import Root from './src/root';
import {name as appName} from './app.json';

if(Platform.OS ==='android')
{
    global.__ANDROID__ = true;
    global.__IOS__ = false;
}
else
{
    global.__ANDROID__ = false;
    global.__IOS__ = true;
}
//去除因为react-native-keyboard-aware-scroll-view库导致的ListView警告
YellowBox.ignoreWarnings([
    'ListView is deprecated',
    'Require cycle: node_modules/rn-fetch-blob/index.ts',
    'Require cycle: node_modules/react-native/Libraries/Network/fetch.js'
]);
console.disableYellowBox = true;
AppRegistry.registerComponent(appName, () => Root);
