import React, {Component} from 'react'
import {
    StyleSheet,
    View,
} from 'react-native'
import {connect} from 'react-redux';
import YZHeader from '../../components/YZHeader';
import Styles from '../../common/styles';
import QuestionIndex from './question_index';


@connect(state=>({

}),dispatch=>({
    dispatch,
}))
export default class question_index_container extends Component<any,any> {

    render() {
        return (
            <View
                style={[Styles.container]}>
                <YZHeader
                    title="博问"
                    showGoBack={false}
                    />
                <QuestionIndex
                    navigation={this.props.navigation}
                    />
            </View>
        )
    }
}


const styles = StyleSheet.create({

});
