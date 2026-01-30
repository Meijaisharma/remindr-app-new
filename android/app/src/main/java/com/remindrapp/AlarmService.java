package com.remindrapp;

import android.app.Service;
import android.content.Intent;
import android.media.MediaPlayer;
import android.os.IBinder;

public class AlarmService extends Service {
    MediaPlayer mp;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Aapne jo iphone_alarm.mp3 copy ki thi, wo baje gi
        mp = MediaPlayer.create(this, R.raw.iphone_alarm); 
        mp.setLooping(true);
        mp.start();
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        if (mp != null) mp.stop();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}

