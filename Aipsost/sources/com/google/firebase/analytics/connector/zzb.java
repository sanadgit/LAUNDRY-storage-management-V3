package com.google.firebase.analytics.connector;

import com.google.firebase.events.Event;
import com.google.firebase.events.EventHandler;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-api@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final /* synthetic */ class zzb implements EventHandler {
    static final EventHandler zza = new zzb();

    private zzb() {
    }

    @Override // com.google.firebase.events.EventHandler
    public final void handle(Event event) {
        AnalyticsConnectorImpl.zza(event);
    }
}
