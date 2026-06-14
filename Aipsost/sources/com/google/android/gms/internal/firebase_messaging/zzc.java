package com.google.android.gms.internal.firebase_messaging;

import com.google.firebase.encoders.FieldDescriptor;
import com.google.firebase.encoders.ObjectEncoder;
import com.google.firebase.encoders.ObjectEncoderContext;
import java.io.IOException;

/* JADX INFO: compiled from: com.google.firebase:firebase-messaging@@22.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzc implements ObjectEncoder<zze> {
    static final zzc zza = new zzc();
    private static final FieldDescriptor zzb = FieldDescriptor.of("messagingClientEventExtension");

    private zzc() {
    }

    @Override // com.google.firebase.encoders.Encoder
    public final /* bridge */ /* synthetic */ void encode(Object obj, ObjectEncoderContext objectEncoderContext) throws IOException {
        objectEncoderContext.add(zzb, ((zze) obj).zzc());
    }
}
