package com.google.android.gms.ads.identifier;

import android.net.Uri;
import android.util.Log;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

/* JADX INFO: loaded from: classes.dex */
final class zza extends Thread {
    private final /* synthetic */ Map zzl;

    zza(AdvertisingIdClient advertisingIdClient, Map map) {
        this.zzl = map;
    }

    @Override // java.lang.Thread, java.lang.Runnable
    public final void run() {
        String message;
        StringBuilder sb;
        String str;
        Exception exc;
        new zzc();
        Map map = this.zzl;
        Uri.Builder builderBuildUpon = Uri.parse("https://pagead2.googlesyndication.com/pagead/gen_204?id=gmob-apps").buildUpon();
        for (String str2 : map.keySet()) {
            builderBuildUpon.appendQueryParameter(str2, (String) map.get(str2));
        }
        String string = builderBuildUpon.build().toString();
        try {
            HttpURLConnection httpURLConnection = (HttpURLConnection) new URL(string).openConnection();
            try {
                int responseCode = httpURLConnection.getResponseCode();
                if (responseCode < 200 || responseCode >= 300) {
                    Log.w("HttpUrlPinger", new StringBuilder(String.valueOf(string).length() + 65).append("Received non-success response code ").append(responseCode).append(" from pinging URL: ").append(string).toString());
                }
            } finally {
                httpURLConnection.disconnect();
            }
        } catch (IOException e) {
            e = e;
            message = e.getMessage();
            sb = new StringBuilder(String.valueOf(string).length() + 27 + String.valueOf(message).length());
            str = "Error while pinging URL: ";
            exc = e;
            Log.w("HttpUrlPinger", sb.append(str).append(string).append(". ").append(message).toString(), exc);
        } catch (IndexOutOfBoundsException e2) {
            message = e2.getMessage();
            sb = new StringBuilder(String.valueOf(string).length() + 32 + String.valueOf(message).length());
            str = "Error while parsing ping URL: ";
            exc = e2;
            Log.w("HttpUrlPinger", sb.append(str).append(string).append(". ").append(message).toString(), exc);
        } catch (RuntimeException e3) {
            e = e3;
            message = e.getMessage();
            sb = new StringBuilder(String.valueOf(string).length() + 27 + String.valueOf(message).length());
            str = "Error while pinging URL: ";
            exc = e;
            Log.w("HttpUrlPinger", sb.append(str).append(string).append(". ").append(message).toString(), exc);
        }
    }
}
