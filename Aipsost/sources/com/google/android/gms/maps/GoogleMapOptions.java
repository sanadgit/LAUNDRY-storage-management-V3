package com.google.android.gms.maps;

import android.content.Context;
import android.content.res.TypedArray;
import android.os.Parcel;
import android.os.Parcelable;
import android.util.AttributeSet;
import com.google.android.gms.common.internal.Objects;
import com.google.android.gms.common.internal.ReflectedParcelable;
import com.google.android.gms.common.internal.safeparcel.AbstractSafeParcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelWriter;
import com.google.android.gms.maps.model.CameraPosition;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.LatLngBounds;

/* JADX INFO: compiled from: com.google.android.gms:play-services-maps@@17.0.1 */
/* JADX INFO: loaded from: classes.dex */
public final class GoogleMapOptions extends AbstractSafeParcelable implements ReflectedParcelable {
    public static final Parcelable.Creator<GoogleMapOptions> CREATOR = new zzab();
    private Boolean zza;
    private Boolean zzb;
    private int zzc;
    private CameraPosition zzd;
    private Boolean zze;
    private Boolean zzf;
    private Boolean zzg;
    private Boolean zzh;
    private Boolean zzi;
    private Boolean zzj;
    private Boolean zzk;
    private Boolean zzl;
    private Boolean zzm;
    private Float zzn;
    private Float zzo;
    private LatLngBounds zzp;
    private Boolean zzq;

    public GoogleMapOptions() {
        this.zzc = -1;
        this.zzn = null;
        this.zzo = null;
        this.zzp = null;
    }

