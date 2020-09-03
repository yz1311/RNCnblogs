import PermissionUtils from "./permissionUtils";
import SyanImagePicker, {ImagePickerOption, SelectedPhoto} from 'react-native-syan-image-picker';


export default class UploadUtils {
    static openImagePicker (params: Partial<ImagePickerOption> | null, callback: (photos: Array<SelectedPhoto>)=>void, error?) {
        PermissionUtils.requestPhotoPermission(() => {
            let options = {
                imageCount: 9,
                isCamera: true,
                enableBase64: false,
                ...(params || {}),
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
