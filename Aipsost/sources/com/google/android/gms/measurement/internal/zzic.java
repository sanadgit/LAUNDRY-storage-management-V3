package com.google.android.gms.measurement.internal;

import android.content.Context;
import android.content.res.Resources;
import android.text.TextUtils;
import com.google.android.gms.common.internal.Preconditions;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzic {
    public static String zza(Context context, String str, String str2) {
        Preconditions.checkNotNull(context);
        Resources resources = context.getResources();
        if (TextUtils.isEmpty(str2)) {
            str2 = zzfm.zza(context);
        }
        return zzfm.zzb("google_app_id", resources, str2);
    }

    public static Object zzb(Object obj) throws Throwable {
        Throwable th;
        ObjectInputStream objectInputStream;
        ObjectOutputStream objectOutputStream;
        try {
            if (obj == null) {
                return null;
            }
            try {
                ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
                objectOutputStream = new ObjectOutputStream(byteArrayOutputStream);
                try {
                    objectOutputStream.writeObject(obj);
                    objectOutputStream.flush();
                    objectInputStream = new ObjectInputStream(new ByteArrayInputStream(byteArrayOutputStream.toByteArray()));
                } catch (Throwable th2) {
                    th = th2;
                    objectInputStream = null;
                }
                try {
                    Object object = objectInputStream.readObject();
                    objectOutputStream.close();
                    objectInputStream.close();
                    return object;
                } catch (Throwable th3) {
                    th = th3;
                    if (objectOutputStream != null) {
                        objectOutputStream.close();
                    }
                    if (objectInputStream == null) {
                        throw th;
                    }
                    objectInputStream.close();
                    throw th;
                }
            } catch (Throwable th4) {
                th = th4;
                objectInputStream = null;
                objectOutputStream = null;
            }
        } catch (IOException e) {
            return null;
        } catch (ClassNotFoundException e2) {
            return null;
        }
    }

    public static String zzc(String str, String[] strArr, String[] strArr2) {
        Preconditions.checkNotNull(strArr);
        Preconditions.checkNotNull(strArr2);
        int iMin = Math.min(strArr.length, strArr2.length);
        for (int i = 0; i < iMin; i++) {
            String str2 = strArr[i];
            if ((str == null && str2 == null) || (str != null && str.equals(str2))) {
                return strArr2[i];
            }
        }
        return null;
    }
}
