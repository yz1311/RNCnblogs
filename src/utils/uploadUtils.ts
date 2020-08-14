import PermissionUtils from "./permissionUtils";
import SyanImagePicker from 'react-native-syan-image-picker';


export default class UploadUtils {
    static openImagePicker (params, callback, error?) {
        PermissionUtils.requestPhotoPermission(() => {
            let options = {
                imageCount: 9,
                isCamera: true,
                enableBase64: false,
                ...params,
            }
            SyanImagePicker.showImagePicker(options, (err, selectedPhotos) => {
                if (err) {
                    // 取消选择
                    error && error(err);
                } else {
                    // 选择成功，渲染图片
                    // ...
                    callback && callback(selectedPhotos);
                }
            });
        });
    }
}
