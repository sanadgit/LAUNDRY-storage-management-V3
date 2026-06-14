package com.google.android.gms.internal.measurement;

import com.google.android.gms.internal.measurement.zzjp;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.ServiceConfigurationError;
import java.util.ServiceLoader;
import java.util.logging.Level;
import java.util.logging.Logger;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
abstract class zzjx<T extends zzjp> {
    private static final Logger zza = Logger.getLogger(zzjk.class.getName());
    private static final String zzb = "com.google.protobuf.BlazeGeneratedExtensionRegistryLiteLoader";

    zzjx() {
    }

    static <T extends zzjp> T zzb(Class<T> cls) {
        String str;
        ClassLoader classLoader = zzjx.class.getClassLoader();
        if (cls.equals(zzjp.class)) {
            str = zzb;
        } else {
            if (!cls.getPackage().equals(zzjx.class.getPackage())) {
                throw new IllegalArgumentException(cls.getName());
            }
            str = String.format("%s.BlazeGenerated%sLoader", cls.getPackage().getName(), cls.getSimpleName());
        }
        try {
            try {
                try {
                    try {
                        return cls.cast(((zzjx) Class.forName(str, true, classLoader).getConstructor(new Class[0]).newInstance(new Object[0])).zza());
                    } catch (IllegalAccessException e) {
                        throw new IllegalStateException(e);
                    } catch (NoSuchMethodException e2) {
                        throw new IllegalStateException(e2);
                    }
                } catch (InvocationTargetException e3) {
                    throw new IllegalStateException(e3);
                }
            } catch (InstantiationException e4) {
                throw new IllegalStateException(e4);
            }
        } catch (ClassNotFoundException e5) {
            Iterator it = ServiceLoader.load(zzjx.class, classLoader).iterator();
            ArrayList arrayList = new ArrayList();
            while (it.hasNext()) {
                try {
                    arrayList.add(cls.cast(((zzjx) it.next()).zza()));
                } catch (ServiceConfigurationError e6) {
                    Logger logger = zza;
                    Level level = Level.SEVERE;
                    String strValueOf = String.valueOf(cls.getSimpleName());
                    logger.logp(level, "com.google.protobuf.GeneratedExtensionRegistryLoader", "load", strValueOf.length() != 0 ? "Unable to load ".concat(strValueOf) : new String("Unable to load "), (Throwable) e6);
                }
            }
            if (arrayList.size() == 1) {
                return (T) arrayList.get(0);
            }
            if (arrayList.size() == 0) {
                return null;
            }
            try {
                return (T) cls.getMethod("combine", Collection.class).invoke(null, arrayList);
            } catch (IllegalAccessException e7) {
                throw new IllegalStateException(e7);
            } catch (NoSuchMethodException e8) {
                throw new IllegalStateException(e8);
            } catch (InvocationTargetException e9) {
                throw new IllegalStateException(e9);
            }
        }
    }

    protected abstract T zza();
}
