package com.google.android.gms.location.places;

import android.os.Parcel;
import android.os.Parcelable;
import androidx.core.os.EnvironmentCompat;
import com.google.android.gms.common.internal.Objects;
import com.google.android.gms.common.internal.ReflectedParcelable;
import com.google.android.gms.common.internal.safeparcel.AbstractSafeParcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelWriter;

/* JADX INFO: loaded from: classes.dex */
public class PlaceReport extends AbstractSafeParcelable implements ReflectedParcelable {
    public static final Parcelable.Creator<PlaceReport> CREATOR = new zza();
    private final String tag;
    private final int versionCode;
    private final String zza;
    private final String zzb;

    PlaceReport(int i, String str, String str2, String str3) {
        this.versionCode = i;
        this.zza = str;
        this.tag = str2;
        this.zzb = str3;
    }

    /* JADX WARN: Can't fix incorrect switch cases order, some code will duplicate */
    /* JADX WARN: Removed duplicated region for block: B:23:0x004f  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public static com.google.android.gms.location.places.PlaceReport create(java.lang.String r4, java.lang.String r5) {
        /*
            com.google.android.gms.common.internal.Preconditions.checkNotNull(r4)
            com.google.android.gms.common.internal.Preconditions.checkNotEmpty(r5)
            java.lang.String r0 = "unknown"
            com.google.android.gms.common.internal.Preconditions.checkNotEmpty(r0)
            int r1 = r0.hashCode()
            r2 = 0
            r3 = 1
            switch(r1) {
                case -1436706272: goto L45;
                case -1194968642: goto L3b;
                case -284840886: goto L33;
                case -262743844: goto L29;
                case 1164924125: goto L1f;
                case 1287171955: goto L15;
                default: goto L14;
            }
        L14:
            goto L4f
        L15:
            java.lang.String r1 = "inferredRadioSignals"
            boolean r1 = r0.equals(r1)
            if (r1 == 0) goto L4f
            r1 = 3
            goto L50
        L1f:
            java.lang.String r1 = "inferredSnappedToRoad"
            boolean r1 = r0.equals(r1)
            if (r1 == 0) goto L4f
            r1 = 5
            goto L50
        L29:
            java.lang.String r1 = "inferredReverseGeocoding"
            boolean r1 = r0.equals(r1)
            if (r1 == 0) goto L4f
            r1 = 4
            goto L50
        L33:
            boolean r1 = r0.equals(r0)
            if (r1 == 0) goto L4f
            r1 = 0
            goto L50
        L3b:
            java.lang.String r1 = "userReported"
            boolean r1 = r0.equals(r1)
            if (r1 == 0) goto L4f
            r1 = 1
            goto L50
        L45:
            java.lang.String r1 = "inferredGeofencing"
            boolean r1 = r0.equals(r1)
            if (r1 == 0) goto L4f
            r1 = 2
            goto L50
        L4f:
            r1 = -1
        L50:
            switch(r1) {
                case 0: goto L54;
                case 1: goto L54;
                case 2: goto L54;
                case 3: goto L54;
                case 4: goto L54;
                case 5: goto L54;
                default: goto L53;
            }
        L53:
            goto L55
        L54:
            r2 = 1
        L55:
            java.lang.String r1 = "Invalid source"
            com.google.android.gms.common.internal.Preconditions.checkArgument(r2, r1)
            com.google.android.gms.location.places.PlaceReport r1 = new com.google.android.gms.location.places.PlaceReport
            r1.<init>(r3, r4, r5, r0)
            return r1
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.location.places.PlaceReport.create(java.lang.String, java.lang.String):com.google.android.gms.location.places.PlaceReport");
    }

    public boolean equals(Object obj) {
        if (!(obj instanceof PlaceReport)) {
            return false;
        }
        PlaceReport placeReport = (PlaceReport) obj;
        return Objects.equal(this.zza, placeReport.zza) && Objects.equal(this.tag, placeReport.tag) && Objects.equal(this.zzb, placeReport.zzb);
    }

    public String getPlaceId() {
        return this.zza;
    }

    public String getTag() {
        return this.tag;
    }

    public int hashCode() {
        return Objects.hashCode(this.zza, this.tag, this.zzb);
    }

    public String toString() {
        Objects.ToStringHelper stringHelper = Objects.toStringHelper(this);
        stringHelper.add("placeId", this.zza);
        stringHelper.add("tag", this.tag);
        if (!EnvironmentCompat.MEDIA_UNKNOWN.equals(this.zzb)) {
            stringHelper.add("source", this.zzb);
        }
        return stringHelper.toString();
    }

    @Override // android.os.Parcelable
    public void writeToParcel(Parcel parcel, int i) {
        int iBeginObjectHeader = SafeParcelWriter.beginObjectHeader(parcel);
        SafeParcelWriter.writeInt(parcel, 1, this.versionCode);
        SafeParcelWriter.writeString(parcel, 2, getPlaceId(), false);
        SafeParcelWriter.writeString(parcel, 3, getTag(), false);
        SafeParcelWriter.writeString(parcel, 4, this.zzb, false);
        SafeParcelWriter.finishObjectHeader(parcel, iBeginObjectHeader);
    }
}
