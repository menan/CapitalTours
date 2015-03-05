package ca.gc.canadascapital.canadaday;

import android.app.Activity;
import android.os.Bundle;
import org.apache.cordova.*;

public class CapitalTour extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.setIntegerProperty("loadUrlTimeoutValue", 60000);
        super.setIntegerProperty("splashscreen", R.drawable.splash);
        super.loadUrl("file:///android_asset/www/index.html",5000);
    }
}