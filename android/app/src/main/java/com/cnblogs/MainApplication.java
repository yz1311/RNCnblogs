package com.cnblogs;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.poberwong.launcher.IntentLauncherPackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.horcrux.svg.SvgPackage;
import com.wix.autogrowtextinput.AutoGrowTextInputPackage;
import io.realm.react.RealmReactPackage;
import com.airbnb.android.react.lottie.LottiePackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.beefe.picker.PickerViewPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.microsoft.codepush.react.CodePush;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

    @Override
    protected String getJSBundleFile() {
        return CodePush.getJSBundleFile();
    }

    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new IntentLauncherPackage(),
            new NetInfoPackage(),
            new AsyncStoragePackage(),
            new SvgPackage(),
            new AutoGrowTextInputPackage(),
            new RealmReactPackage(),
            new LottiePackage(),
            new RNCWebViewPackage(),
            new RNFetchBlobPackage(),
            new VectorIconsPackage(),
            new SplashScreenReactPackage(),
            new PickerViewPackage(),
            new RNGestureHandlerPackage(),
            new CodePush(getResources().getString(R.string.reactNativeCodePush_androidDeploymentKey), getApplicationContext(), BuildConfig.DEBUG)
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
