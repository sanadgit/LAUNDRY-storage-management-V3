package com.google.android.gms.auth.api.phone;

import com.google.android.gms.tasks.Task;

/* JADX INFO: compiled from: com.google.android.gms:play-services-auth-api-phone@@17.4.0 */
/* JADX INFO: loaded from: classes.dex */
public interface SmsRetrieverApi {
    Task<Void> startSmsRetriever();

    Task<Void> startSmsUserConsent(String str);
}
