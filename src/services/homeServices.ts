import * as assert from "assert";
import {Api} from "../api";


export default class HomeServices {
    static getStatusCounts = async ()=>{
        try {
            let response = await Api.status.getUnviewedStatusCount({
                request: {}
            });
            gStore.dispatch({
                type: 'profileIndex/setStatusCounts',
                payload: response.data
            });
        } catch (e) {

        }
    }
}
