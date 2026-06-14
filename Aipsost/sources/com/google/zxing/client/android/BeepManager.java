package com.google.zxing.client.android;

import android.app.Activity;
import android.content.Context;
import android.content.res.AssetFileDescriptor;
import android.media.MediaPlayer;
import android.os.Vibrator;
import android.util.Log;
import java.io.IOException;

/* JADX INFO: loaded from: classes11.dex */
public final class BeepManager {
    private static final float BEEP_VOLUME = 0.1f;
    private static final String TAG = BeepManager.class.getSimpleName();
    private static final long VIBRATE_DURATION = 200;
    private final Context context;
    private boolean beepEnabled = true;
    private boolean vibrateEnabled = false;

    public BeepManager(Activity activity) {
        activity.setVolumeControlStream(3);
        this.context = activity.getApplicationContext();
    }

    public boolean isBeepEnabled() {
        return this.beepEnabled;
    }

    public void setBeepEnabled(boolean beepEnabled) {
        this.beepEnabled = beepEnabled;
    }

    public boolean isVibrateEnabled() {
        return this.vibrateEnabled;
    }

    public void setVibrateEnabled(boolean vibrateEnabled) {
        this.vibrateEnabled = vibrateEnabled;
    }

    public synchronized void playBeepSoundAndVibrate() {
        Vibrator vibrator;
        if (this.beepEnabled) {
            playBeepSound();
        }
        if (this.vibrateEnabled && (vibrator = (Vibrator) this.context.getSystemService("vibrator")) != null) {
            vibrator.vibrate(VIBRATE_DURATION);
        }
    }

    public MediaPlayer playBeepSound() {
        MediaPlayer mediaPlayer = new MediaPlayer();
        mediaPlayer.setAudioStreamType(3);
        mediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() { // from class: com.google.zxing.client.android.BeepManager.1
            @Override // android.media.MediaPlayer.OnCompletionListener
            public void onCompletion(MediaPlayer mp) {
                mp.stop();
                mp.release();
            }
        });
        mediaPlayer.setOnErrorListener(new MediaPlayer.OnErrorListener() { // from class: com.google.zxing.client.android.BeepManager.2
            @Override // android.media.MediaPlayer.OnErrorListener
            public boolean onError(MediaPlayer mp, int what, int extra) {
                Log.w(BeepManager.TAG, "Failed to beep " + what + ", " + extra);
                mp.stop();
                mp.release();
                return true;
            }
        });
        try {
            AssetFileDescriptor file = this.context.getResources().openRawResourceFd(R.raw.zxing_beep);
            try {
                mediaPlayer.setDataSource(file.getFileDescriptor(), file.getStartOffset(), file.getLength());
                file.close();
                mediaPlayer.setVolume(0.1f, 0.1f);
                mediaPlayer.prepare();
                mediaPlayer.start();
                return mediaPlayer;
            } catch (Throwable th) {
                file.close();
                throw th;
            }
        } catch (IOException ioe) {
            Log.w(TAG, ioe);
            mediaPlayer.release();
            return null;
        }
    }
}
