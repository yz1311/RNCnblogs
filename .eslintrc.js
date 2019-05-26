module.exports = {
    "env": {
        "es6": true,
        "node": true,
        // "browser": true
    },
    "extends": [
        "eslint:recommended",
        //直接在rules中添加react规则
        // 'plugin:react/recommended'
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        },
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "react-native"
    ],
    "rules": {
        "no-unused-vars": ["warn", { "vars": "all", "args": "none", "ignoreRestSiblings": false,"caughtErrors": "none"}],
        "indent": [
            "warn",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "off",
            "single"
        ],
        "semi": [
            "warn",
            "always"
        ],
        "react/jsx-uses-react": "error",
        "react/jsx-uses-vars": "error",
        /* 禁止出现ref="" 这种形式，必须用变量来获取ref引用 */
        "react/no-string-refs":"error",
        // "import/no-duplicates":"off",
        /* map的子元素必须设置key */
        "react/jsx-key":"error",
        /* 禁止为组件设置两个相同的属性（大小写区分，也有参数可以忽略大小写） */
        "react/jsx-no-duplicate-props":"error",
        /* 未使用state */
        "react/no-unused-state":"warn",
        /* 未使用propype */
        "react/no-unused-prop-types":"warn",
        /* 禁止在componentWillUpdate中setState */
        "react/no-will-update-set-state":"error",
        "no-console":"off",
        /* Detect StyleSheet rules which are not used in your React components */
        "react-native/no-unused-styles": "error",
        /* Enforce using platform specific filenames when necessary */
        "react-native/split-platform-components": "error",
        /* Detect JSX components with inline styles that contain literal values */
        "react-native/no-inline-styles": "off",
        /* Detect StyleSheet rules and inline styles containing color literals instead of variables */
        "react-native/no-color-literals": "off",
        "react/jsx-key": 2, //在数组或迭代器中验证JSX具有key属性
        "react/jsx-no-undef": 1, //在JSX中禁止未声明的变量
        "react/jsx-pascal-case": 0, //为用户定义的JSX组件强制使用PascalCase
        "react/jsx-uses-react": 1, //防止反应被错误地标记为未使用
        "react/jsx-uses-vars": 2, //防止在JSX中使用的变量被错误地标记为未使用
        "react/no-did-update-set-state": 1, //防止在componentDidUpdate中使用setState
        "require-yield": 1
        // "react/sort-comp": 2, //强制组件方法顺序

    },
    "globals":{
        /* global gParams  */
        "gParams": true,
        "gMessageType": true,
        "__ANDROID__": true,
        "__IOS__": true,
        "gBridge": true,
        "gUtils": true,
        "gStorage": true,
        "gStorageKeys": true,
        "gMPayStateType": true,
        "gBaseConfig": true,
        "gUserData": true,
        "gServerPath": true,
        "gResetUserData": true,
        "gUserRole": true,
        "gModules": true,
        "hasPermission": true,
        "gPermissions": true,
        "activeOpacity": true,
        "gAutoDismissDecorator": true,
        "NavigationHelper": true,
        "gScreen": true,
        "gString": true,
        "gMargin": true,
        "gOpeType": true,
        "gColors": true,
        "gFont": true,
        "alert": true,
        "fetch": true,
        "RMB": true,
        "gEncryptString": true,
        "gPrint": true,
        "FormData": true,
        "gRandomString": true,
        "gSortData": true,
        "gHexMD5": true,
        "gSendVerifySMS": true,
        "gGetCertInfo": true,
        "gFormatDateStr": true,
        "gMachineTabType": true,
        "gMPayInfoStatePrompt": true,
        "Easing": true,
        /* Jest start */
        "describe": true,
        "test": true,
        "expect": true,
        "it": true,
        "isIphoneX": true,
        "iosStatusBarHeight": true,
        "appName": true,
        "registerHost": true,
        "orgId": true,
        "fontSizeScaler": true,
        /* Jest end */
    }
};