    public static GoogleMapOptions createFromAttributes(Context context, AttributeSet attrs) {
        if (context == null || attrs == null) {
            return null;
        }
        TypedArray typedArrayObtainAttributes = context.getResources().obtainAttributes(attrs, R.styleable.MapAttrs);
        GoogleMapOptions googleMapOptions = new GoogleMapOptions();
        if (typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_mapType)) {
            googleMapOptions.mapType(typedArrayObtainAttributes.getInt(R.styleable.MapAttrs_mapType, -1));
        }
        if (typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_zOrderOnTop)) {
            googleMapOptions.zOrderOnTop(typedArrayObtainAttributes.getBoolean(R.styleable.MapAttrs_zOrderOnTop, false));
        }
        if (typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_useViewLifecycle)) {
            googleMapOptions.useViewLifecycleInFragment(typedArrayObtainAttributes.getBoolean(R.styleable.MapAttrs_useViewLifecycle, false));
        }
        if (typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_uiCompass)) {
            googleMapOptions.compassEnabled(typedArrayObtainAttributes.getBoolean(R.styleable.MapAttrs_uiCompass, true));
        }
        if (typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_uiRotateGestures)) {
            googleMapOptions.rotateGesturesEnabled(typedArrayObtainAttributes.getBoolean(R.styleable.MapAttrs_uiRotateGestures, true));
        }
        if (typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_uiScrollGesturesDuringRotateOrZoom)) {
            googleMapOptions.scrollGesturesEnabledDuringRotateOrZoom(typedArrayObtainAttributes.getBoolean(R.styleable.MapAttrs_uiScrollGesturesDuringRotateOrZoom, true));
        }
        if (typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_uiScrollGestures)) {
            googleMapOptions.scrollGesturesEnabled(typedArrayObtainAttributes.getBoolean(R.styleable.MapAttrs_uiScrollGestures, true));
        }
        if (typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_uiTiltGestures)) {
            googleMapOptions.tiltGesturesEnabled(typedArrayObtainAttributes.getBoolean(R.styleable.MapAttrs_uiTiltGestures, true));
        }
        if (typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_uiZoomGestures)) {
            googleMapOptions.zoomGesturesEnabled(typedArrayObtainAttributes.getBoolean(R.styleable.MapAttrs_uiZoomGestures, true));
        }
        if (typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_uiZoomControls)) {
            googleMapOptions.zoomControlsEnabled(typedArrayObtainAttributes.getBoolean(R.styleable.MapAttrs_uiZoomControls, true));
        }
        if (typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_liteMode)) {
            googleMapOptions.liteMode(typedArrayObtainAttributes.getBoolean(R.styleable.MapAttrs_liteMode, false));
        }
        if (typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_uiMapToolbar)) {
            googleMapOptions.mapToolbarEnabled(typedArrayObtainAttributes.getBoolean(R.styleable.MapAttrs_uiMapToolbar, true));
        }
        if (typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_ambientEnabled)) {
            googleMapOptions.ambientEnabled(typedArrayObtainAttributes.getBoolean(R.styleable.MapAttrs_ambientEnabled, false));
        }
        if (typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_cameraMinZoomPreference)) {
            googleMapOptions.minZoomPreference(typedArrayObtainAttributes.getFloat(R.styleable.MapAttrs_cameraMinZoomPreference, Float.NEGATIVE_INFINITY));
        }
        if (typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_cameraMinZoomPreference)) {
            googleMapOptions.maxZoomPreference(typedArrayObtainAttributes.getFloat(R.styleable.MapAttrs_cameraMaxZoomPreference, Float.POSITIVE_INFINITY));
        }
        googleMapOptions.latLngBoundsForCameraTarget(zza(context, attrs));
        googleMapOptions.camera(zzb(context, attrs));
        typedArrayObtainAttributes.recycle();
        return googleMapOptions;
    }

    public static LatLngBounds zza(Context context, AttributeSet attributeSet) {
        if (context == null || attributeSet == null) {
            return null;
        }
        TypedArray typedArrayObtainAttributes = context.getResources().obtainAttributes(attributeSet, R.styleable.MapAttrs);
        Float fValueOf = typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_latLngBoundsSouthWestLatitude) ? Float.valueOf(typedArrayObtainAttributes.getFloat(R.styleable.MapAttrs_latLngBoundsSouthWestLatitude, 0.0f)) : null;
        Float fValueOf2 = typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_latLngBoundsSouthWestLongitude) ? Float.valueOf(typedArrayObtainAttributes.getFloat(R.styleable.MapAttrs_latLngBoundsSouthWestLongitude, 0.0f)) : null;
        Float fValueOf3 = typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_latLngBoundsNorthEastLatitude) ? Float.valueOf(typedArrayObtainAttributes.getFloat(R.styleable.MapAttrs_latLngBoundsNorthEastLatitude, 0.0f)) : null;
        Float fValueOf4 = typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_latLngBoundsNorthEastLongitude) ? Float.valueOf(typedArrayObtainAttributes.getFloat(R.styleable.MapAttrs_latLngBoundsNorthEastLongitude, 0.0f)) : null;
        typedArrayObtainAttributes.recycle();
        if (fValueOf == null || fValueOf2 == null || fValueOf3 == null || fValueOf4 == null) {
            return null;
        }
        return new LatLngBounds(new LatLng(fValueOf.floatValue(), fValueOf2.floatValue()), new LatLng(fValueOf3.floatValue(), fValueOf4.floatValue()));
    }

    public static CameraPosition zzb(Context context, AttributeSet attributeSet) {
        if (context == null || attributeSet == null) {
            return null;
        }
        TypedArray typedArrayObtainAttributes = context.getResources().obtainAttributes(attributeSet, R.styleable.MapAttrs);
        LatLng latLng = new LatLng(typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_cameraTargetLat) ? typedArrayObtainAttributes.getFloat(R.styleable.MapAttrs_cameraTargetLat, 0.0f) : 0.0f, typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_cameraTargetLng) ? typedArrayObtainAttributes.getFloat(R.styleable.MapAttrs_cameraTargetLng, 0.0f) : 0.0f);
        CameraPosition.Builder builder = CameraPosition.builder();
        builder.target(latLng);
        if (typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_cameraZoom)) {
            builder.zoom(typedArrayObtainAttributes.getFloat(R.styleable.MapAttrs_cameraZoom, 0.0f));
        }
        if (typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_cameraBearing)) {
            builder.bearing(typedArrayObtainAttributes.getFloat(R.styleable.MapAttrs_cameraBearing, 0.0f));
        }
        if (typedArrayObtainAttributes.hasValue(R.styleable.MapAttrs_cameraTilt)) {
            builder.tilt(typedArrayObtainAttributes.getFloat(R.styleable.MapAttrs_cameraTilt, 0.0f));
        }
        typedArrayObtainAttributes.recycle();
        return builder.build();
    }

    public GoogleMapOptions ambientEnabled(boolean enabled) {
        this.zzm = Boolean.valueOf(enabled);
        return this;
    }

    public GoogleMapOptions camera(CameraPosition cameraPosition) {
        this.zzd = cameraPosition;
        return this;
    }

    public GoogleMapOptions compassEnabled(boolean enabled) {
        this.zzf = Boolean.valueOf(enabled);
        return this;
    }

    public Boolean getAmbientEnabled() {
        return this.zzm;
    }

    public CameraPosition getCamera() {
        return this.zzd;
    }

    public Boolean getCompassEnabled() {
        return this.zzf;
    }

    public LatLngBounds getLatLngBoundsForCameraTarget() {
        return this.zzp;
    }

    public Boolean getLiteMode() {
        return this.zzk;
    }

    public Boolean getMapToolbarEnabled() {
        return this.zzl;
    }

    public int getMapType() {
        return this.zzc;
    }

    public Float getMaxZoomPreference() {
        return this.zzo;
    }

    public Float getMinZoomPreference() {
        return this.zzn;
    }

    public Boolean getRotateGesturesEnabled() {
        return this.zzj;
    }

    public Boolean getScrollGesturesEnabled() {
        return this.zzg;
    }

    public Boolean getScrollGesturesEnabledDuringRotateOrZoom() {
        return this.zzq;
    }

    public Boolean getTiltGesturesEnabled() {
        return this.zzi;
    }

    public Boolean getUseViewLifecycleInFragment() {
        return this.zzb;
    }

    public Boolean getZOrderOnTop() {
        return this.zza;
    }

    public Boolean getZoomControlsEnabled() {
        return this.zze;
    }

    public Boolean getZoomGesturesEnabled() {
        return this.zzh;
    }

    public GoogleMapOptions latLngBoundsForCameraTarget(LatLngBounds latLngBounds) {
        this.zzp = latLngBounds;
        return this;
    }

    public GoogleMapOptions liteMode(boolean enabled) {
        this.zzk = Boolean.valueOf(enabled);
        return this;
    }

    public GoogleMapOptions mapToolbarEnabled(boolean enabled) {
        this.zzl = Boolean.valueOf(enabled);
        return this;
    }

    public GoogleMapOptions mapType(int i) {
        this.zzc = i;
        return this;
    }

    public GoogleMapOptions maxZoomPreference(float maxZoomPreference) {
        this.zzo = Float.valueOf(maxZoomPreference);
        return this;
    }

    public GoogleMapOptions minZoomPreference(float minZoomPreference) {
        this.zzn = Float.valueOf(minZoomPreference);
        return this;
    }

    public GoogleMapOptions rotateGesturesEnabled(boolean enabled) {
        this.zzj = Boolean.valueOf(enabled);
        return this;
    }

    public GoogleMapOptions scrollGesturesEnabled(boolean enabled) {
        this.zzg = Boolean.valueOf(enabled);
        return this;
    }

    public GoogleMapOptions scrollGesturesEnabledDuringRotateOrZoom(boolean enabled) {
        this.zzq = Boolean.valueOf(enabled);
        return this;
    }

    public GoogleMapOptions tiltGesturesEnabled(boolean enabled) {
        this.zzi = Boolean.valueOf(enabled);
        return this;
    }

    public String toString() {
        return Objects.toStringHelper(this).add("MapType", Integer.valueOf(this.zzc)).add("LiteMode", this.zzk).add("Camera", this.zzd).add("CompassEnabled", this.zzf).add("ZoomControlsEnabled", this.zze).add("ScrollGesturesEnabled", this.zzg).add("ZoomGesturesEnabled", this.zzh).add("TiltGesturesEnabled", this.zzi).add("RotateGesturesEnabled", this.zzj).add("ScrollGesturesEnabledDuringRotateOrZoom", this.zzq).add("MapToolbarEnabled", this.zzl).add("AmbientEnabled", this.zzm).add("MinZoomPreference", this.zzn).add("MaxZoomPreference", this.zzo).add("LatLngBoundsForCameraTarget", this.zzp).add("ZOrderOnTop", this.zza).add("UseViewLifecycleInFragment", this.zzb).toString();
    }

    public GoogleMapOptions useViewLifecycleInFragment(boolean useViewLifecycleInFragment) {
        this.zzb = Boolean.valueOf(useViewLifecycleInFragment);
        return this;
    }

    @Override // android.os.Parcelable
    public void writeToParcel(Parcel out, int flags) {
        int iBeginObjectHeader = SafeParcelWriter.beginObjectHeader(out);
        SafeParcelWriter.writeByte(out, 2, com.google.android.gms.maps.internal.zza.zzb(this.zza));
        SafeParcelWriter.writeByte(out, 3, com.google.android.gms.maps.internal.zza.zzb(this.zzb));
        SafeParcelWriter.writeInt(out, 4, getMapType());
        SafeParcelWriter.writeParcelable(out, 5, getCamera(), flags, false);
        SafeParcelWriter.writeByte(out, 6, com.google.android.gms.maps.internal.zza.zzb(this.zze));
        SafeParcelWriter.writeByte(out, 7, com.google.android.gms.maps.internal.zza.zzb(this.zzf));
        SafeParcelWriter.writeByte(out, 8, com.google.android.gms.maps.internal.zza.zzb(this.zzg));
        SafeParcelWriter.writeByte(out, 9, com.google.android.gms.maps.internal.zza.zzb(this.zzh));
        SafeParcelWriter.writeByte(out, 10, com.google.android.gms.maps.internal.zza.zzb(this.zzi));
        SafeParcelWriter.writeByte(out, 11, com.google.android.gms.maps.internal.zza.zzb(this.zzj));
        SafeParcelWriter.writeByte(out, 12, com.google.android.gms.maps.internal.zza.zzb(this.zzk));
        SafeParcelWriter.writeByte(out, 14, com.google.android.gms.maps.internal.zza.zzb(this.zzl));
        SafeParcelWriter.writeByte(out, 15, com.google.android.gms.maps.internal.zza.zzb(this.zzm));
        SafeParcelWriter.writeFloatObject(out, 16, getMinZoomPreference(), false);
        SafeParcelWriter.writeFloatObject(out, 17, getMaxZoomPreference(), false);
        SafeParcelWriter.writeParcelable(out, 18, getLatLngBoundsForCameraTarget(), flags, false);
        SafeParcelWriter.writeByte(out, 19, com.google.android.gms.maps.internal.zza.zzb(this.zzq));
        SafeParcelWriter.finishObjectHeader(out, iBeginObjectHeader);
    }

    public GoogleMapOptions zOrderOnTop(boolean zOrderOnTop) {
        this.zza = Boolean.valueOf(zOrderOnTop);
        return this;
    }

    public GoogleMapOptions zoomControlsEnabled(boolean enabled) {
        this.zze = Boolean.valueOf(enabled);
        return this;
    }

    public GoogleMapOptions zoomGesturesEnabled(boolean enabled) {
        this.zzh = Boolean.valueOf(enabled);
        return this;
    }

    GoogleMapOptions(byte b, byte b2, int i, CameraPosition cameraPosition, byte b3, byte b4, byte b5, byte b6, byte b7, byte b8, byte b9, byte b10, byte b11, Float f, Float f2, LatLngBounds latLngBounds, byte b12) {
        this.zzc = -1;
        this.zzn = null;
        this.zzo = null;
        this.zzp = null;
        this.zza = com.google.android.gms.maps.internal.zza.zza(b);
        this.zzb = com.google.android.gms.maps.internal.zza.zza(b2);
        this.zzc = i;
        this.zzd = cameraPosition;
        this.zze = com.google.android.gms.maps.internal.zza.zza(b3);
        this.zzf = com.google.android.gms.maps.internal.zza.zza(b4);
        this.zzg = com.google.android.gms.maps.internal.zza.zza(b5);
        this.zzh = com.google.android.gms.maps.internal.zza.zza(b6);
        this.zzi = com.google.android.gms.maps.internal.zza.zza(b7);
        this.zzj = com.google.android.gms.maps.internal.zza.zza(b8);
        this.zzk = com.google.android.gms.maps.internal.zza.zza(b9);
        this.zzl = com.google.android.gms.maps.internal.zza.zza(b10);
        this.zzm = com.google.android.gms.maps.internal.zza.zza(b11);
        this.zzn = f;
        this.zzo = f2;
        this.zzp = latLngBounds;
        this.zzq = com.google.android.gms.maps.internal.zza.zza(b12);
    }
}
