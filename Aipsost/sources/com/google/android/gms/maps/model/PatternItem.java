package com.google.android.gms.maps.model;

import android.os.Parcel;
import android.os.Parcelable;
import android.util.Log;
import com.google.android.gms.common.internal.Objects;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.internal.safeparcel.AbstractSafeParcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelWriter;
import java.util.ArrayList;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public class PatternItem extends AbstractSafeParcelable {
    private final int zzb;
    private final Float zzc;
    private static final String zza = PatternItem.class.getSimpleName();
    public static final Parcelable.Creator<PatternItem> CREATOR = new zzj();

    public PatternItem(int i, Float f) {
        boolean z = true;
        if (i != 1 && (f == null || f.floatValue() < 0.0f)) {
            z = false;
        }
        String strValueOf = String.valueOf(f);
        StringBuilder sb = new StringBuilder(String.valueOf(strValueOf).length() + 45);
        sb.append("Invalid PatternItem: type=");
        sb.append(i);
        sb.append(" length=");
        sb.append(strValueOf);
        Preconditions.checkArgument(z, sb.toString());
        this.zzb = i;
        this.zzc = f;
    }

    static List<PatternItem> zza(List<PatternItem> list) {
        if (list == null) {
            return null;
        }
        ArrayList arrayList = new ArrayList(list.size());
        for (PatternItem dash : list) {
            if (dash != null) {
                int i = dash.zzb;
                switch (i) {
                    case 0:
                        Preconditions.checkState(dash.zzc != null, "length must not be null.");
                        dash = new Dash(dash.zzc.floatValue());
                        break;
                    case 1:
                        dash = new Dot();
                        break;
                    case 2:
                        Preconditions.checkState(dash.zzc != null, "length must not be null.");
                        dash = new Gap(dash.zzc.floatValue());
                        break;
                    default:
                        String str = zza;
                        StringBuilder sb = new StringBuilder(37);
                        sb.append("Unknown PatternItem type: ");
                        sb.append(i);
                        Log.w(str, sb.toString());
                        break;
                }
            } else {
                dash = null;
            }
            arrayList.add(dash);
        }
        return arrayList;
    }

    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PatternItem)) {
            return false;
        }
        PatternItem patternItem = (PatternItem) o;
        return this.zzb == patternItem.zzb && Objects.equal(this.zzc, patternItem.zzc);
    }

    public int hashCode() {
        return Objects.hashCode(Integer.valueOf(this.zzb), this.zzc);
    }

    public String toString() {
        int i = this.zzb;
        String strValueOf = String.valueOf(this.zzc);
        StringBuilder sb = new StringBuilder(String.valueOf(strValueOf).length() + 39);
        sb.append("[PatternItem: type=");
        sb.append(i);
        sb.append(" length=");
        sb.append(strValueOf);
        sb.append("]");
        return sb.toString();
    }

    @Override // android.os.Parcelable
    public void writeToParcel(Parcel out, int i) {
        int iBeginObjectHeader = SafeParcelWriter.beginObjectHeader(out);
        SafeParcelWriter.writeInt(out, 2, this.zzb);
        SafeParcelWriter.writeFloatObject(out, 3, this.zzc, false);
        SafeParcelWriter.finishObjectHeader(out, iBeginObjectHeader);
    }
}
