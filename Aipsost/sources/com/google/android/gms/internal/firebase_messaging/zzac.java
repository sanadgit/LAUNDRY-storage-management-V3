package com.google.android.gms.internal.firebase_messaging;

import com.google.firebase.encoders.EncodingException;
import com.google.firebase.encoders.ObjectEncoder;
import com.google.firebase.encoders.ObjectEncoderContext;

/* JADX INFO: compiled from: com.google.firebase:firebase-messaging@@22.0.0 */
/* JADX INFO: loaded from: classes.dex */
final /* synthetic */ class zzac implements ObjectEncoder {
    static final ObjectEncoder zza = new zzac();

    private zzac() {
    }

    @Override // com.google.firebase.encoders.Encoder
    public final void encode(Object obj, ObjectEncoderContext objectEncoderContext) {
        int i = zzad.zza;
        String strValueOf = String.valueOf(obj.getClass().getCanonicalName());
        throw new EncodingException(strValueOf.length() != 0 ? "Couldn't find encoder for type ".concat(strValueOf) : new String("Couldn't find encoder for type "));
    }
}
