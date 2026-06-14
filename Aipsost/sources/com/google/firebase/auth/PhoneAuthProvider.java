package com.google.firebase.auth;

import android.app.Activity;
import android.os.Parcel;
import android.os.Parcelable;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.internal.safeparcel.AbstractSafeParcelable;
import com.google.android.gms.common.internal.safeparcel.SafeParcelWriter;
import com.google.android.gms.common.logging.Logger;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseException;
import com.google.firebase.auth.PhoneAuthOptions;
import java.util.concurrent.TimeUnit;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public class PhoneAuthProvider {
    public static final String PHONE_SIGN_IN_METHOD = "phone";
    public static final String PROVIDER_ID = "phone";
    private FirebaseAuth zza;

    /* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
    public static class ForceResendingToken extends AbstractSafeParcelable {
        public static final Parcelable.Creator<ForceResendingToken> CREATOR = new zzd();

        ForceResendingToken() {
        }

        public static ForceResendingToken zza() {
            return new ForceResendingToken();
        }

        @Override // android.os.Parcelable
        public final void writeToParcel(Parcel parcel, int i) {
            SafeParcelWriter.finishObjectHeader(parcel, SafeParcelWriter.beginObjectHeader(parcel));
        }
    }

    /* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
    public static abstract class OnVerificationStateChangedCallbacks {
        private static final Logger zza = new Logger("PhoneAuthProvider", new String[0]);

        public void onCodeAutoRetrievalTimeOut(String str) {
            zza.i("Sms auto retrieval timed-out.", new Object[0]);
        }

        public void onCodeSent(String str, ForceResendingToken forceResendingToken) {
        }

        public abstract void onVerificationCompleted(PhoneAuthCredential phoneAuthCredential);

        public abstract void onVerificationFailed(FirebaseException firebaseException);
    }

    private PhoneAuthProvider(FirebaseAuth firebaseAuth) {
        this.zza = firebaseAuth;
    }

    public static PhoneAuthCredential getCredential(String verificationId, String smsCode) {
        return PhoneAuthCredential.zzc(verificationId, smsCode);
    }

    @Deprecated
    public static PhoneAuthProvider getInstance() {
        return new PhoneAuthProvider(FirebaseAuth.getInstance(FirebaseApp.getInstance()));
    }

    @Deprecated
    public static PhoneAuthProvider getInstance(FirebaseAuth firebaseAuth) {
        return new PhoneAuthProvider(firebaseAuth);
    }

    public static void verifyPhoneNumber(PhoneAuthOptions options) {
        Preconditions.checkNotNull(options);
        options.zzb().zzI(options);
    }

    @Deprecated
    public void verifyPhoneNumber(String phoneNumber, long timeout, TimeUnit unit, Activity activity, OnVerificationStateChangedCallbacks callbacks) {
        PhoneAuthOptions.Builder builderNewBuilder = PhoneAuthOptions.newBuilder(this.zza);
        builderNewBuilder.setPhoneNumber(phoneNumber);
        builderNewBuilder.setTimeout(Long.valueOf(timeout), unit);
        builderNewBuilder.setActivity(activity);
        builderNewBuilder.setCallbacks(callbacks);
        verifyPhoneNumber(builderNewBuilder.build());
    }

    @Deprecated
    public void verifyPhoneNumber(String phoneNumber, long timeout, TimeUnit unit, Activity activity, OnVerificationStateChangedCallbacks callbacks, ForceResendingToken forceResendingToken) {
        PhoneAuthOptions.Builder builderNewBuilder = PhoneAuthOptions.newBuilder(this.zza);
        builderNewBuilder.setPhoneNumber(phoneNumber);
        builderNewBuilder.setTimeout(Long.valueOf(timeout), unit);
        builderNewBuilder.setActivity(activity);
        builderNewBuilder.setCallbacks(callbacks);
        if (forceResendingToken != null) {
            builderNewBuilder.setForceResendingToken(forceResendingToken);
        }
        verifyPhoneNumber(builderNewBuilder.build());
    }
}
