package com.google.firebase.auth.internal;

import android.net.Uri;
import android.os.Parcel;
import android.os.Parcelable;
import androidx.exifinterface.media.ExifInterface;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.internal.safeparcel.SafeParcelWriter;
import com.google.android.gms.internal.p001firebaseauthapi.zzzy;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuthProvider;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.FirebaseUserMetadata;
import com.google.firebase.auth.MultiFactor;
import com.google.firebase.auth.MultiFactorInfo;
import com.google.firebase.auth.PhoneMultiFactorInfo;
import com.google.firebase.auth.UserInfo;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzx extends FirebaseUser {
    public static final Parcelable.Creator<zzx> CREATOR = new zzy();
    private zzzy zza;
    private zzt zzb;
    private final String zzc;
    private String zzd;
    private List zze;
    private List zzf;
    private String zzg;
    private Boolean zzh;
    private zzz zzi;
    private boolean zzj;
    private com.google.firebase.auth.zze zzk;
    private zzbb zzl;

    public zzx(FirebaseApp firebaseApp, List list) {
        Preconditions.checkNotNull(firebaseApp);
        this.zzc = firebaseApp.getName();
        this.zzd = "com.google.firebase.auth.internal.DefaultFirebaseUser";
        this.zzg = ExifInterface.GPS_MEASUREMENT_2D;
        zzc(list);
    }

    public static FirebaseUser zzk(FirebaseApp firebaseApp, FirebaseUser firebaseUser) {
        zzx zzxVar = new zzx(firebaseApp, firebaseUser.getProviderData());
        if (firebaseUser instanceof zzx) {
            zzx zzxVar2 = (zzx) firebaseUser;
            zzxVar.zzg = zzxVar2.zzg;
            zzxVar.zzd = zzxVar2.zzd;
            zzxVar.zzi = zzxVar2.zzi;
        } else {
            zzxVar.zzi = null;
        }
        if (firebaseUser.zzd() != null) {
            zzxVar.zzh(firebaseUser.zzd());
        }
        if (!firebaseUser.isAnonymous()) {
            zzxVar.zzm();
        }
        return zzxVar;
    }

    @Override // com.google.firebase.auth.FirebaseUser, com.google.firebase.auth.UserInfo
    public final String getDisplayName() {
        return this.zzb.getDisplayName();
    }

    @Override // com.google.firebase.auth.FirebaseUser, com.google.firebase.auth.UserInfo
    public final String getEmail() {
        return this.zzb.getEmail();
    }

    @Override // com.google.firebase.auth.FirebaseUser
    public final FirebaseUserMetadata getMetadata() {
        return this.zzi;
    }

    @Override // com.google.firebase.auth.FirebaseUser
    public final /* synthetic */ MultiFactor getMultiFactor() {
        return new zzac(this);
    }

    @Override // com.google.firebase.auth.FirebaseUser, com.google.firebase.auth.UserInfo
    public final String getPhoneNumber() {
        return this.zzb.getPhoneNumber();
    }

    @Override // com.google.firebase.auth.FirebaseUser, com.google.firebase.auth.UserInfo
    public final Uri getPhotoUrl() {
        return this.zzb.getPhotoUrl();
    }

    @Override // com.google.firebase.auth.FirebaseUser
    public final List<? extends UserInfo> getProviderData() {
        return this.zze;
    }

    @Override // com.google.firebase.auth.FirebaseUser, com.google.firebase.auth.UserInfo
    public final String getProviderId() {
        return this.zzb.getProviderId();
    }

    @Override // com.google.firebase.auth.FirebaseUser
    public final String getTenantId() {
        Map map;
        zzzy zzzyVar = this.zza;
        if (zzzyVar == null || zzzyVar.zze() == null || (map = (Map) zzay.zza(zzzyVar.zze()).getClaims().get(FirebaseAuthProvider.PROVIDER_ID)) == null) {
            return null;
        }
        return (String) map.get("tenant");
    }

    @Override // com.google.firebase.auth.FirebaseUser, com.google.firebase.auth.UserInfo
    public final String getUid() {
        return this.zzb.getUid();
    }

    @Override // com.google.firebase.auth.FirebaseUser
    public final boolean isAnonymous() {
        Boolean bool = this.zzh;
        if (bool == null || bool.booleanValue()) {
            zzzy zzzyVar = this.zza;
            String signInProvider = zzzyVar != null ? zzay.zza(zzzyVar.zze()).getSignInProvider() : "";
            boolean z = false;
            if (this.zze.size() <= 1 && (signInProvider == null || !signInProvider.equals("custom"))) {
                z = true;
            }
            this.zzh = Boolean.valueOf(z);
        }
        return this.zzh.booleanValue();
    }

    @Override // com.google.firebase.auth.UserInfo
    public final boolean isEmailVerified() {
        return this.zzb.isEmailVerified();
    }

    @Override // android.os.Parcelable
    public final void writeToParcel(Parcel parcel, int i) {
        int iBeginObjectHeader = SafeParcelWriter.beginObjectHeader(parcel);
        SafeParcelWriter.writeParcelable(parcel, 1, this.zza, i, false);
        SafeParcelWriter.writeParcelable(parcel, 2, this.zzb, i, false);
        SafeParcelWriter.writeString(parcel, 3, this.zzc, false);
        SafeParcelWriter.writeString(parcel, 4, this.zzd, false);
        SafeParcelWriter.writeTypedList(parcel, 5, this.zze, false);
        SafeParcelWriter.writeStringList(parcel, 6, this.zzf, false);
        SafeParcelWriter.writeString(parcel, 7, this.zzg, false);
        SafeParcelWriter.writeBooleanObject(parcel, 8, Boolean.valueOf(isAnonymous()), false);
        SafeParcelWriter.writeParcelable(parcel, 9, this.zzi, i, false);
        SafeParcelWriter.writeBoolean(parcel, 10, this.zzj);
        SafeParcelWriter.writeParcelable(parcel, 11, this.zzk, i, false);
        SafeParcelWriter.writeParcelable(parcel, 12, this.zzl, i, false);
        SafeParcelWriter.finishObjectHeader(parcel, iBeginObjectHeader);
    }

    @Override // com.google.firebase.auth.FirebaseUser
    public final FirebaseApp zza() {
        return FirebaseApp.getInstance(this.zzc);
    }

    @Override // com.google.firebase.auth.FirebaseUser
    public final /* bridge */ /* synthetic */ FirebaseUser zzb() {
        zzm();
        return this;
    }

    @Override // com.google.firebase.auth.FirebaseUser
    public final synchronized FirebaseUser zzc(List list) {
        Preconditions.checkNotNull(list);
        this.zze = new ArrayList(list.size());
        this.zzf = new ArrayList(list.size());
        for (int i = 0; i < list.size(); i++) {
            UserInfo userInfo = (UserInfo) list.get(i);
            if (userInfo.getProviderId().equals(FirebaseAuthProvider.PROVIDER_ID)) {
                this.zzb = (zzt) userInfo;
            } else {
                this.zzf.add(userInfo.getProviderId());
            }
            this.zze.add((zzt) userInfo);
        }
        if (this.zzb == null) {
            this.zzb = (zzt) this.zze.get(0);
        }
        return this;
    }

    @Override // com.google.firebase.auth.FirebaseUser
    public final zzzy zzd() {
        return this.zza;
    }

    @Override // com.google.firebase.auth.FirebaseUser
    public final String zze() {
        return this.zza.zze();
    }

    @Override // com.google.firebase.auth.FirebaseUser
    public final String zzf() {
        return this.zza.zzh();
    }

    @Override // com.google.firebase.auth.FirebaseUser
    public final List zzg() {
        return this.zzf;
    }

    @Override // com.google.firebase.auth.FirebaseUser
    public final void zzh(zzzy zzzyVar) {
        this.zza = (zzzy) Preconditions.checkNotNull(zzzyVar);
    }

    @Override // com.google.firebase.auth.FirebaseUser
    public final void zzi(List list) {
        Parcelable.Creator<zzbb> creator = zzbb.CREATOR;
        zzbb zzbbVar = null;
        if (list != null && !list.isEmpty()) {
            ArrayList arrayList = new ArrayList();
            Iterator it = list.iterator();
            while (it.hasNext()) {
                MultiFactorInfo multiFactorInfo = (MultiFactorInfo) it.next();
                if (multiFactorInfo instanceof PhoneMultiFactorInfo) {
                    arrayList.add((PhoneMultiFactorInfo) multiFactorInfo);
                }
            }
            zzbbVar = new zzbb(arrayList);
        }
        this.zzl = zzbbVar;
    }

    public final com.google.firebase.auth.zze zzj() {
        return this.zzk;
    }

    public final zzx zzl(String str) {
        this.zzg = str;
        return this;
    }

    public final zzx zzm() {
        this.zzh = false;
        return this;
    }

    public final List zzn() {
        zzbb zzbbVar = this.zzl;
        return zzbbVar != null ? zzbbVar.zza() : new ArrayList();
    }

    public final List zzo() {
        return this.zze;
    }

    public final void zzp(com.google.firebase.auth.zze zzeVar) {
        this.zzk = zzeVar;
    }

    public final void zzq(boolean z) {
        this.zzj = z;
    }

    public final void zzr(zzz zzzVar) {
        this.zzi = zzzVar;
    }

    public final boolean zzs() {
        return this.zzj;
    }

    zzx(zzzy zzzyVar, zzt zztVar, String str, String str2, List list, List list2, String str3, Boolean bool, zzz zzzVar, boolean z, com.google.firebase.auth.zze zzeVar, zzbb zzbbVar) {
        this.zza = zzzyVar;
        this.zzb = zztVar;
        this.zzc = str;
        this.zzd = str2;
        this.zze = list;
        this.zzf = list2;
        this.zzg = str3;
        this.zzh = bool;
        this.zzi = zzzVar;
        this.zzj = z;
        this.zzk = zzeVar;
        this.zzl = zzbbVar;
    }
}
