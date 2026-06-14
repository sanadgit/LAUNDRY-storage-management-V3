package com.google.android.gms.internal.measurement;

import com.google.android.gms.internal.measurement.zzin;
import com.google.android.gms.internal.measurement.zzio;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public abstract class zzio<MessageType extends zzio<MessageType, BuilderType>, BuilderType extends zzin<MessageType, BuilderType>> implements zzli {
    protected int zzb = 0;

    /* JADX WARN: Multi-variable type inference failed */
    protected static <T> void zzbs(Iterable<T> iterable, List<? super T> list) {
        zzkl.zza(iterable);
        if (iterable instanceof zzks) {
            List<?> listZzh = ((zzks) iterable).zzh();
            zzks zzksVar = (zzks) list;
            int size = list.size();
            for (Object obj : listZzh) {
                if (obj == null) {
                    int size2 = zzksVar.size();
                    StringBuilder sb = new StringBuilder(37);
                    sb.append("Element at index ");
                    sb.append(size2 - size);
                    sb.append(" is null.");
                    String string = sb.toString();
                    for (int size3 = zzksVar.size() - 1; size3 >= size; size3--) {
                        zzksVar.remove(size3);
                    }
                    throw new NullPointerException(string);
                }
                if (obj instanceof zzjd) {
                    zzksVar.zzf((zzjd) obj);
                } else {
                    zzksVar.add((String) obj);
                }
            }
            return;
        }
        if (iterable instanceof zzlp) {
            list.addAll(iterable);
            return;
        }
        if ((list instanceof ArrayList) && (iterable instanceof Collection)) {
            ((ArrayList) list).ensureCapacity(list.size() + iterable.size());
        }
        int size4 = list.size();
        for (T t : iterable) {
            if (t == null) {
                int size5 = list.size();
                StringBuilder sb2 = new StringBuilder(37);
                sb2.append("Element at index ");
                sb2.append(size5 - size4);
                sb2.append(" is null.");
                String string2 = sb2.toString();
                for (int size6 = list.size() - 1; size6 >= size4; size6--) {
                    list.remove(size6);
                }
                throw new NullPointerException(string2);
            }
            list.add(t);
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzli
    public final zzjd zzbo() {
        try {
            int iZzbw = zzbw();
            zzjd zzjdVar = zzjd.zzb;
            byte[] bArr = new byte[iZzbw];
            zzjk zzjkVarZzt = zzjk.zzt(bArr);
            zzbv(zzjkVarZzt);
            zzjkVarZzt.zzC();
            return new zzjb(bArr);
        } catch (IOException e) {
            String name = getClass().getName();
            StringBuilder sb = new StringBuilder(String.valueOf(name).length() + 72);
            sb.append("Serializing ");
            sb.append(name);
            sb.append(" to a ByteString threw an IOException (should never happen).");
            throw new RuntimeException(sb.toString(), e);
        }
    }

    public final byte[] zzbp() {
        try {
            byte[] bArr = new byte[zzbw()];
            zzjk zzjkVarZzt = zzjk.zzt(bArr);
            zzbv(zzjkVarZzt);
            zzjkVarZzt.zzC();
            return bArr;
        } catch (IOException e) {
            String name = getClass().getName();
            StringBuilder sb = new StringBuilder(String.valueOf(name).length() + 72);
            sb.append("Serializing ");
            sb.append(name);
            sb.append(" to a byte array threw an IOException (should never happen).");
            throw new RuntimeException(sb.toString(), e);
        }
    }

    int zzbq() {
        throw null;
    }

    void zzbr(int i) {
        throw null;
    }
}
