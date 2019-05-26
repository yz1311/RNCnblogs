import Toast,{ToastProps} from 'react-native-root-toast';
//全局唯一的toast对象
let singleToast;

export default class ToastUtils
{
    //显示toast
    static show = (message,options: ToastProps={})=>{
        let duration = ToastUtils.durations.SHORT;
        if(options.duration!==undefined)
        {
            duration = options.duration;
        }
        let position = ToastUtils.positions.BOTTOM;
        if(options.position!==undefined)
        {
            position = options.position;
        }
        singleToast = Toast.show(message,{
            duration,
            position
        });
    }

    //隐藏toast
    static hide = ()=>{
        Toast.hide(singleToast);
    }

    //枚举
    //toast显示的时间
    static durations = {
        SHORTER:1000,  //1000ms
        SHORT:1500,  //1500ms
        MEDIUM:2000,  //2000ms
        LONG:2500     //2500ms
    };

    //toast显示的位置
    static positions = {
        TOP:Toast.positions.TOP,         //20
        CENTER:Toast.positions.CENTER,   //-20
        BOTTOM:Toast.positions.BOTTOM,   //0
    };


    static types = {
        //Show a toast, similar to Android native toasts
        text:'TEXT',
        //Show a success image with a message
        success:'SUCCESS',
        //Show an error image with a message
        error:'ERROR',
    };


    static maskTypes = {
        none:1,
        Clear : 2,
        Black : 3
    }
}