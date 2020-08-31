import React from 'react';
import {SafeAreaView} from "react-native-safe-area-context";
import {NativeSafeAreaViewProps} from "react-native-safe-area-context/lib/typescript/src/SafeArea.types";
import {Styles} from "../common/styles";
import {View} from "react-native";


interface IProps extends NativeSafeAreaViewProps {

}

function YZSafeAreaView(props:IProps) {
    return (
        <SafeAreaView edges={['right', 'bottom', 'left']} {...(props || {})} style={[Styles.container, (props || {}).style]}>
            {props.children}
        </SafeAreaView>
    );
}

export default YZSafeAreaView;
