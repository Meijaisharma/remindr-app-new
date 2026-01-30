package com.remindrapp;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.media.MediaPlayer;
import androidx.core.app.NotificationCompat;

public class AlarmService extends Service {
    MediaPlayer mediaPlayer;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Notification Channel banana (Android 8.0+ ke liye)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                "alarm_channel", "Alarm Alerts", NotificationManager.IMPORTANCE_HIGH);
            getSystemService(NotificationManager.class).createNotificationChannel(channel);
        }

        // Notification jo status bar mein dikhegi
        Notification notification = new NotificationCompat.Builder(this, "alarm_channel")
            .setContentTitle("Remindr Alarm")
            .setContentText("Aapka alarm baj raha hai...")
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .build();

        startForeground(1, notification);
        
        // Ringtone bajane ka logic (iphone_alarm.mp3)
        mediaPlayer = MediaPlayer.create(this, R.raw.iphone_alarm); 
        mediaPlayer.setLooping(true);
        mediaPlayer.start();

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        if (mediaPlayer != null) {
            mediaPlayer.stop();
            mediaPlayer.release();
        }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}

