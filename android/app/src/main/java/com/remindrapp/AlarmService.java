package com.remindrapp;

import android.app.Service;
import android.content.Intent;
import android.media.MediaPlayer;
import android.os.IBinder;
import android.view.WindowManager;
import android.view.LayoutInflater;
import android.view.View;
import android.graphics.PixelFormat;
import android.view.Gravity;
import android.widget.Button;

public class AlarmService extends Service {
    private MediaPlayer mp;
    private WindowManager wm;
    private View glassView;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String pkg = getPackageName();

        // 1. Sound Engine (Dynamic)
        int resId = getResources().getIdentifier("iphone_alarm", "raw", pkg);
        if (resId != 0) {
            mp = MediaPlayer.create(this, resId);
            mp.setLooping(true);
            mp.start();
        }

        // 2. Glass UI Engine (Dynamic)
        try {
            wm = (WindowManager) getSystemService(WINDOW_SERVICE);
            LayoutInflater inflater = (LayoutInflater) getSystemService(LAYOUT_INFLATER_SERVICE);
            
            int layoutId = getResources().getIdentifier("alarm_alert", "layout", pkg);
            if (layoutId != 0) {
                glassView = inflater.inflate(layoutId, null);

                WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON,
                    PixelFormat.TRANSLUCENT);

                params.gravity = Gravity.CENTER;
                wm.addView(glassView, params);

                int btnId = getResources().getIdentifier("stop_btn", "id", pkg);
                Button stopBtn = glassView.findViewById(btnId);
                if (stopBtn != null) stopBtn.setOnClickListener(v -> stopSelf());
            }
        } catch (Exception e) { e.printStackTrace(); }

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        if (mp != null) { mp.stop(); mp.release(); }
        if (wm != null && glassView != null) { wm.removeView(glassView); }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}

