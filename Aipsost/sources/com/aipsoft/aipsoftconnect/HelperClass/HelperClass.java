package com.aipsoft.aipsoftconnect.HelperClass;

import android.content.Context;
import android.media.MediaPlayer;
import com.aipsoft.aipsoftconnect.R;

/* JADX INFO: loaded from: classes9.dex */
public class HelperClass {
    static MediaPlayer mp;

    public static void startMusic(Context applicationContext) {
        MediaPlayer mediaPlayerCreate = MediaPlayer.create(applicationContext, R.raw.notify);
        mp = mediaPlayerCreate;
        mediaPlayerCreate.start();
    }

    public static void stopMusic() {
        if (mp.isPlaying()) {
            mp.stop();
        }
    }
}
