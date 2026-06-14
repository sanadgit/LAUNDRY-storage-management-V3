package com.google.android.gms.measurement.internal;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.DeadObjectException;
import android.os.IBinder;
import android.os.IInterface;
import android.os.Looper;
import android.os.RemoteException;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.internal.BaseGmsClient;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.stats.ConnectionTracker;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzjj implements ServiceConnection, BaseGmsClient.BaseConnectionCallbacks, BaseGmsClient.BaseOnConnectionFailedListener {
    final /* synthetic */ zzjk zza;
    private volatile boolean zzb;
    private volatile zzei zzc;

    protected zzjj(zzjk zzjkVar) {
        this.zza = zzjkVar;
    }

    static /* synthetic */ boolean zzd(zzjj zzjjVar, boolean z) {
        zzjjVar.zzb = false;
        return false;
    }

    @Override // com.google.android.gms.common.internal.BaseGmsClient.BaseConnectionCallbacks
    public final void onConnected(Bundle bundle) {
        Preconditions.checkMainThread("MeasurementServiceConnection.onConnected");
        synchronized (this) {
            try {
                Preconditions.checkNotNull(this.zzc);
                this.zza.zzs.zzav().zzh(new zzjg(this, this.zzc.getService()));
            } catch (DeadObjectException | IllegalStateException e) {
                this.zzc = null;
                this.zzb = false;
            }
        }
    }

    @Override // com.google.android.gms.common.internal.BaseGmsClient.BaseOnConnectionFailedListener
    public final void onConnectionFailed(ConnectionResult connectionResult) {
        Preconditions.checkMainThread("MeasurementServiceConnection.onConnectionFailed");
        zzem zzemVarZzf = this.zza.zzs.zzf();
        if (zzemVarZzf != null) {
            zzemVarZzf.zze().zzb("Service connection failed", connectionResult);
        }
        synchronized (this) {
            this.zzb = false;
            this.zzc = null;
        }
        this.zza.zzs.zzav().zzh(new zzji(this));
    }

    @Override // com.google.android.gms.common.internal.BaseGmsClient.BaseConnectionCallbacks
    public final void onConnectionSuspended(int i) {
        Preconditions.checkMainThread("MeasurementServiceConnection.onConnectionSuspended");
        this.zza.zzs.zzau().zzj().zza("Service connection suspended");
        this.zza.zzs.zzav().zzh(new zzjh(this));
    }

    @Override // android.content.ServiceConnection
    public final void onServiceConnected(ComponentName componentName, IBinder iBinder) {
        Preconditions.checkMainThread("MeasurementServiceConnection.onServiceConnected");
        synchronized (this) {
            if (iBinder == null) {
                this.zzb = false;
                this.zza.zzs.zzau().zzb().zza("Service connected with null binder");
                return;
            }
            zzed zzebVar = null;
            try {
                String interfaceDescriptor = iBinder.getInterfaceDescriptor();
                if ("com.google.android.gms.measurement.internal.IMeasurementService".equals(interfaceDescriptor)) {
                    IInterface iInterfaceQueryLocalInterface = iBinder.queryLocalInterface("com.google.android.gms.measurement.internal.IMeasurementService");
                    zzebVar = iInterfaceQueryLocalInterface instanceof zzed ? (zzed) iInterfaceQueryLocalInterface : new zzeb(iBinder);
                    try {
                        this.zza.zzs.zzau().zzk().zza("Bound to IMeasurementService interface");
                    } catch (RemoteException e) {
                        this.zza.zzs.zzau().zzb().zza("Service connect failed to get IMeasurementService");
                    }
                } else {
                    this.zza.zzs.zzau().zzb().zzb("Got binder with a wrong descriptor", interfaceDescriptor);
                }
            } catch (RemoteException e2) {
            }
            if (zzebVar == null) {
                this.zzb = false;
                try {
                    ConnectionTracker.getInstance().unbindService(this.zza.zzs.zzax(), this.zza.zza);
                } catch (IllegalArgumentException e3) {
                }
            } else {
                this.zza.zzs.zzav().zzh(new zzje(this, zzebVar));
            }
        }
    }

    @Override // android.content.ServiceConnection
    public final void onServiceDisconnected(ComponentName componentName) {
        Preconditions.checkMainThread("MeasurementServiceConnection.onServiceDisconnected");
        this.zza.zzs.zzau().zzj().zza("Service disconnected");
        this.zza.zzs.zzav().zzh(new zzjf(this, componentName));
    }

    public final void zza(Intent intent) {
        this.zza.zzg();
        Context contextZzax = this.zza.zzs.zzax();
        ConnectionTracker connectionTracker = ConnectionTracker.getInstance();
        synchronized (this) {
            if (this.zzb) {
                this.zza.zzs.zzau().zzk().zza("Connection attempt already in progress");
                return;
            }
            this.zza.zzs.zzau().zzk().zza("Using local app measurement service");
            this.zzb = true;
            connectionTracker.bindService(contextZzax, intent, this.zza.zza, 129);
        }
    }

    public final void zzb() {
        if (this.zzc != null && (this.zzc.isConnected() || this.zzc.isConnecting())) {
            this.zzc.disconnect();
        }
        this.zzc = null;
    }

    public final void zzc() {
        this.zza.zzg();
        Context contextZzax = this.zza.zzs.zzax();
        synchronized (this) {
            if (this.zzb) {
                this.zza.zzs.zzau().zzk().zza("Connection attempt already in progress");
                return;
            }
            if (this.zzc != null && (this.zzc.isConnecting() || this.zzc.isConnected())) {
                this.zza.zzs.zzau().zzk().zza("Already awaiting connection attempt");
                return;
            }
            this.zzc = new zzei(contextZzax, Looper.getMainLooper(), this, this);
            this.zza.zzs.zzau().zzk().zza("Connecting to remote service");
            this.zzb = true;
            Preconditions.checkNotNull(this.zzc);
            this.zzc.checkAvailabilityAndConnect();
        }
    }
}
