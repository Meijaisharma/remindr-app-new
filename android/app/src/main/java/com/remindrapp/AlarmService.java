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
import com.remindrapp.R;

public class AlarmService extends Service {
    private MediaPlayer mp;
    private WindowManager wm;
    private View glassView;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // 1. Audio Engine: Aapki ringtone bajana
        mp = MediaPlayer.create(this, R.raw.iphone_alarm); 
        if (mp != null) {
            mp.setLooping(true);
            mp.start();
        }

        // 2. UI Engine: Lock screen ke upar Glass popup dikhana
        try {
            wm = (WindowManager) getSystemService(WINDOW_SERVICE);
            LayoutInflater inflater = (LayoutInflater) getSystemService(LAYOUT_INFLATER_SERVICE);
            glassView = inflater.inflate(R.layout.alarm_alert, null);

            WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON,
                PixelFormat.TRANSLUCENT);

            params.gravity = Gravity.CENTER;
            wm.addView(glassView, params);

            // Stop button ka logic
            Button stopBtn = glassView.findViewById(R.id.stop_btn);
            stopBtn.setOnClickListener(v -> stopSelf());

        } catch (Exception e) {
            // Agar permission nahi hai toh crash nahi hoga, bas popup nahi dikhega
            e.printStackTrace();
        }

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

