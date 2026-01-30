package com.remindrapp;

import android.app.Service;
import android.content.Intent;
import android.media.MediaPlayer;
import android.os.IBinder;
import com.remindrapp.R; // Ye line dhoond rahi hai aapki ringtone ko

public class AlarmService extends Service {
    MediaPlayer mp;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Aapki favourite ringtone yahan bajegi
        mp = MediaPlayer.create(this, R.raw.iphone_alarm); 
        if (mp != null) {
            mp.setLooping(true);
            mp.start();
        }
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        if (mp != null) {
            mp.stop();
            mp.release();
        }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}

