package com.google.firebase.auth;

import android.app.Activity;
import android.text.TextUtils;
import android.util.Log;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.internal.p001firebaseauthapi.zzaal;
import com.google.android.gms.internal.p001firebaseauthapi.zzwy;
import com.google.android.gms.internal.p001firebaseauthapi.zzxc;
import com.google.android.gms.internal.p001firebaseauthapi.zzxh;
import com.google.android.gms.internal.p001firebaseauthapi.zzxr;
import com.google.android.gms.internal.p001firebaseauthapi.zzyp;
import com.google.android.gms.internal.p001firebaseauthapi.zzyz;
import com.google.android.gms.internal.p001firebaseauthapi.zzzy;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseError;
import com.google.firebase.auth.PhoneAuthProvider;
import com.google.firebase.auth.internal.InternalAuthProvider;
import com.google.firebase.auth.internal.zzay;
import com.google.firebase.auth.internal.zzbg;
import com.google.firebase.auth.internal.zzbi;
import com.google.firebase.auth.internal.zzbj;
import com.google.firebase.auth.internal.zzbk;
import com.google.firebase.auth.internal.zzbm;
import com.google.firebase.inject.Provider;
import com.google.firebase.internal.InternalTokenResult;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public abstract class FirebaseAuth implements InternalAuthProvider {
    private FirebaseApp zza;
    private final List zzb;
    private final List zzc;
    private List zzd;
    private zzwy zze;
    private FirebaseUser zzf;
    private com.google.firebase.auth.internal.zzw zzg;
    private final Object zzh;
    private String zzi;
    private final Object zzj;
    private String zzk;
    private final zzbg zzl;
    private final zzbm zzm;
    private final com.google.firebase.auth.internal.zzf zzn;
    private final Provider zzo;
    private zzbi zzp;
    private zzbj zzq;

    /* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
    public interface AuthStateListener {
        void onAuthStateChanged(FirebaseAuth firebaseAuth);
    }

    /* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
    public interface IdTokenListener {
        void onIdTokenChanged(FirebaseAuth firebaseAuth);
    }

    public FirebaseAuth(FirebaseApp firebaseApp, Provider provider) {
        zzzy zzzyVarZzb;
        zzwy zzwyVar = new zzwy(firebaseApp);
        zzbg zzbgVar = new zzbg(firebaseApp.getApplicationContext(), firebaseApp.getPersistenceKey());
        zzbm zzbmVarZzc = zzbm.zzc();
        com.google.firebase.auth.internal.zzf zzfVarZzb = com.google.firebase.auth.internal.zzf.zzb();
        this.zzb = new CopyOnWriteArrayList();
        this.zzc = new CopyOnWriteArrayList();
        this.zzd = new CopyOnWriteArrayList();
        this.zzh = new Object();
        this.zzj = new Object();
        this.zzq = zzbj.zza();
        this.zza = (FirebaseApp) Preconditions.checkNotNull(firebaseApp);
        this.zze = (zzwy) Preconditions.checkNotNull(zzwyVar);
        zzbg zzbgVar2 = (zzbg) Preconditions.checkNotNull(zzbgVar);
        this.zzl = zzbgVar2;
        this.zzg = new com.google.firebase.auth.internal.zzw();
        zzbm zzbmVar = (zzbm) Preconditions.checkNotNull(zzbmVarZzc);
        this.zzm = zzbmVar;
        this.zzn = (com.google.firebase.auth.internal.zzf) Preconditions.checkNotNull(zzfVarZzb);
        this.zzo = provider;
        FirebaseUser firebaseUserZza = zzbgVar2.zza();
        this.zzf = firebaseUserZza;
        if (firebaseUserZza != null && (zzzyVarZzb = zzbgVar2.zzb(firebaseUserZza)) != null) {
            zzH(this, this.zzf, zzzyVarZzb, false, false);
        }
        zzbmVar.zze(this);
    }

    public static FirebaseAuth getInstance() {
        return (FirebaseAuth) FirebaseApp.getInstance().get(FirebaseAuth.class);
    }

    public static void zzF(FirebaseAuth firebaseAuth, FirebaseUser firebaseUser) {
        if (firebaseUser != null) {
            Log.d("FirebaseAuth", "Notifying auth state listeners about user ( " + firebaseUser.getUid() + " ).");
        } else {
            Log.d("FirebaseAuth", "Notifying auth state listeners about a sign-out event.");
        }
        firebaseAuth.zzq.execute(new zzm(firebaseAuth));
    }

    public static void zzG(FirebaseAuth firebaseAuth, FirebaseUser firebaseUser) {
        if (firebaseUser != null) {
            Log.d("FirebaseAuth", "Notifying id token listeners about user ( " + firebaseUser.getUid() + " ).");
        } else {
            Log.d("FirebaseAuth", "Notifying id token listeners about a sign-out event.");
        }
        firebaseAuth.zzq.execute(new zzl(firebaseAuth, new InternalTokenResult(firebaseUser != null ? firebaseUser.zze() : null)));
    }

    static void zzH(FirebaseAuth firebaseAuth, FirebaseUser firebaseUser, zzzy zzzyVar, boolean z, boolean z2) {
        boolean z3;
        Preconditions.checkNotNull(firebaseUser);
        Preconditions.checkNotNull(zzzyVar);
        boolean z4 = true;
        boolean z5 = firebaseAuth.zzf != null && firebaseUser.getUid().equals(firebaseAuth.zzf.getUid());
        if (z5 || !z2) {
            FirebaseUser firebaseUser2 = firebaseAuth.zzf;
            if (firebaseUser2 == null) {
                z3 = true;
            } else {
                boolean z6 = !z5 || (firebaseUser2.zzd().zze().equals(zzzyVar.zze()) ^ true);
                z3 = true ^ z5;
                z4 = z6;
            }
            Preconditions.checkNotNull(firebaseUser);
            FirebaseUser firebaseUser3 = firebaseAuth.zzf;
            if (firebaseUser3 == null) {
                firebaseAuth.zzf = firebaseUser;
            } else {
                firebaseUser3.zzc(firebaseUser.getProviderData());
                if (!firebaseUser.isAnonymous()) {
                    firebaseAuth.zzf.zzb();
                }
                firebaseAuth.zzf.zzi(firebaseUser.getMultiFactor().getEnrolledFactors());
            }
            if (z) {
                firebaseAuth.zzl.zzd(firebaseAuth.zzf);
            }
            if (z4) {
                FirebaseUser firebaseUser4 = firebaseAuth.zzf;
                if (firebaseUser4 != null) {
                    firebaseUser4.zzh(zzzyVar);
                }
                zzG(firebaseAuth, firebaseAuth.zzf);
            }
            if (z3) {
                zzF(firebaseAuth, firebaseAuth.zzf);
            }
            if (z) {
                firebaseAuth.zzl.zze(firebaseUser, zzzyVar);
            }
            FirebaseUser firebaseUser5 = firebaseAuth.zzf;
            if (firebaseUser5 != null) {
                zzx(firebaseAuth).zze(firebaseUser5.zzd());
            }
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final PhoneAuthProvider.OnVerificationStateChangedCallbacks zzL(String str, PhoneAuthProvider.OnVerificationStateChangedCallbacks onVerificationStateChangedCallbacks) {
        return (this.zzg.zzd() && str != null && str.equals(this.zzg.zza())) ? new zzq(this, onVerificationStateChangedCallbacks) : onVerificationStateChangedCallbacks;
    }

    private final boolean zzM(String str) {
        ActionCodeUrl link = ActionCodeUrl.parseLink(str);
        return (link == null || TextUtils.equals(this.zzk, link.zza())) ? false : true;
    }

    public static zzbi zzx(FirebaseAuth firebaseAuth) {
        if (firebaseAuth.zzp == null) {
            firebaseAuth.zzp = new zzbi((FirebaseApp) Preconditions.checkNotNull(firebaseAuth.zza));
        }
        return firebaseAuth.zzp;
    }

    public void addAuthStateListener(AuthStateListener listener) {
        this.zzd.add(listener);
        this.zzq.execute(new zzk(this, listener));
    }

    public void addIdTokenListener(IdTokenListener listener) {
        this.zzb.add(listener);
        ((zzbj) Preconditions.checkNotNull(this.zzq)).execute(new zzj(this, listener));
    }

    public Task<Void> applyActionCode(String code) {
        Preconditions.checkNotEmpty(code);
        return this.zze.zza(this.zza, code, this.zzk);
    }

    public Task<ActionCodeResult> checkActionCode(String code) {
        Preconditions.checkNotEmpty(code);
        return this.zze.zzb(this.zza, code, this.zzk);
    }

    public Task<Void> confirmPasswordReset(String code, String newPassword) {
        Preconditions.checkNotEmpty(code);
        Preconditions.checkNotEmpty(newPassword);
        return this.zze.zzc(this.zza, code, newPassword, this.zzk);
    }

    public Task<AuthResult> createUserWithEmailAndPassword(String email, String password) {
        Preconditions.checkNotEmpty(email);
        Preconditions.checkNotEmpty(password);
        return this.zze.zzd(this.zza, email, password, this.zzk, new zzs(this));
    }

    public Task<SignInMethodQueryResult> fetchSignInMethodsForEmail(String email) {
        Preconditions.checkNotEmpty(email);
        return this.zze.zzf(this.zza, email, this.zzk);
    }

    @Override // com.google.firebase.auth.internal.InternalAuthProvider, com.google.firebase.internal.InternalTokenProvider
    public final Task getAccessToken(boolean z) {
        return zzc(this.zzf, z);
    }

    public FirebaseApp getApp() {
        return this.zza;
    }

    public FirebaseUser getCurrentUser() {
        return this.zzf;
    }

    public FirebaseAuthSettings getFirebaseAuthSettings() {
        return this.zzg;
    }

    public String getLanguageCode() {
        String str;
        synchronized (this.zzh) {
            str = this.zzi;
        }
        return str;
    }

    public Task<AuthResult> getPendingAuthResult() {
        return this.zzm.zza();
    }

    public String getTenantId() {
        String str;
        synchronized (this.zzj) {
            str = this.zzk;
        }
        return str;
    }

    @Override // com.google.firebase.auth.internal.InternalAuthProvider, com.google.firebase.internal.InternalTokenProvider
    public final String getUid() {
        FirebaseUser firebaseUser = this.zzf;
        if (firebaseUser == null) {
            return null;
        }
        return firebaseUser.getUid();
    }

    public boolean isSignInWithEmailLink(String link) {
        return EmailAuthCredential.zzi(link);
    }

    public void removeAuthStateListener(AuthStateListener listener) {
        this.zzd.remove(listener);
    }

    public void removeIdTokenListener(IdTokenListener listener) {
        this.zzb.remove(listener);
    }

    public Task<Void> sendPasswordResetEmail(String email) {
        Preconditions.checkNotEmpty(email);
        return sendPasswordResetEmail(email, null);
    }

    public Task<Void> sendSignInLinkToEmail(String email, ActionCodeSettings actionCodeSettings) {
        Preconditions.checkNotEmpty(email);
        Preconditions.checkNotNull(actionCodeSettings);
        if (!actionCodeSettings.canHandleCodeInApp()) {
            throw new IllegalArgumentException("You must set canHandleCodeInApp in your ActionCodeSettings to true for Email-Link Sign-in.");
        }
        String str = this.zzi;
        if (str != null) {
            actionCodeSettings.zzf(str);
        }
        return this.zze.zzv(this.zza, email, actionCodeSettings, this.zzk);
    }

    public Task<Void> setFirebaseUIVersion(String firebaseUIVersion) {
        return this.zze.zzw(firebaseUIVersion);
    }

    public void setLanguageCode(String languageCode) {
        Preconditions.checkNotEmpty(languageCode);
        synchronized (this.zzh) {
            this.zzi = languageCode;
        }
    }

    public void setTenantId(String tenantId) {
        Preconditions.checkNotEmpty(tenantId);
        synchronized (this.zzj) {
            this.zzk = tenantId;
        }
    }

    public Task<AuthResult> signInAnonymously() {
        FirebaseUser firebaseUser = this.zzf;
        if (firebaseUser == null || !firebaseUser.isAnonymous()) {
            return this.zze.zzx(this.zza, new zzs(this), this.zzk);
        }
        com.google.firebase.auth.internal.zzx zzxVar = (com.google.firebase.auth.internal.zzx) this.zzf;
        zzxVar.zzq(false);
        return Tasks.forResult(new com.google.firebase.auth.internal.zzr(zzxVar));
    }

    public Task<AuthResult> signInWithCredential(AuthCredential credential) {
        Preconditions.checkNotNull(credential);
        AuthCredential authCredentialZza = credential.zza();
        if (authCredentialZza instanceof EmailAuthCredential) {
            EmailAuthCredential emailAuthCredential = (EmailAuthCredential) authCredentialZza;
            return !emailAuthCredential.zzg() ? this.zze.zzA(this.zza, emailAuthCredential.zzd(), Preconditions.checkNotEmpty(emailAuthCredential.zze()), this.zzk, new zzs(this)) : zzM(Preconditions.checkNotEmpty(emailAuthCredential.zzf())) ? Tasks.forException(zzxc.zza(new Status(17072))) : this.zze.zzB(this.zza, emailAuthCredential, new zzs(this));
        }
        if (authCredentialZza instanceof PhoneAuthCredential) {
            return this.zze.zzC(this.zza, (PhoneAuthCredential) authCredentialZza, this.zzk, new zzs(this));
        }
        return this.zze.zzy(this.zza, authCredentialZza, this.zzk, new zzs(this));
    }

    public Task<AuthResult> signInWithCustomToken(String token) {
        Preconditions.checkNotEmpty(token);
        return this.zze.zzz(this.zza, token, this.zzk, new zzs(this));
    }

    public Task<AuthResult> signInWithEmailAndPassword(String email, String password) {
        Preconditions.checkNotEmpty(email);
        Preconditions.checkNotEmpty(password);
        return this.zze.zzA(this.zza, email, password, this.zzk, new zzs(this));
    }

    public Task<AuthResult> signInWithEmailLink(String email, String link) {
        return signInWithCredential(EmailAuthProvider.getCredentialWithLink(email, link));
    }

    public void signOut() {
        zzD();
        zzbi zzbiVar = this.zzp;
        if (zzbiVar != null) {
            zzbiVar.zzc();
        }
    }

    public Task<AuthResult> startActivityForSignInWithProvider(Activity activity, FederatedAuthProvider federatedAuthProvider) {
        Preconditions.checkNotNull(federatedAuthProvider);
        Preconditions.checkNotNull(activity);
        TaskCompletionSource taskCompletionSource = new TaskCompletionSource();
        if (!this.zzm.zzi(activity, taskCompletionSource, this)) {
            return Tasks.forException(zzxc.zza(new Status(17057)));
        }
        this.zzm.zzg(activity.getApplicationContext(), this);
        federatedAuthProvider.zzc(activity);
        return taskCompletionSource.getTask();
    }

    public Task<Void> updateCurrentUser(FirebaseUser user) {
        String str;
        if (user == null) {
            throw new IllegalArgumentException("Cannot update current user with null user!");
        }
        String tenantId = user.getTenantId();
        if ((tenantId != null && !tenantId.equals(this.zzk)) || ((str = this.zzk) != null && !str.equals(tenantId))) {
            return Tasks.forException(zzxc.zza(new Status(17072)));
        }
        String apiKey = user.zza().getOptions().getApiKey();
        String apiKey2 = this.zza.getOptions().getApiKey();
        if (!user.zzd().zzj() || !apiKey2.equals(apiKey)) {
            return zzg(user, new zzu(this));
        }
        zzE(com.google.firebase.auth.internal.zzx.zzk(this.zza, user), user.zzd(), true);
        return Tasks.forResult(null);
    }

    public void useAppLanguage() {
        synchronized (this.zzh) {
            this.zzi = zzxr.zza();
        }
    }

    public void useEmulator(String host, int port) {
        Preconditions.checkNotEmpty(host);
        boolean z = false;
        if (port >= 0 && port <= 65535) {
            z = true;
        }
        Preconditions.checkArgument(z, "Port number must be in the range 0-65535");
        zzyz.zzf(this.zza, host, port);
    }

    public Task<String> verifyPasswordResetCode(String code) {
        Preconditions.checkNotEmpty(code);
        return this.zze.zzM(this.zza, code, this.zzk);
    }

    public final void zzD() {
        Preconditions.checkNotNull(this.zzl);
        FirebaseUser firebaseUser = this.zzf;
        if (firebaseUser != null) {
            zzbg zzbgVar = this.zzl;
            Preconditions.checkNotNull(firebaseUser);
            zzbgVar.zzc(String.format("com.google.firebase.auth.GET_TOKEN_RESPONSE.%s", firebaseUser.getUid()));
            this.zzf = null;
        }
        this.zzl.zzc("com.google.firebase.auth.FIREBASE_USER");
        zzG(this, null);
        zzF(this, null);
    }

    public final void zzE(FirebaseUser firebaseUser, zzzy zzzyVar, boolean z) {
        zzH(this, firebaseUser, zzzyVar, true, false);
    }

    public final void zzI(PhoneAuthOptions phoneAuthOptions) {
        if (phoneAuthOptions.zzk()) {
            FirebaseAuth firebaseAuthZzb = phoneAuthOptions.zzb();
            String strCheckNotEmpty = ((com.google.firebase.auth.internal.zzag) Preconditions.checkNotNull(phoneAuthOptions.zzc())).zze() ? Preconditions.checkNotEmpty(phoneAuthOptions.zzh()) : Preconditions.checkNotEmpty(((PhoneMultiFactorInfo) Preconditions.checkNotNull(phoneAuthOptions.zzf())).getUid());
            if (phoneAuthOptions.zzd() == null || !zzyp.zzd(strCheckNotEmpty, phoneAuthOptions.zze(), (Activity) Preconditions.checkNotNull(phoneAuthOptions.zza()), phoneAuthOptions.zzi())) {
                firebaseAuthZzb.zzn.zza(firebaseAuthZzb, phoneAuthOptions.zzh(), (Activity) Preconditions.checkNotNull(phoneAuthOptions.zza()), firebaseAuthZzb.zzK()).addOnCompleteListener(new zzp(firebaseAuthZzb, phoneAuthOptions));
                return;
            }
            return;
        }
        FirebaseAuth firebaseAuthZzb2 = phoneAuthOptions.zzb();
        String strCheckNotEmpty2 = Preconditions.checkNotEmpty(phoneAuthOptions.zzh());
        long jLongValue = phoneAuthOptions.zzg().longValue();
        TimeUnit timeUnit = TimeUnit.SECONDS;
        PhoneAuthProvider.OnVerificationStateChangedCallbacks onVerificationStateChangedCallbacksZze = phoneAuthOptions.zze();
        Activity activity = (Activity) Preconditions.checkNotNull(phoneAuthOptions.zza());
        Executor executorZzi = phoneAuthOptions.zzi();
        boolean z = phoneAuthOptions.zzd() != null;
        if (z || !zzyp.zzd(strCheckNotEmpty2, onVerificationStateChangedCallbacksZze, activity, executorZzi)) {
            firebaseAuthZzb2.zzn.zza(firebaseAuthZzb2, strCheckNotEmpty2, activity, firebaseAuthZzb2.zzK()).addOnCompleteListener(new zzo(firebaseAuthZzb2, strCheckNotEmpty2, jLongValue, timeUnit, onVerificationStateChangedCallbacksZze, activity, executorZzi, z));
        }
    }

    public final void zzJ(String str, long j, TimeUnit timeUnit, PhoneAuthProvider.OnVerificationStateChangedCallbacks onVerificationStateChangedCallbacks, Activity activity, Executor executor, boolean z, String str2, String str3) {
        long jConvert = TimeUnit.SECONDS.convert(j, timeUnit);
        if (jConvert < 0 || jConvert > 120) {
            throw new IllegalArgumentException("We only support 0-120 seconds for sms-auto-retrieval timeout");
        }
        this.zze.zzO(this.zza, new zzaal(str, jConvert, z, this.zzi, this.zzk, str2, zzK(), str3), zzL(str, onVerificationStateChangedCallbacks), activity, executor);
    }

    final boolean zzK() {
        return zzxh.zza(getApp().getApplicationContext());
    }

    public final Task zza(FirebaseUser firebaseUser) {
        Preconditions.checkNotNull(firebaseUser);
        return this.zze.zze(firebaseUser, new zzi(this, firebaseUser));
    }

    public final Task zzb(FirebaseUser firebaseUser, MultiFactorAssertion multiFactorAssertion, String str) {
        Preconditions.checkNotNull(firebaseUser);
        Preconditions.checkNotNull(multiFactorAssertion);
        return multiFactorAssertion instanceof PhoneMultiFactorAssertion ? this.zze.zzg(this.zza, (PhoneMultiFactorAssertion) multiFactorAssertion, firebaseUser, str, new zzs(this)) : Tasks.forException(zzxc.zza(new Status(FirebaseError.ERROR_INTERNAL_ERROR)));
    }

    public final Task zzc(FirebaseUser firebaseUser, boolean z) {
        if (firebaseUser == null) {
            return Tasks.forException(zzxc.zza(new Status(FirebaseError.ERROR_NO_SIGNED_IN_USER)));
        }
        zzzy zzzyVarZzd = firebaseUser.zzd();
        return (!zzzyVarZzd.zzj() || z) ? this.zze.zzi(this.zza, firebaseUser, zzzyVarZzd.zzf(), new zzn(this)) : Tasks.forResult(zzay.zza(zzzyVarZzd.zze()));
    }

    public final Task zzd(FirebaseUser firebaseUser, AuthCredential authCredential) {
        Preconditions.checkNotNull(authCredential);
        Preconditions.checkNotNull(firebaseUser);
        return this.zze.zzj(this.zza, firebaseUser, authCredential.zza(), new zzt(this));
    }

    public final Task zze(FirebaseUser firebaseUser, AuthCredential authCredential) {
        Preconditions.checkNotNull(firebaseUser);
        Preconditions.checkNotNull(authCredential);
        AuthCredential authCredentialZza = authCredential.zza();
        if (!(authCredentialZza instanceof EmailAuthCredential)) {
            return authCredentialZza instanceof PhoneAuthCredential ? this.zze.zzq(this.zza, firebaseUser, (PhoneAuthCredential) authCredentialZza, this.zzk, new zzt(this)) : this.zze.zzk(this.zza, firebaseUser, authCredentialZza, firebaseUser.getTenantId(), new zzt(this));
        }
        EmailAuthCredential emailAuthCredential = (EmailAuthCredential) authCredentialZza;
        return "password".equals(emailAuthCredential.getSignInMethod()) ? this.zze.zzo(this.zza, firebaseUser, emailAuthCredential.zzd(), Preconditions.checkNotEmpty(emailAuthCredential.zze()), firebaseUser.getTenantId(), new zzt(this)) : zzM(Preconditions.checkNotEmpty(emailAuthCredential.zzf())) ? Tasks.forException(zzxc.zza(new Status(17072))) : this.zze.zzm(this.zza, firebaseUser, emailAuthCredential, new zzt(this));
    }

    public final Task zzf(FirebaseUser firebaseUser, AuthCredential authCredential) {
        Preconditions.checkNotNull(firebaseUser);
        Preconditions.checkNotNull(authCredential);
        AuthCredential authCredentialZza = authCredential.zza();
        if (!(authCredentialZza instanceof EmailAuthCredential)) {
            return authCredentialZza instanceof PhoneAuthCredential ? this.zze.zzr(this.zza, firebaseUser, (PhoneAuthCredential) authCredentialZza, this.zzk, new zzt(this)) : this.zze.zzl(this.zza, firebaseUser, authCredentialZza, firebaseUser.getTenantId(), new zzt(this));
        }
        EmailAuthCredential emailAuthCredential = (EmailAuthCredential) authCredentialZza;
        return "password".equals(emailAuthCredential.getSignInMethod()) ? this.zze.zzp(this.zza, firebaseUser, emailAuthCredential.zzd(), Preconditions.checkNotEmpty(emailAuthCredential.zze()), firebaseUser.getTenantId(), new zzt(this)) : zzM(Preconditions.checkNotEmpty(emailAuthCredential.zzf())) ? Tasks.forException(zzxc.zza(new Status(17072))) : this.zze.zzn(this.zza, firebaseUser, emailAuthCredential, new zzt(this));
    }

    public final Task zzg(FirebaseUser firebaseUser, zzbk zzbkVar) {
        Preconditions.checkNotNull(firebaseUser);
        return this.zze.zzs(this.zza, firebaseUser, zzbkVar);
    }

    public final Task zzh(MultiFactorAssertion multiFactorAssertion, com.google.firebase.auth.internal.zzag zzagVar, FirebaseUser firebaseUser) {
        Preconditions.checkNotNull(multiFactorAssertion);
        Preconditions.checkNotNull(zzagVar);
        return this.zze.zzh(this.zza, firebaseUser, (PhoneMultiFactorAssertion) multiFactorAssertion, Preconditions.checkNotEmpty(zzagVar.zzd()), new zzs(this));
    }

    public final Task zzi(ActionCodeSettings actionCodeSettings, String str) {
        Preconditions.checkNotEmpty(str);
        if (this.zzi != null) {
            if (actionCodeSettings == null) {
                actionCodeSettings = ActionCodeSettings.zzb();
            }
            actionCodeSettings.zzf(this.zzi);
        }
        return this.zze.zzt(this.zza, actionCodeSettings, str);
    }

    public final Task zzj(Activity activity, FederatedAuthProvider federatedAuthProvider, FirebaseUser firebaseUser) {
        Preconditions.checkNotNull(activity);
        Preconditions.checkNotNull(federatedAuthProvider);
        Preconditions.checkNotNull(firebaseUser);
        TaskCompletionSource taskCompletionSource = new TaskCompletionSource();
        if (!this.zzm.zzj(activity, taskCompletionSource, this, firebaseUser)) {
            return Tasks.forException(zzxc.zza(new Status(17057)));
        }
        this.zzm.zzh(activity.getApplicationContext(), this, firebaseUser);
        federatedAuthProvider.zza(activity);
        return taskCompletionSource.getTask();
    }

    public final Task zzk(Activity activity, FederatedAuthProvider federatedAuthProvider, FirebaseUser firebaseUser) {
        Preconditions.checkNotNull(activity);
        Preconditions.checkNotNull(federatedAuthProvider);
        Preconditions.checkNotNull(firebaseUser);
        TaskCompletionSource taskCompletionSource = new TaskCompletionSource();
        if (!this.zzm.zzj(activity, taskCompletionSource, this, firebaseUser)) {
            return Tasks.forException(zzxc.zza(new Status(17057)));
        }
        this.zzm.zzh(activity.getApplicationContext(), this, firebaseUser);
        federatedAuthProvider.zzb(activity);
        return taskCompletionSource.getTask();
    }

    public final Task zzl(FirebaseUser firebaseUser, String str) {
        Preconditions.checkNotNull(firebaseUser);
        Preconditions.checkNotEmpty(str);
        return this.zze.zzF(this.zza, firebaseUser, str, new zzt(this)).continueWithTask(new zzr(this));
    }

    public final Task zzm(FirebaseUser firebaseUser, String str) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(firebaseUser);
        return this.zze.zzG(this.zza, firebaseUser, str, new zzt(this));
    }

    public final Task zzn(FirebaseUser firebaseUser, String str) {
        Preconditions.checkNotNull(firebaseUser);
        Preconditions.checkNotEmpty(str);
        return this.zze.zzH(this.zza, firebaseUser, str, new zzt(this));
    }

    public final Task zzo(FirebaseUser firebaseUser, String str) {
        Preconditions.checkNotNull(firebaseUser);
        Preconditions.checkNotEmpty(str);
        return this.zze.zzI(this.zza, firebaseUser, str, new zzt(this));
    }

    public final Task zzp(FirebaseUser firebaseUser, PhoneAuthCredential phoneAuthCredential) {
        Preconditions.checkNotNull(firebaseUser);
        Preconditions.checkNotNull(phoneAuthCredential);
        return this.zze.zzJ(this.zza, firebaseUser, phoneAuthCredential.clone(), new zzt(this));
    }

    public final Task zzq(FirebaseUser firebaseUser, UserProfileChangeRequest userProfileChangeRequest) {
        Preconditions.checkNotNull(firebaseUser);
        Preconditions.checkNotNull(userProfileChangeRequest);
        return this.zze.zzK(this.zza, firebaseUser, userProfileChangeRequest, new zzt(this));
    }

    public final Task zzr(String str, String str2, ActionCodeSettings actionCodeSettings) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotEmpty(str2);
        if (actionCodeSettings == null) {
            actionCodeSettings = ActionCodeSettings.zzb();
        }
        String str3 = this.zzi;
        if (str3 != null) {
            actionCodeSettings.zzf(str3);
        }
        return this.zze.zzL(str, str2, actionCodeSettings);
    }

    public final synchronized zzbi zzw() {
        return zzx(this);
    }

    public final Provider zzy() {
        return this.zzo;
    }

    @Override // com.google.firebase.auth.internal.InternalAuthProvider
    public void removeIdTokenListener(com.google.firebase.auth.internal.IdTokenListener listenerToRemove) {
        Preconditions.checkNotNull(listenerToRemove);
        this.zzc.remove(listenerToRemove);
        zzw().zzd(this.zzc.size());
    }

    public static FirebaseAuth getInstance(FirebaseApp firebaseApp) {
        return (FirebaseAuth) firebaseApp.get(FirebaseAuth.class);
    }

    public Task<Void> sendPasswordResetEmail(String email, ActionCodeSettings actionCodeSettings) {
        Preconditions.checkNotEmpty(email);
        if (actionCodeSettings == null) {
            actionCodeSettings = ActionCodeSettings.zzb();
        }
        String str = this.zzi;
        if (str != null) {
            actionCodeSettings.zzf(str);
        }
        actionCodeSettings.zzg(1);
        return this.zze.zzu(this.zza, email, actionCodeSettings, this.zzk);
    }

    @Override // com.google.firebase.auth.internal.InternalAuthProvider
    public void addIdTokenListener(com.google.firebase.auth.internal.IdTokenListener listener) {
        Preconditions.checkNotNull(listener);
        this.zzc.add(listener);
        zzw().zzd(this.zzc.size());
    }
}
