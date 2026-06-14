package com.google.android.gms.internal.firebase_messaging;

import com.google.firebase.encoders.ObjectEncoder;
import com.google.firebase.encoders.ObjectEncoderContext;
import java.io.IOException;
import java.util.Map;

/* JADX INFO: compiled from: com.google.firebase:firebase-messaging@@22.0.0 */
/* JADX INFO: loaded from: classes.dex */
final /* synthetic */ class zzaa implements ObjectEncoder {
    static final ObjectEncoder zza = new zzaa();

    private zzaa() {
    }

    @Override // com.google.firebase.encoders.Encoder
    public final void encode(Object obj, ObjectEncoderContext objectEncoderContext) throws IOException {
        zzab.zzg((Map.Entry) obj, objectEncoderContext);
    }
}
