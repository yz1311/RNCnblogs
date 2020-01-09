import AsyncStorage from '@react-native-community/async-storage';

global.gStorage = {
  // 缓存方法
  save: (key, value) => {
    const jsonValue = JSON.stringify(value);
    return AsyncStorage.setItem(key, jsonValue, error => {
      console.log(key + ' setOrRemoveObject error: ' + error);
    });
  },

  // 加载缓存
  load: key => {
    return AsyncStorage.getItem(key)
      .then(data => {
        if (data) return JSON.parse(data);

        return null;
      })
      .catch(error => {
        console.log(key + ' cachedObject error: ' + error);
      });
  },

  // 删除缓存
  remove: key => {
    return AsyncStorage.removeItem(key);
  },
};
