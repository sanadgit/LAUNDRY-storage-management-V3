package com.google.android.gms.measurement.internal;

import android.content.ContentValues;
import android.content.Context;
import android.content.pm.PackageManager;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteException;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;
import androidx.collection.ArrayMap;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.util.Clock;
import com.google.android.gms.common.wrappers.Wrappers;
import com.google.android.gms.internal.measurement.zzoj;
import com.google.android.gms.internal.measurement.zzov;
import com.google.android.gms.internal.measurement.zzpt;
import com.google.firebase.messaging.Constants;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.math.BigInteger;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.nio.channels.OverlappingFileLockException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import kotlinx.coroutines.DebugKt;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzkn implements zzgp {
    private static volatile zzkn zzb;
    private final Map<String, zzaf> zzA;
    long zza;
    private final zzfl zzc;
    private final zzes zzd;
    private zzai zze;
    private zzeu zzf;
    private zzkc zzg;
    private zzy zzh;
    private final zzkp zzi;
    private zzib zzj;
    private zzjl zzk;
    private final zzkf zzl;
    private final zzfu zzm;
    private boolean zzo;
    private List<Runnable> zzp;
    private int zzq;
    private int zzr;
    private boolean zzs;
    private boolean zzt;
    private boolean zzu;
    private FileLock zzv;
    private FileChannel zzw;
    private List<Long> zzx;
    private List<Long> zzy;
    private long zzz;
    private boolean zzn = false;
    private final zzkt zzB = new zzkl(this);

    zzkn(zzko zzkoVar, zzfu zzfuVar) {
        Preconditions.checkNotNull(zzkoVar);
        this.zzm = zzfu.zzC(zzkoVar.zza, null, null);
        this.zzz = -1L;
        this.zzl = new zzkf(this);
        zzkp zzkpVar = new zzkp(this);
        zzkpVar.zzaa();
        this.zzi = zzkpVar;
        zzes zzesVar = new zzes(this);
        zzesVar.zzaa();
        this.zzd = zzesVar;
        zzfl zzflVar = new zzfl(this);
        zzflVar.zzaa();
        this.zzc = zzflVar;
        this.zzA = new HashMap();
        zzav().zzh(new zzkg(this, zzkoVar));
    }

    static /* synthetic */ void zzW(zzkn zzknVar, zzko zzkoVar) {
        zzknVar.zzav().zzg();
        zzai zzaiVar = new zzai(zzknVar);
        zzaiVar.zzaa();
        zzknVar.zze = zzaiVar;
        zzknVar.zzd().zza((zzad) Preconditions.checkNotNull(zzknVar.zzc));
        zzjl zzjlVar = new zzjl(zzknVar);
        zzjlVar.zzaa();
        zzknVar.zzk = zzjlVar;
        zzy zzyVar = new zzy(zzknVar);
        zzyVar.zzaa();
        zzknVar.zzh = zzyVar;
        zzib zzibVar = new zzib(zzknVar);
        zzibVar.zzaa();
        zzknVar.zzj = zzibVar;
        zzkc zzkcVar = new zzkc(zzknVar);
        zzkcVar.zzaa();
        zzknVar.zzg = zzkcVar;
        zzknVar.zzf = new zzeu(zzknVar);
        if (zzknVar.zzq != zzknVar.zzr) {
            zzknVar.zzau().zzb().zzc("Not all upload components initialized", Integer.valueOf(zzknVar.zzq), Integer.valueOf(zzknVar.zzr));
        }
        zzknVar.zzn = true;
    }

    static final void zzY(com.google.android.gms.internal.measurement.zzfn zzfnVar, int i, String str) {
        List<com.google.android.gms.internal.measurement.zzfs> listZza = zzfnVar.zza();
        for (int i2 = 0; i2 < listZza.size(); i2++) {
            if ("_err".equals(listZza.get(i2).zzb())) {
                return;
            }
        }
        com.google.android.gms.internal.measurement.zzfr zzfrVarZzn = com.google.android.gms.internal.measurement.zzfs.zzn();
        zzfrVarZzn.zza("_err");
        zzfrVarZzn.zzd(Long.valueOf(i).longValue());
        com.google.android.gms.internal.measurement.zzfs zzfsVarZzaA = zzfrVarZzn.zzaA();
        com.google.android.gms.internal.measurement.zzfr zzfrVarZzn2 = com.google.android.gms.internal.measurement.zzfs.zzn();
        zzfrVarZzn2.zza("_ev");
        zzfrVarZzn2.zzb(str);
        com.google.android.gms.internal.measurement.zzfs zzfsVarZzaA2 = zzfrVarZzn2.zzaA();
        zzfnVar.zzf(zzfsVarZzaA);
        zzfnVar.zzf(zzfsVarZzaA2);
    }

    static final void zzZ(com.google.android.gms.internal.measurement.zzfn zzfnVar, String str) {
        List<com.google.android.gms.internal.measurement.zzfs> listZza = zzfnVar.zza();
        for (int i = 0; i < listZza.size(); i++) {
            if (str.equals(listZza.get(i).zzb())) {
                zzfnVar.zzj(i);
                return;
            }
        }
    }

    public static zzkn zza(Context context) {
        Preconditions.checkNotNull(context);
        Preconditions.checkNotNull(context.getApplicationContext());
        if (zzb == null) {
            synchronized (zzkn.class) {
                if (zzb == null) {
                    zzb = new zzkn((zzko) Preconditions.checkNotNull(new zzko(context)), null);
                }
            }
        }
        return zzb;
    }

    /* JADX WARN: Code restructure failed: missing block: B:48:0x01c8, code lost:
    
        r29 = r15;
     */
    /* JADX WARN: Code restructure failed: missing block: B:49:0x01cb, code lost:
    
        r29 = r15;
     */
    /* JADX WARN: Code restructure failed: missing block: B:52:0x01d8, code lost:
    
        r29 = r15;
     */
    /* JADX WARN: Code restructure failed: missing block: B:55:0x01e4, code lost:
    
        r29 = r15;
     */
    /* JADX WARN: Removed duplicated region for block: B:108:0x03b4 A[Catch: all -> 0x0dbc, TryCatch #2 {all -> 0x0dbc, blocks: (B:3:0x0012, B:5:0x002a, B:8:0x0032, B:9:0x0059, B:12:0x006f, B:15:0x0096, B:17:0x00cc, B:20:0x00de, B:22:0x00e8, B:212:0x06e0, B:25:0x0120, B:27:0x012e, B:30:0x014e, B:32:0x0154, B:34:0x0166, B:36:0x0174, B:38:0x0184, B:39:0x0191, B:43:0x019e, B:46:0x01b5, B:112:0x03e8, B:113:0x03f4, B:116:0x03fe, B:122:0x0421, B:119:0x0410, B:144:0x04a2, B:146:0x04af, B:149:0x04c3, B:151:0x04d4, B:153:0x04e0, B:201:0x066f, B:203:0x0679, B:205:0x067f, B:206:0x0697, B:208:0x06aa, B:209:0x06c2, B:211:0x06cc, B:159:0x0517, B:161:0x0525, B:164:0x053a, B:166:0x054c, B:168:0x0558, B:173:0x058c, B:175:0x05a2, B:177:0x05ae, B:180:0x05c1, B:182:0x05d4, B:184:0x061f, B:186:0x0626, B:188:0x062c, B:190:0x0636, B:192:0x063d, B:194:0x0643, B:196:0x064d, B:197:0x065f, B:126:0x042a, B:128:0x0436, B:130:0x0442, B:142:0x0488, B:134:0x0460, B:137:0x0472, B:139:0x0478, B:141:0x0482, B:64:0x0210, B:67:0x021a, B:69:0x0228, B:74:0x0270, B:70:0x0244, B:72:0x0254, B:78:0x027f, B:81:0x02ae, B:82:0x02d8, B:84:0x0311, B:86:0x0318, B:89:0x0324, B:91:0x035a, B:92:0x0375, B:94:0x037b, B:96:0x038b, B:100:0x03a0, B:97:0x0394, B:104:0x03ab, B:108:0x03b4, B:109:0x03cc, B:217:0x06ff, B:219:0x070d, B:221:0x0718, B:233:0x074e, B:222:0x0720, B:224:0x072b, B:226:0x0731, B:229:0x073d, B:231:0x0747, B:236:0x0755, B:237:0x0762, B:240:0x076a, B:242:0x077c, B:243:0x0788, B:245:0x0790, B:249:0x07b6, B:251:0x07db, B:253:0x07ec, B:255:0x07f2, B:257:0x07fe, B:258:0x082f, B:260:0x0835, B:262:0x0843, B:263:0x0847, B:264:0x084a, B:265:0x084d, B:266:0x085b, B:268:0x0861, B:270:0x0871, B:271:0x0878, B:273:0x0884, B:274:0x088b, B:275:0x088e, B:277:0x08cc, B:278:0x08df, B:280:0x08e5, B:283:0x08ff, B:285:0x091a, B:287:0x0931, B:290:0x0938, B:292:0x093c, B:294:0x0940, B:296:0x094a, B:297:0x0954, B:299:0x0958, B:301:0x095e, B:302:0x096c, B:303:0x0975, B:372:0x0bdb, B:304:0x0981, B:306:0x0998, B:312:0x09b7, B:314:0x09db, B:315:0x09e3, B:317:0x09e9, B:319:0x09fb, B:326:0x0a24, B:327:0x0a4e, B:329:0x0a5a, B:331:0x0a6f, B:334:0x0ab3, B:338:0x0acb, B:340:0x0ad2, B:342:0x0ae1, B:344:0x0ae5, B:346:0x0ae9, B:348:0x0aed, B:349:0x0af9, B:350:0x0b05, B:352:0x0b0b, B:354:0x0b27, B:356:0x0b2e, B:371:0x0bd6, B:357:0x0b49, B:359:0x0b51, B:363:0x0b78, B:365:0x0ba4, B:367:0x0bb0, B:368:0x0bc0, B:370:0x0bc8, B:360:0x0b5e, B:324:0x0a0f, B:310:0x099f, B:373:0x0be4, B:375:0x0bf0, B:376:0x0bf6, B:377:0x0bfe, B:379:0x0c04, B:381:0x0c1b, B:383:0x0c2e, B:403:0x0ca2, B:405:0x0ca8, B:407:0x0cbe, B:410:0x0cc5, B:415:0x0cf6, B:411:0x0ccd, B:413:0x0cd9, B:414:0x0cdf, B:416:0x0d06, B:417:0x0d1e, B:420:0x0d26, B:421:0x0d2b, B:422:0x0d3b, B:424:0x0d55, B:425:0x0d70, B:426:0x0d79, B:431:0x0d98, B:430:0x0d85, B:384:0x0c46, B:386:0x0c4c, B:388:0x0c56, B:390:0x0c5d, B:396:0x0c6d, B:398:0x0c74, B:400:0x0c93, B:402:0x0c9a, B:401:0x0c97, B:397:0x0c71, B:389:0x0c5a, B:246:0x0795, B:248:0x079c, B:434:0x0daa), top: B:444:0x0012, inners: #0, #1 }] */
    /* JADX WARN: Removed duplicated region for block: B:109:0x03cc A[Catch: all -> 0x0dbc, TryCatch #2 {all -> 0x0dbc, blocks: (B:3:0x0012, B:5:0x002a, B:8:0x0032, B:9:0x0059, B:12:0x006f, B:15:0x0096, B:17:0x00cc, B:20:0x00de, B:22:0x00e8, B:212:0x06e0, B:25:0x0120, B:27:0x012e, B:30:0x014e, B:32:0x0154, B:34:0x0166, B:36:0x0174, B:38:0x0184, B:39:0x0191, B:43:0x019e, B:46:0x01b5, B:112:0x03e8, B:113:0x03f4, B:116:0x03fe, B:122:0x0421, B:119:0x0410, B:144:0x04a2, B:146:0x04af, B:149:0x04c3, B:151:0x04d4, B:153:0x04e0, B:201:0x066f, B:203:0x0679, B:205:0x067f, B:206:0x0697, B:208:0x06aa, B:209:0x06c2, B:211:0x06cc, B:159:0x0517, B:161:0x0525, B:164:0x053a, B:166:0x054c, B:168:0x0558, B:173:0x058c, B:175:0x05a2, B:177:0x05ae, B:180:0x05c1, B:182:0x05d4, B:184:0x061f, B:186:0x0626, B:188:0x062c, B:190:0x0636, B:192:0x063d, B:194:0x0643, B:196:0x064d, B:197:0x065f, B:126:0x042a, B:128:0x0436, B:130:0x0442, B:142:0x0488, B:134:0x0460, B:137:0x0472, B:139:0x0478, B:141:0x0482, B:64:0x0210, B:67:0x021a, B:69:0x0228, B:74:0x0270, B:70:0x0244, B:72:0x0254, B:78:0x027f, B:81:0x02ae, B:82:0x02d8, B:84:0x0311, B:86:0x0318, B:89:0x0324, B:91:0x035a, B:92:0x0375, B:94:0x037b, B:96:0x038b, B:100:0x03a0, B:97:0x0394, B:104:0x03ab, B:108:0x03b4, B:109:0x03cc, B:217:0x06ff, B:219:0x070d, B:221:0x0718, B:233:0x074e, B:222:0x0720, B:224:0x072b, B:226:0x0731, B:229:0x073d, B:231:0x0747, B:236:0x0755, B:237:0x0762, B:240:0x076a, B:242:0x077c, B:243:0x0788, B:245:0x0790, B:249:0x07b6, B:251:0x07db, B:253:0x07ec, B:255:0x07f2, B:257:0x07fe, B:258:0x082f, B:260:0x0835, B:262:0x0843, B:263:0x0847, B:264:0x084a, B:265:0x084d, B:266:0x085b, B:268:0x0861, B:270:0x0871, B:271:0x0878, B:273:0x0884, B:274:0x088b, B:275:0x088e, B:277:0x08cc, B:278:0x08df, B:280:0x08e5, B:283:0x08ff, B:285:0x091a, B:287:0x0931, B:290:0x0938, B:292:0x093c, B:294:0x0940, B:296:0x094a, B:297:0x0954, B:299:0x0958, B:301:0x095e, B:302:0x096c, B:303:0x0975, B:372:0x0bdb, B:304:0x0981, B:306:0x0998, B:312:0x09b7, B:314:0x09db, B:315:0x09e3, B:317:0x09e9, B:319:0x09fb, B:326:0x0a24, B:327:0x0a4e, B:329:0x0a5a, B:331:0x0a6f, B:334:0x0ab3, B:338:0x0acb, B:340:0x0ad2, B:342:0x0ae1, B:344:0x0ae5, B:346:0x0ae9, B:348:0x0aed, B:349:0x0af9, B:350:0x0b05, B:352:0x0b0b, B:354:0x0b27, B:356:0x0b2e, B:371:0x0bd6, B:357:0x0b49, B:359:0x0b51, B:363:0x0b78, B:365:0x0ba4, B:367:0x0bb0, B:368:0x0bc0, B:370:0x0bc8, B:360:0x0b5e, B:324:0x0a0f, B:310:0x099f, B:373:0x0be4, B:375:0x0bf0, B:376:0x0bf6, B:377:0x0bfe, B:379:0x0c04, B:381:0x0c1b, B:383:0x0c2e, B:403:0x0ca2, B:405:0x0ca8, B:407:0x0cbe, B:410:0x0cc5, B:415:0x0cf6, B:411:0x0ccd, B:413:0x0cd9, B:414:0x0cdf, B:416:0x0d06, B:417:0x0d1e, B:420:0x0d26, B:421:0x0d2b, B:422:0x0d3b, B:424:0x0d55, B:425:0x0d70, B:426:0x0d79, B:431:0x0d98, B:430:0x0d85, B:384:0x0c46, B:386:0x0c4c, B:388:0x0c56, B:390:0x0c5d, B:396:0x0c6d, B:398:0x0c74, B:400:0x0c93, B:402:0x0c9a, B:401:0x0c97, B:397:0x0c71, B:389:0x0c5a, B:246:0x0795, B:248:0x079c, B:434:0x0daa), top: B:444:0x0012, inners: #0, #1 }] */
    /* JADX WARN: Removed duplicated region for block: B:110:0x03e4  */
    /* JADX WARN: Removed duplicated region for block: B:112:0x03e8 A[Catch: all -> 0x0dbc, TryCatch #2 {all -> 0x0dbc, blocks: (B:3:0x0012, B:5:0x002a, B:8:0x0032, B:9:0x0059, B:12:0x006f, B:15:0x0096, B:17:0x00cc, B:20:0x00de, B:22:0x00e8, B:212:0x06e0, B:25:0x0120, B:27:0x012e, B:30:0x014e, B:32:0x0154, B:34:0x0166, B:36:0x0174, B:38:0x0184, B:39:0x0191, B:43:0x019e, B:46:0x01b5, B:112:0x03e8, B:113:0x03f4, B:116:0x03fe, B:122:0x0421, B:119:0x0410, B:144:0x04a2, B:146:0x04af, B:149:0x04c3, B:151:0x04d4, B:153:0x04e0, B:201:0x066f, B:203:0x0679, B:205:0x067f, B:206:0x0697, B:208:0x06aa, B:209:0x06c2, B:211:0x06cc, B:159:0x0517, B:161:0x0525, B:164:0x053a, B:166:0x054c, B:168:0x0558, B:173:0x058c, B:175:0x05a2, B:177:0x05ae, B:180:0x05c1, B:182:0x05d4, B:184:0x061f, B:186:0x0626, B:188:0x062c, B:190:0x0636, B:192:0x063d, B:194:0x0643, B:196:0x064d, B:197:0x065f, B:126:0x042a, B:128:0x0436, B:130:0x0442, B:142:0x0488, B:134:0x0460, B:137:0x0472, B:139:0x0478, B:141:0x0482, B:64:0x0210, B:67:0x021a, B:69:0x0228, B:74:0x0270, B:70:0x0244, B:72:0x0254, B:78:0x027f, B:81:0x02ae, B:82:0x02d8, B:84:0x0311, B:86:0x0318, B:89:0x0324, B:91:0x035a, B:92:0x0375, B:94:0x037b, B:96:0x038b, B:100:0x03a0, B:97:0x0394, B:104:0x03ab, B:108:0x03b4, B:109:0x03cc, B:217:0x06ff, B:219:0x070d, B:221:0x0718, B:233:0x074e, B:222:0x0720, B:224:0x072b, B:226:0x0731, B:229:0x073d, B:231:0x0747, B:236:0x0755, B:237:0x0762, B:240:0x076a, B:242:0x077c, B:243:0x0788, B:245:0x0790, B:249:0x07b6, B:251:0x07db, B:253:0x07ec, B:255:0x07f2, B:257:0x07fe, B:258:0x082f, B:260:0x0835, B:262:0x0843, B:263:0x0847, B:264:0x084a, B:265:0x084d, B:266:0x085b, B:268:0x0861, B:270:0x0871, B:271:0x0878, B:273:0x0884, B:274:0x088b, B:275:0x088e, B:277:0x08cc, B:278:0x08df, B:280:0x08e5, B:283:0x08ff, B:285:0x091a, B:287:0x0931, B:290:0x0938, B:292:0x093c, B:294:0x0940, B:296:0x094a, B:297:0x0954, B:299:0x0958, B:301:0x095e, B:302:0x096c, B:303:0x0975, B:372:0x0bdb, B:304:0x0981, B:306:0x0998, B:312:0x09b7, B:314:0x09db, B:315:0x09e3, B:317:0x09e9, B:319:0x09fb, B:326:0x0a24, B:327:0x0a4e, B:329:0x0a5a, B:331:0x0a6f, B:334:0x0ab3, B:338:0x0acb, B:340:0x0ad2, B:342:0x0ae1, B:344:0x0ae5, B:346:0x0ae9, B:348:0x0aed, B:349:0x0af9, B:350:0x0b05, B:352:0x0b0b, B:354:0x0b27, B:356:0x0b2e, B:371:0x0bd6, B:357:0x0b49, B:359:0x0b51, B:363:0x0b78, B:365:0x0ba4, B:367:0x0bb0, B:368:0x0bc0, B:370:0x0bc8, B:360:0x0b5e, B:324:0x0a0f, B:310:0x099f, B:373:0x0be4, B:375:0x0bf0, B:376:0x0bf6, B:377:0x0bfe, B:379:0x0c04, B:381:0x0c1b, B:383:0x0c2e, B:403:0x0ca2, B:405:0x0ca8, B:407:0x0cbe, B:410:0x0cc5, B:415:0x0cf6, B:411:0x0ccd, B:413:0x0cd9, B:414:0x0cdf, B:416:0x0d06, B:417:0x0d1e, B:420:0x0d26, B:421:0x0d2b, B:422:0x0d3b, B:424:0x0d55, B:425:0x0d70, B:426:0x0d79, B:431:0x0d98, B:430:0x0d85, B:384:0x0c46, B:386:0x0c4c, B:388:0x0c56, B:390:0x0c5d, B:396:0x0c6d, B:398:0x0c74, B:400:0x0c93, B:402:0x0c9a, B:401:0x0c97, B:397:0x0c71, B:389:0x0c5a, B:246:0x0795, B:248:0x079c, B:434:0x0daa), top: B:444:0x0012, inners: #0, #1 }] */
    /* JADX WARN: Removed duplicated region for block: B:143:0x04a1  */
    /* JADX WARN: Removed duplicated region for block: B:146:0x04af A[Catch: all -> 0x0dbc, TryCatch #2 {all -> 0x0dbc, blocks: (B:3:0x0012, B:5:0x002a, B:8:0x0032, B:9:0x0059, B:12:0x006f, B:15:0x0096, B:17:0x00cc, B:20:0x00de, B:22:0x00e8, B:212:0x06e0, B:25:0x0120, B:27:0x012e, B:30:0x014e, B:32:0x0154, B:34:0x0166, B:36:0x0174, B:38:0x0184, B:39:0x0191, B:43:0x019e, B:46:0x01b5, B:112:0x03e8, B:113:0x03f4, B:116:0x03fe, B:122:0x0421, B:119:0x0410, B:144:0x04a2, B:146:0x04af, B:149:0x04c3, B:151:0x04d4, B:153:0x04e0, B:201:0x066f, B:203:0x0679, B:205:0x067f, B:206:0x0697, B:208:0x06aa, B:209:0x06c2, B:211:0x06cc, B:159:0x0517, B:161:0x0525, B:164:0x053a, B:166:0x054c, B:168:0x0558, B:173:0x058c, B:175:0x05a2, B:177:0x05ae, B:180:0x05c1, B:182:0x05d4, B:184:0x061f, B:186:0x0626, B:188:0x062c, B:190:0x0636, B:192:0x063d, B:194:0x0643, B:196:0x064d, B:197:0x065f, B:126:0x042a, B:128:0x0436, B:130:0x0442, B:142:0x0488, B:134:0x0460, B:137:0x0472, B:139:0x0478, B:141:0x0482, B:64:0x0210, B:67:0x021a, B:69:0x0228, B:74:0x0270, B:70:0x0244, B:72:0x0254, B:78:0x027f, B:81:0x02ae, B:82:0x02d8, B:84:0x0311, B:86:0x0318, B:89:0x0324, B:91:0x035a, B:92:0x0375, B:94:0x037b, B:96:0x038b, B:100:0x03a0, B:97:0x0394, B:104:0x03ab, B:108:0x03b4, B:109:0x03cc, B:217:0x06ff, B:219:0x070d, B:221:0x0718, B:233:0x074e, B:222:0x0720, B:224:0x072b, B:226:0x0731, B:229:0x073d, B:231:0x0747, B:236:0x0755, B:237:0x0762, B:240:0x076a, B:242:0x077c, B:243:0x0788, B:245:0x0790, B:249:0x07b6, B:251:0x07db, B:253:0x07ec, B:255:0x07f2, B:257:0x07fe, B:258:0x082f, B:260:0x0835, B:262:0x0843, B:263:0x0847, B:264:0x084a, B:265:0x084d, B:266:0x085b, B:268:0x0861, B:270:0x0871, B:271:0x0878, B:273:0x0884, B:274:0x088b, B:275:0x088e, B:277:0x08cc, B:278:0x08df, B:280:0x08e5, B:283:0x08ff, B:285:0x091a, B:287:0x0931, B:290:0x0938, B:292:0x093c, B:294:0x0940, B:296:0x094a, B:297:0x0954, B:299:0x0958, B:301:0x095e, B:302:0x096c, B:303:0x0975, B:372:0x0bdb, B:304:0x0981, B:306:0x0998, B:312:0x09b7, B:314:0x09db, B:315:0x09e3, B:317:0x09e9, B:319:0x09fb, B:326:0x0a24, B:327:0x0a4e, B:329:0x0a5a, B:331:0x0a6f, B:334:0x0ab3, B:338:0x0acb, B:340:0x0ad2, B:342:0x0ae1, B:344:0x0ae5, B:346:0x0ae9, B:348:0x0aed, B:349:0x0af9, B:350:0x0b05, B:352:0x0b0b, B:354:0x0b27, B:356:0x0b2e, B:371:0x0bd6, B:357:0x0b49, B:359:0x0b51, B:363:0x0b78, B:365:0x0ba4, B:367:0x0bb0, B:368:0x0bc0, B:370:0x0bc8, B:360:0x0b5e, B:324:0x0a0f, B:310:0x099f, B:373:0x0be4, B:375:0x0bf0, B:376:0x0bf6, B:377:0x0bfe, B:379:0x0c04, B:381:0x0c1b, B:383:0x0c2e, B:403:0x0ca2, B:405:0x0ca8, B:407:0x0cbe, B:410:0x0cc5, B:415:0x0cf6, B:411:0x0ccd, B:413:0x0cd9, B:414:0x0cdf, B:416:0x0d06, B:417:0x0d1e, B:420:0x0d26, B:421:0x0d2b, B:422:0x0d3b, B:424:0x0d55, B:425:0x0d70, B:426:0x0d79, B:431:0x0d98, B:430:0x0d85, B:384:0x0c46, B:386:0x0c4c, B:388:0x0c56, B:390:0x0c5d, B:396:0x0c6d, B:398:0x0c74, B:400:0x0c93, B:402:0x0c9a, B:401:0x0c97, B:397:0x0c71, B:389:0x0c5a, B:246:0x0795, B:248:0x079c, B:434:0x0daa), top: B:444:0x0012, inners: #0, #1 }] */
    /* JADX WARN: Removed duplicated region for block: B:159:0x0517 A[Catch: all -> 0x0dbc, TryCatch #2 {all -> 0x0dbc, blocks: (B:3:0x0012, B:5:0x002a, B:8:0x0032, B:9:0x0059, B:12:0x006f, B:15:0x0096, B:17:0x00cc, B:20:0x00de, B:22:0x00e8, B:212:0x06e0, B:25:0x0120, B:27:0x012e, B:30:0x014e, B:32:0x0154, B:34:0x0166, B:36:0x0174, B:38:0x0184, B:39:0x0191, B:43:0x019e, B:46:0x01b5, B:112:0x03e8, B:113:0x03f4, B:116:0x03fe, B:122:0x0421, B:119:0x0410, B:144:0x04a2, B:146:0x04af, B:149:0x04c3, B:151:0x04d4, B:153:0x04e0, B:201:0x066f, B:203:0x0679, B:205:0x067f, B:206:0x0697, B:208:0x06aa, B:209:0x06c2, B:211:0x06cc, B:159:0x0517, B:161:0x0525, B:164:0x053a, B:166:0x054c, B:168:0x0558, B:173:0x058c, B:175:0x05a2, B:177:0x05ae, B:180:0x05c1, B:182:0x05d4, B:184:0x061f, B:186:0x0626, B:188:0x062c, B:190:0x0636, B:192:0x063d, B:194:0x0643, B:196:0x064d, B:197:0x065f, B:126:0x042a, B:128:0x0436, B:130:0x0442, B:142:0x0488, B:134:0x0460, B:137:0x0472, B:139:0x0478, B:141:0x0482, B:64:0x0210, B:67:0x021a, B:69:0x0228, B:74:0x0270, B:70:0x0244, B:72:0x0254, B:78:0x027f, B:81:0x02ae, B:82:0x02d8, B:84:0x0311, B:86:0x0318, B:89:0x0324, B:91:0x035a, B:92:0x0375, B:94:0x037b, B:96:0x038b, B:100:0x03a0, B:97:0x0394, B:104:0x03ab, B:108:0x03b4, B:109:0x03cc, B:217:0x06ff, B:219:0x070d, B:221:0x0718, B:233:0x074e, B:222:0x0720, B:224:0x072b, B:226:0x0731, B:229:0x073d, B:231:0x0747, B:236:0x0755, B:237:0x0762, B:240:0x076a, B:242:0x077c, B:243:0x0788, B:245:0x0790, B:249:0x07b6, B:251:0x07db, B:253:0x07ec, B:255:0x07f2, B:257:0x07fe, B:258:0x082f, B:260:0x0835, B:262:0x0843, B:263:0x0847, B:264:0x084a, B:265:0x084d, B:266:0x085b, B:268:0x0861, B:270:0x0871, B:271:0x0878, B:273:0x0884, B:274:0x088b, B:275:0x088e, B:277:0x08cc, B:278:0x08df, B:280:0x08e5, B:283:0x08ff, B:285:0x091a, B:287:0x0931, B:290:0x0938, B:292:0x093c, B:294:0x0940, B:296:0x094a, B:297:0x0954, B:299:0x0958, B:301:0x095e, B:302:0x096c, B:303:0x0975, B:372:0x0bdb, B:304:0x0981, B:306:0x0998, B:312:0x09b7, B:314:0x09db, B:315:0x09e3, B:317:0x09e9, B:319:0x09fb, B:326:0x0a24, B:327:0x0a4e, B:329:0x0a5a, B:331:0x0a6f, B:334:0x0ab3, B:338:0x0acb, B:340:0x0ad2, B:342:0x0ae1, B:344:0x0ae5, B:346:0x0ae9, B:348:0x0aed, B:349:0x0af9, B:350:0x0b05, B:352:0x0b0b, B:354:0x0b27, B:356:0x0b2e, B:371:0x0bd6, B:357:0x0b49, B:359:0x0b51, B:363:0x0b78, B:365:0x0ba4, B:367:0x0bb0, B:368:0x0bc0, B:370:0x0bc8, B:360:0x0b5e, B:324:0x0a0f, B:310:0x099f, B:373:0x0be4, B:375:0x0bf0, B:376:0x0bf6, B:377:0x0bfe, B:379:0x0c04, B:381:0x0c1b, B:383:0x0c2e, B:403:0x0ca2, B:405:0x0ca8, B:407:0x0cbe, B:410:0x0cc5, B:415:0x0cf6, B:411:0x0ccd, B:413:0x0cd9, B:414:0x0cdf, B:416:0x0d06, B:417:0x0d1e, B:420:0x0d26, B:421:0x0d2b, B:422:0x0d3b, B:424:0x0d55, B:425:0x0d70, B:426:0x0d79, B:431:0x0d98, B:430:0x0d85, B:384:0x0c46, B:386:0x0c4c, B:388:0x0c56, B:390:0x0c5d, B:396:0x0c6d, B:398:0x0c74, B:400:0x0c93, B:402:0x0c9a, B:401:0x0c97, B:397:0x0c71, B:389:0x0c5a, B:246:0x0795, B:248:0x079c, B:434:0x0daa), top: B:444:0x0012, inners: #0, #1 }] */
    /* JADX WARN: Removed duplicated region for block: B:201:0x066f A[Catch: all -> 0x0dbc, TryCatch #2 {all -> 0x0dbc, blocks: (B:3:0x0012, B:5:0x002a, B:8:0x0032, B:9:0x0059, B:12:0x006f, B:15:0x0096, B:17:0x00cc, B:20:0x00de, B:22:0x00e8, B:212:0x06e0, B:25:0x0120, B:27:0x012e, B:30:0x014e, B:32:0x0154, B:34:0x0166, B:36:0x0174, B:38:0x0184, B:39:0x0191, B:43:0x019e, B:46:0x01b5, B:112:0x03e8, B:113:0x03f4, B:116:0x03fe, B:122:0x0421, B:119:0x0410, B:144:0x04a2, B:146:0x04af, B:149:0x04c3, B:151:0x04d4, B:153:0x04e0, B:201:0x066f, B:203:0x0679, B:205:0x067f, B:206:0x0697, B:208:0x06aa, B:209:0x06c2, B:211:0x06cc, B:159:0x0517, B:161:0x0525, B:164:0x053a, B:166:0x054c, B:168:0x0558, B:173:0x058c, B:175:0x05a2, B:177:0x05ae, B:180:0x05c1, B:182:0x05d4, B:184:0x061f, B:186:0x0626, B:188:0x062c, B:190:0x0636, B:192:0x063d, B:194:0x0643, B:196:0x064d, B:197:0x065f, B:126:0x042a, B:128:0x0436, B:130:0x0442, B:142:0x0488, B:134:0x0460, B:137:0x0472, B:139:0x0478, B:141:0x0482, B:64:0x0210, B:67:0x021a, B:69:0x0228, B:74:0x0270, B:70:0x0244, B:72:0x0254, B:78:0x027f, B:81:0x02ae, B:82:0x02d8, B:84:0x0311, B:86:0x0318, B:89:0x0324, B:91:0x035a, B:92:0x0375, B:94:0x037b, B:96:0x038b, B:100:0x03a0, B:97:0x0394, B:104:0x03ab, B:108:0x03b4, B:109:0x03cc, B:217:0x06ff, B:219:0x070d, B:221:0x0718, B:233:0x074e, B:222:0x0720, B:224:0x072b, B:226:0x0731, B:229:0x073d, B:231:0x0747, B:236:0x0755, B:237:0x0762, B:240:0x076a, B:242:0x077c, B:243:0x0788, B:245:0x0790, B:249:0x07b6, B:251:0x07db, B:253:0x07ec, B:255:0x07f2, B:257:0x07fe, B:258:0x082f, B:260:0x0835, B:262:0x0843, B:263:0x0847, B:264:0x084a, B:265:0x084d, B:266:0x085b, B:268:0x0861, B:270:0x0871, B:271:0x0878, B:273:0x0884, B:274:0x088b, B:275:0x088e, B:277:0x08cc, B:278:0x08df, B:280:0x08e5, B:283:0x08ff, B:285:0x091a, B:287:0x0931, B:290:0x0938, B:292:0x093c, B:294:0x0940, B:296:0x094a, B:297:0x0954, B:299:0x0958, B:301:0x095e, B:302:0x096c, B:303:0x0975, B:372:0x0bdb, B:304:0x0981, B:306:0x0998, B:312:0x09b7, B:314:0x09db, B:315:0x09e3, B:317:0x09e9, B:319:0x09fb, B:326:0x0a24, B:327:0x0a4e, B:329:0x0a5a, B:331:0x0a6f, B:334:0x0ab3, B:338:0x0acb, B:340:0x0ad2, B:342:0x0ae1, B:344:0x0ae5, B:346:0x0ae9, B:348:0x0aed, B:349:0x0af9, B:350:0x0b05, B:352:0x0b0b, B:354:0x0b27, B:356:0x0b2e, B:371:0x0bd6, B:357:0x0b49, B:359:0x0b51, B:363:0x0b78, B:365:0x0ba4, B:367:0x0bb0, B:368:0x0bc0, B:370:0x0bc8, B:360:0x0b5e, B:324:0x0a0f, B:310:0x099f, B:373:0x0be4, B:375:0x0bf0, B:376:0x0bf6, B:377:0x0bfe, B:379:0x0c04, B:381:0x0c1b, B:383:0x0c2e, B:403:0x0ca2, B:405:0x0ca8, B:407:0x0cbe, B:410:0x0cc5, B:415:0x0cf6, B:411:0x0ccd, B:413:0x0cd9, B:414:0x0cdf, B:416:0x0d06, B:417:0x0d1e, B:420:0x0d26, B:421:0x0d2b, B:422:0x0d3b, B:424:0x0d55, B:425:0x0d70, B:426:0x0d79, B:431:0x0d98, B:430:0x0d85, B:384:0x0c46, B:386:0x0c4c, B:388:0x0c56, B:390:0x0c5d, B:396:0x0c6d, B:398:0x0c74, B:400:0x0c93, B:402:0x0c9a, B:401:0x0c97, B:397:0x0c71, B:389:0x0c5a, B:246:0x0795, B:248:0x079c, B:434:0x0daa), top: B:444:0x0012, inners: #0, #1 }] */
    /* JADX WARN: Removed duplicated region for block: B:205:0x067f A[Catch: all -> 0x0dbc, TryCatch #2 {all -> 0x0dbc, blocks: (B:3:0x0012, B:5:0x002a, B:8:0x0032, B:9:0x0059, B:12:0x006f, B:15:0x0096, B:17:0x00cc, B:20:0x00de, B:22:0x00e8, B:212:0x06e0, B:25:0x0120, B:27:0x012e, B:30:0x014e, B:32:0x0154, B:34:0x0166, B:36:0x0174, B:38:0x0184, B:39:0x0191, B:43:0x019e, B:46:0x01b5, B:112:0x03e8, B:113:0x03f4, B:116:0x03fe, B:122:0x0421, B:119:0x0410, B:144:0x04a2, B:146:0x04af, B:149:0x04c3, B:151:0x04d4, B:153:0x04e0, B:201:0x066f, B:203:0x0679, B:205:0x067f, B:206:0x0697, B:208:0x06aa, B:209:0x06c2, B:211:0x06cc, B:159:0x0517, B:161:0x0525, B:164:0x053a, B:166:0x054c, B:168:0x0558, B:173:0x058c, B:175:0x05a2, B:177:0x05ae, B:180:0x05c1, B:182:0x05d4, B:184:0x061f, B:186:0x0626, B:188:0x062c, B:190:0x0636, B:192:0x063d, B:194:0x0643, B:196:0x064d, B:197:0x065f, B:126:0x042a, B:128:0x0436, B:130:0x0442, B:142:0x0488, B:134:0x0460, B:137:0x0472, B:139:0x0478, B:141:0x0482, B:64:0x0210, B:67:0x021a, B:69:0x0228, B:74:0x0270, B:70:0x0244, B:72:0x0254, B:78:0x027f, B:81:0x02ae, B:82:0x02d8, B:84:0x0311, B:86:0x0318, B:89:0x0324, B:91:0x035a, B:92:0x0375, B:94:0x037b, B:96:0x038b, B:100:0x03a0, B:97:0x0394, B:104:0x03ab, B:108:0x03b4, B:109:0x03cc, B:217:0x06ff, B:219:0x070d, B:221:0x0718, B:233:0x074e, B:222:0x0720, B:224:0x072b, B:226:0x0731, B:229:0x073d, B:231:0x0747, B:236:0x0755, B:237:0x0762, B:240:0x076a, B:242:0x077c, B:243:0x0788, B:245:0x0790, B:249:0x07b6, B:251:0x07db, B:253:0x07ec, B:255:0x07f2, B:257:0x07fe, B:258:0x082f, B:260:0x0835, B:262:0x0843, B:263:0x0847, B:264:0x084a, B:265:0x084d, B:266:0x085b, B:268:0x0861, B:270:0x0871, B:271:0x0878, B:273:0x0884, B:274:0x088b, B:275:0x088e, B:277:0x08cc, B:278:0x08df, B:280:0x08e5, B:283:0x08ff, B:285:0x091a, B:287:0x0931, B:290:0x0938, B:292:0x093c, B:294:0x0940, B:296:0x094a, B:297:0x0954, B:299:0x0958, B:301:0x095e, B:302:0x096c, B:303:0x0975, B:372:0x0bdb, B:304:0x0981, B:306:0x0998, B:312:0x09b7, B:314:0x09db, B:315:0x09e3, B:317:0x09e9, B:319:0x09fb, B:326:0x0a24, B:327:0x0a4e, B:329:0x0a5a, B:331:0x0a6f, B:334:0x0ab3, B:338:0x0acb, B:340:0x0ad2, B:342:0x0ae1, B:344:0x0ae5, B:346:0x0ae9, B:348:0x0aed, B:349:0x0af9, B:350:0x0b05, B:352:0x0b0b, B:354:0x0b27, B:356:0x0b2e, B:371:0x0bd6, B:357:0x0b49, B:359:0x0b51, B:363:0x0b78, B:365:0x0ba4, B:367:0x0bb0, B:368:0x0bc0, B:370:0x0bc8, B:360:0x0b5e, B:324:0x0a0f, B:310:0x099f, B:373:0x0be4, B:375:0x0bf0, B:376:0x0bf6, B:377:0x0bfe, B:379:0x0c04, B:381:0x0c1b, B:383:0x0c2e, B:403:0x0ca2, B:405:0x0ca8, B:407:0x0cbe, B:410:0x0cc5, B:415:0x0cf6, B:411:0x0ccd, B:413:0x0cd9, B:414:0x0cdf, B:416:0x0d06, B:417:0x0d1e, B:420:0x0d26, B:421:0x0d2b, B:422:0x0d3b, B:424:0x0d55, B:425:0x0d70, B:426:0x0d79, B:431:0x0d98, B:430:0x0d85, B:384:0x0c46, B:386:0x0c4c, B:388:0x0c56, B:390:0x0c5d, B:396:0x0c6d, B:398:0x0c74, B:400:0x0c93, B:402:0x0c9a, B:401:0x0c97, B:397:0x0c71, B:389:0x0c5a, B:246:0x0795, B:248:0x079c, B:434:0x0daa), top: B:444:0x0012, inners: #0, #1 }] */
    /* JADX WARN: Removed duplicated region for block: B:206:0x0697 A[Catch: all -> 0x0dbc, TryCatch #2 {all -> 0x0dbc, blocks: (B:3:0x0012, B:5:0x002a, B:8:0x0032, B:9:0x0059, B:12:0x006f, B:15:0x0096, B:17:0x00cc, B:20:0x00de, B:22:0x00e8, B:212:0x06e0, B:25:0x0120, B:27:0x012e, B:30:0x014e, B:32:0x0154, B:34:0x0166, B:36:0x0174, B:38:0x0184, B:39:0x0191, B:43:0x019e, B:46:0x01b5, B:112:0x03e8, B:113:0x03f4, B:116:0x03fe, B:122:0x0421, B:119:0x0410, B:144:0x04a2, B:146:0x04af, B:149:0x04c3, B:151:0x04d4, B:153:0x04e0, B:201:0x066f, B:203:0x0679, B:205:0x067f, B:206:0x0697, B:208:0x06aa, B:209:0x06c2, B:211:0x06cc, B:159:0x0517, B:161:0x0525, B:164:0x053a, B:166:0x054c, B:168:0x0558, B:173:0x058c, B:175:0x05a2, B:177:0x05ae, B:180:0x05c1, B:182:0x05d4, B:184:0x061f, B:186:0x0626, B:188:0x062c, B:190:0x0636, B:192:0x063d, B:194:0x0643, B:196:0x064d, B:197:0x065f, B:126:0x042a, B:128:0x0436, B:130:0x0442, B:142:0x0488, B:134:0x0460, B:137:0x0472, B:139:0x0478, B:141:0x0482, B:64:0x0210, B:67:0x021a, B:69:0x0228, B:74:0x0270, B:70:0x0244, B:72:0x0254, B:78:0x027f, B:81:0x02ae, B:82:0x02d8, B:84:0x0311, B:86:0x0318, B:89:0x0324, B:91:0x035a, B:92:0x0375, B:94:0x037b, B:96:0x038b, B:100:0x03a0, B:97:0x0394, B:104:0x03ab, B:108:0x03b4, B:109:0x03cc, B:217:0x06ff, B:219:0x070d, B:221:0x0718, B:233:0x074e, B:222:0x0720, B:224:0x072b, B:226:0x0731, B:229:0x073d, B:231:0x0747, B:236:0x0755, B:237:0x0762, B:240:0x076a, B:242:0x077c, B:243:0x0788, B:245:0x0790, B:249:0x07b6, B:251:0x07db, B:253:0x07ec, B:255:0x07f2, B:257:0x07fe, B:258:0x082f, B:260:0x0835, B:262:0x0843, B:263:0x0847, B:264:0x084a, B:265:0x084d, B:266:0x085b, B:268:0x0861, B:270:0x0871, B:271:0x0878, B:273:0x0884, B:274:0x088b, B:275:0x088e, B:277:0x08cc, B:278:0x08df, B:280:0x08e5, B:283:0x08ff, B:285:0x091a, B:287:0x0931, B:290:0x0938, B:292:0x093c, B:294:0x0940, B:296:0x094a, B:297:0x0954, B:299:0x0958, B:301:0x095e, B:302:0x096c, B:303:0x0975, B:372:0x0bdb, B:304:0x0981, B:306:0x0998, B:312:0x09b7, B:314:0x09db, B:315:0x09e3, B:317:0x09e9, B:319:0x09fb, B:326:0x0a24, B:327:0x0a4e, B:329:0x0a5a, B:331:0x0a6f, B:334:0x0ab3, B:338:0x0acb, B:340:0x0ad2, B:342:0x0ae1, B:344:0x0ae5, B:346:0x0ae9, B:348:0x0aed, B:349:0x0af9, B:350:0x0b05, B:352:0x0b0b, B:354:0x0b27, B:356:0x0b2e, B:371:0x0bd6, B:357:0x0b49, B:359:0x0b51, B:363:0x0b78, B:365:0x0ba4, B:367:0x0bb0, B:368:0x0bc0, B:370:0x0bc8, B:360:0x0b5e, B:324:0x0a0f, B:310:0x099f, B:373:0x0be4, B:375:0x0bf0, B:376:0x0bf6, B:377:0x0bfe, B:379:0x0c04, B:381:0x0c1b, B:383:0x0c2e, B:403:0x0ca2, B:405:0x0ca8, B:407:0x0cbe, B:410:0x0cc5, B:415:0x0cf6, B:411:0x0ccd, B:413:0x0cd9, B:414:0x0cdf, B:416:0x0d06, B:417:0x0d1e, B:420:0x0d26, B:421:0x0d2b, B:422:0x0d3b, B:424:0x0d55, B:425:0x0d70, B:426:0x0d79, B:431:0x0d98, B:430:0x0d85, B:384:0x0c46, B:386:0x0c4c, B:388:0x0c56, B:390:0x0c5d, B:396:0x0c6d, B:398:0x0c74, B:400:0x0c93, B:402:0x0c9a, B:401:0x0c97, B:397:0x0c71, B:389:0x0c5a, B:246:0x0795, B:248:0x079c, B:434:0x0daa), top: B:444:0x0012, inners: #0, #1 }] */
    /* JADX WARN: Removed duplicated region for block: B:222:0x0720 A[Catch: all -> 0x0dbc, TryCatch #2 {all -> 0x0dbc, blocks: (B:3:0x0012, B:5:0x002a, B:8:0x0032, B:9:0x0059, B:12:0x006f, B:15:0x0096, B:17:0x00cc, B:20:0x00de, B:22:0x00e8, B:212:0x06e0, B:25:0x0120, B:27:0x012e, B:30:0x014e, B:32:0x0154, B:34:0x0166, B:36:0x0174, B:38:0x0184, B:39:0x0191, B:43:0x019e, B:46:0x01b5, B:112:0x03e8, B:113:0x03f4, B:116:0x03fe, B:122:0x0421, B:119:0x0410, B:144:0x04a2, B:146:0x04af, B:149:0x04c3, B:151:0x04d4, B:153:0x04e0, B:201:0x066f, B:203:0x0679, B:205:0x067f, B:206:0x0697, B:208:0x06aa, B:209:0x06c2, B:211:0x06cc, B:159:0x0517, B:161:0x0525, B:164:0x053a, B:166:0x054c, B:168:0x0558, B:173:0x058c, B:175:0x05a2, B:177:0x05ae, B:180:0x05c1, B:182:0x05d4, B:184:0x061f, B:186:0x0626, B:188:0x062c, B:190:0x0636, B:192:0x063d, B:194:0x0643, B:196:0x064d, B:197:0x065f, B:126:0x042a, B:128:0x0436, B:130:0x0442, B:142:0x0488, B:134:0x0460, B:137:0x0472, B:139:0x0478, B:141:0x0482, B:64:0x0210, B:67:0x021a, B:69:0x0228, B:74:0x0270, B:70:0x0244, B:72:0x0254, B:78:0x027f, B:81:0x02ae, B:82:0x02d8, B:84:0x0311, B:86:0x0318, B:89:0x0324, B:91:0x035a, B:92:0x0375, B:94:0x037b, B:96:0x038b, B:100:0x03a0, B:97:0x0394, B:104:0x03ab, B:108:0x03b4, B:109:0x03cc, B:217:0x06ff, B:219:0x070d, B:221:0x0718, B:233:0x074e, B:222:0x0720, B:224:0x072b, B:226:0x0731, B:229:0x073d, B:231:0x0747, B:236:0x0755, B:237:0x0762, B:240:0x076a, B:242:0x077c, B:243:0x0788, B:245:0x0790, B:249:0x07b6, B:251:0x07db, B:253:0x07ec, B:255:0x07f2, B:257:0x07fe, B:258:0x082f, B:260:0x0835, B:262:0x0843, B:263:0x0847, B:264:0x084a, B:265:0x084d, B:266:0x085b, B:268:0x0861, B:270:0x0871, B:271:0x0878, B:273:0x0884, B:274:0x088b, B:275:0x088e, B:277:0x08cc, B:278:0x08df, B:280:0x08e5, B:283:0x08ff, B:285:0x091a, B:287:0x0931, B:290:0x0938, B:292:0x093c, B:294:0x0940, B:296:0x094a, B:297:0x0954, B:299:0x0958, B:301:0x095e, B:302:0x096c, B:303:0x0975, B:372:0x0bdb, B:304:0x0981, B:306:0x0998, B:312:0x09b7, B:314:0x09db, B:315:0x09e3, B:317:0x09e9, B:319:0x09fb, B:326:0x0a24, B:327:0x0a4e, B:329:0x0a5a, B:331:0x0a6f, B:334:0x0ab3, B:338:0x0acb, B:340:0x0ad2, B:342:0x0ae1, B:344:0x0ae5, B:346:0x0ae9, B:348:0x0aed, B:349:0x0af9, B:350:0x0b05, B:352:0x0b0b, B:354:0x0b27, B:356:0x0b2e, B:371:0x0bd6, B:357:0x0b49, B:359:0x0b51, B:363:0x0b78, B:365:0x0ba4, B:367:0x0bb0, B:368:0x0bc0, B:370:0x0bc8, B:360:0x0b5e, B:324:0x0a0f, B:310:0x099f, B:373:0x0be4, B:375:0x0bf0, B:376:0x0bf6, B:377:0x0bfe, B:379:0x0c04, B:381:0x0c1b, B:383:0x0c2e, B:403:0x0ca2, B:405:0x0ca8, B:407:0x0cbe, B:410:0x0cc5, B:415:0x0cf6, B:411:0x0ccd, B:413:0x0cd9, B:414:0x0cdf, B:416:0x0d06, B:417:0x0d1e, B:420:0x0d26, B:421:0x0d2b, B:422:0x0d3b, B:424:0x0d55, B:425:0x0d70, B:426:0x0d79, B:431:0x0d98, B:430:0x0d85, B:384:0x0c46, B:386:0x0c4c, B:388:0x0c56, B:390:0x0c5d, B:396:0x0c6d, B:398:0x0c74, B:400:0x0c93, B:402:0x0c9a, B:401:0x0c97, B:397:0x0c71, B:389:0x0c5a, B:246:0x0795, B:248:0x079c, B:434:0x0daa), top: B:444:0x0012, inners: #0, #1 }] */
    /* JADX WARN: Removed duplicated region for block: B:326:0x0a24 A[Catch: all -> 0x0dbc, TryCatch #2 {all -> 0x0dbc, blocks: (B:3:0x0012, B:5:0x002a, B:8:0x0032, B:9:0x0059, B:12:0x006f, B:15:0x0096, B:17:0x00cc, B:20:0x00de, B:22:0x00e8, B:212:0x06e0, B:25:0x0120, B:27:0x012e, B:30:0x014e, B:32:0x0154, B:34:0x0166, B:36:0x0174, B:38:0x0184, B:39:0x0191, B:43:0x019e, B:46:0x01b5, B:112:0x03e8, B:113:0x03f4, B:116:0x03fe, B:122:0x0421, B:119:0x0410, B:144:0x04a2, B:146:0x04af, B:149:0x04c3, B:151:0x04d4, B:153:0x04e0, B:201:0x066f, B:203:0x0679, B:205:0x067f, B:206:0x0697, B:208:0x06aa, B:209:0x06c2, B:211:0x06cc, B:159:0x0517, B:161:0x0525, B:164:0x053a, B:166:0x054c, B:168:0x0558, B:173:0x058c, B:175:0x05a2, B:177:0x05ae, B:180:0x05c1, B:182:0x05d4, B:184:0x061f, B:186:0x0626, B:188:0x062c, B:190:0x0636, B:192:0x063d, B:194:0x0643, B:196:0x064d, B:197:0x065f, B:126:0x042a, B:128:0x0436, B:130:0x0442, B:142:0x0488, B:134:0x0460, B:137:0x0472, B:139:0x0478, B:141:0x0482, B:64:0x0210, B:67:0x021a, B:69:0x0228, B:74:0x0270, B:70:0x0244, B:72:0x0254, B:78:0x027f, B:81:0x02ae, B:82:0x02d8, B:84:0x0311, B:86:0x0318, B:89:0x0324, B:91:0x035a, B:92:0x0375, B:94:0x037b, B:96:0x038b, B:100:0x03a0, B:97:0x0394, B:104:0x03ab, B:108:0x03b4, B:109:0x03cc, B:217:0x06ff, B:219:0x070d, B:221:0x0718, B:233:0x074e, B:222:0x0720, B:224:0x072b, B:226:0x0731, B:229:0x073d, B:231:0x0747, B:236:0x0755, B:237:0x0762, B:240:0x076a, B:242:0x077c, B:243:0x0788, B:245:0x0790, B:249:0x07b6, B:251:0x07db, B:253:0x07ec, B:255:0x07f2, B:257:0x07fe, B:258:0x082f, B:260:0x0835, B:262:0x0843, B:263:0x0847, B:264:0x084a, B:265:0x084d, B:266:0x085b, B:268:0x0861, B:270:0x0871, B:271:0x0878, B:273:0x0884, B:274:0x088b, B:275:0x088e, B:277:0x08cc, B:278:0x08df, B:280:0x08e5, B:283:0x08ff, B:285:0x091a, B:287:0x0931, B:290:0x0938, B:292:0x093c, B:294:0x0940, B:296:0x094a, B:297:0x0954, B:299:0x0958, B:301:0x095e, B:302:0x096c, B:303:0x0975, B:372:0x0bdb, B:304:0x0981, B:306:0x0998, B:312:0x09b7, B:314:0x09db, B:315:0x09e3, B:317:0x09e9, B:319:0x09fb, B:326:0x0a24, B:327:0x0a4e, B:329:0x0a5a, B:331:0x0a6f, B:334:0x0ab3, B:338:0x0acb, B:340:0x0ad2, B:342:0x0ae1, B:344:0x0ae5, B:346:0x0ae9, B:348:0x0aed, B:349:0x0af9, B:350:0x0b05, B:352:0x0b0b, B:354:0x0b27, B:356:0x0b2e, B:371:0x0bd6, B:357:0x0b49, B:359:0x0b51, B:363:0x0b78, B:365:0x0ba4, B:367:0x0bb0, B:368:0x0bc0, B:370:0x0bc8, B:360:0x0b5e, B:324:0x0a0f, B:310:0x099f, B:373:0x0be4, B:375:0x0bf0, B:376:0x0bf6, B:377:0x0bfe, B:379:0x0c04, B:381:0x0c1b, B:383:0x0c2e, B:403:0x0ca2, B:405:0x0ca8, B:407:0x0cbe, B:410:0x0cc5, B:415:0x0cf6, B:411:0x0ccd, B:413:0x0cd9, B:414:0x0cdf, B:416:0x0d06, B:417:0x0d1e, B:420:0x0d26, B:421:0x0d2b, B:422:0x0d3b, B:424:0x0d55, B:425:0x0d70, B:426:0x0d79, B:431:0x0d98, B:430:0x0d85, B:384:0x0c46, B:386:0x0c4c, B:388:0x0c56, B:390:0x0c5d, B:396:0x0c6d, B:398:0x0c74, B:400:0x0c93, B:402:0x0c9a, B:401:0x0c97, B:397:0x0c71, B:389:0x0c5a, B:246:0x0795, B:248:0x079c, B:434:0x0daa), top: B:444:0x0012, inners: #0, #1 }] */
    /* JADX WARN: Removed duplicated region for block: B:327:0x0a4e A[Catch: all -> 0x0dbc, TryCatch #2 {all -> 0x0dbc, blocks: (B:3:0x0012, B:5:0x002a, B:8:0x0032, B:9:0x0059, B:12:0x006f, B:15:0x0096, B:17:0x00cc, B:20:0x00de, B:22:0x00e8, B:212:0x06e0, B:25:0x0120, B:27:0x012e, B:30:0x014e, B:32:0x0154, B:34:0x0166, B:36:0x0174, B:38:0x0184, B:39:0x0191, B:43:0x019e, B:46:0x01b5, B:112:0x03e8, B:113:0x03f4, B:116:0x03fe, B:122:0x0421, B:119:0x0410, B:144:0x04a2, B:146:0x04af, B:149:0x04c3, B:151:0x04d4, B:153:0x04e0, B:201:0x066f, B:203:0x0679, B:205:0x067f, B:206:0x0697, B:208:0x06aa, B:209:0x06c2, B:211:0x06cc, B:159:0x0517, B:161:0x0525, B:164:0x053a, B:166:0x054c, B:168:0x0558, B:173:0x058c, B:175:0x05a2, B:177:0x05ae, B:180:0x05c1, B:182:0x05d4, B:184:0x061f, B:186:0x0626, B:188:0x062c, B:190:0x0636, B:192:0x063d, B:194:0x0643, B:196:0x064d, B:197:0x065f, B:126:0x042a, B:128:0x0436, B:130:0x0442, B:142:0x0488, B:134:0x0460, B:137:0x0472, B:139:0x0478, B:141:0x0482, B:64:0x0210, B:67:0x021a, B:69:0x0228, B:74:0x0270, B:70:0x0244, B:72:0x0254, B:78:0x027f, B:81:0x02ae, B:82:0x02d8, B:84:0x0311, B:86:0x0318, B:89:0x0324, B:91:0x035a, B:92:0x0375, B:94:0x037b, B:96:0x038b, B:100:0x03a0, B:97:0x0394, B:104:0x03ab, B:108:0x03b4, B:109:0x03cc, B:217:0x06ff, B:219:0x070d, B:221:0x0718, B:233:0x074e, B:222:0x0720, B:224:0x072b, B:226:0x0731, B:229:0x073d, B:231:0x0747, B:236:0x0755, B:237:0x0762, B:240:0x076a, B:242:0x077c, B:243:0x0788, B:245:0x0790, B:249:0x07b6, B:251:0x07db, B:253:0x07ec, B:255:0x07f2, B:257:0x07fe, B:258:0x082f, B:260:0x0835, B:262:0x0843, B:263:0x0847, B:264:0x084a, B:265:0x084d, B:266:0x085b, B:268:0x0861, B:270:0x0871, B:271:0x0878, B:273:0x0884, B:274:0x088b, B:275:0x088e, B:277:0x08cc, B:278:0x08df, B:280:0x08e5, B:283:0x08ff, B:285:0x091a, B:287:0x0931, B:290:0x0938, B:292:0x093c, B:294:0x0940, B:296:0x094a, B:297:0x0954, B:299:0x0958, B:301:0x095e, B:302:0x096c, B:303:0x0975, B:372:0x0bdb, B:304:0x0981, B:306:0x0998, B:312:0x09b7, B:314:0x09db, B:315:0x09e3, B:317:0x09e9, B:319:0x09fb, B:326:0x0a24, B:327:0x0a4e, B:329:0x0a5a, B:331:0x0a6f, B:334:0x0ab3, B:338:0x0acb, B:340:0x0ad2, B:342:0x0ae1, B:344:0x0ae5, B:346:0x0ae9, B:348:0x0aed, B:349:0x0af9, B:350:0x0b05, B:352:0x0b0b, B:354:0x0b27, B:356:0x0b2e, B:371:0x0bd6, B:357:0x0b49, B:359:0x0b51, B:363:0x0b78, B:365:0x0ba4, B:367:0x0bb0, B:368:0x0bc0, B:370:0x0bc8, B:360:0x0b5e, B:324:0x0a0f, B:310:0x099f, B:373:0x0be4, B:375:0x0bf0, B:376:0x0bf6, B:377:0x0bfe, B:379:0x0c04, B:381:0x0c1b, B:383:0x0c2e, B:403:0x0ca2, B:405:0x0ca8, B:407:0x0cbe, B:410:0x0cc5, B:415:0x0cf6, B:411:0x0ccd, B:413:0x0cd9, B:414:0x0cdf, B:416:0x0d06, B:417:0x0d1e, B:420:0x0d26, B:421:0x0d2b, B:422:0x0d3b, B:424:0x0d55, B:425:0x0d70, B:426:0x0d79, B:431:0x0d98, B:430:0x0d85, B:384:0x0c46, B:386:0x0c4c, B:388:0x0c56, B:390:0x0c5d, B:396:0x0c6d, B:398:0x0c74, B:400:0x0c93, B:402:0x0c9a, B:401:0x0c97, B:397:0x0c71, B:389:0x0c5a, B:246:0x0795, B:248:0x079c, B:434:0x0daa), top: B:444:0x0012, inners: #0, #1 }] */
    /* JADX WARN: Removed duplicated region for block: B:58:0x01f0 A[PHI: r29
  0x01f0: PHI (r29v11 long) = (r29v7 long), (r29v8 long), (r29v9 long), (r29v12 long) binds: [B:56:0x01ec, B:53:0x01e0, B:50:0x01d4, B:48:0x01c8] A[DONT_GENERATE, DONT_INLINE]] */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    private final boolean zzaa(java.lang.String r44, long r45) {
        /*
            Method dump skipped, instruction units count: 3552
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzkn.zzaa(java.lang.String, long):boolean");
    }

    private final boolean zzac(com.google.android.gms.internal.measurement.zzfn zzfnVar, com.google.android.gms.internal.measurement.zzfn zzfnVar2) {
        Preconditions.checkArgument("_e".equals(zzfnVar.zzk()));
        zzak(this.zzi);
        com.google.android.gms.internal.measurement.zzfs zzfsVarZzA = zzkp.zzA(zzfnVar.zzaA(), "_sc");
        String strZzd = zzfsVarZzA == null ? null : zzfsVarZzA.zzd();
        zzak(this.zzi);
        com.google.android.gms.internal.measurement.zzfs zzfsVarZzA2 = zzkp.zzA(zzfnVar2.zzaA(), "_pc");
        String strZzd2 = zzfsVarZzA2 != null ? zzfsVarZzA2.zzd() : null;
        if (strZzd2 == null || !strZzd2.equals(strZzd)) {
            return false;
        }
        zzad(zzfnVar, zzfnVar2);
        return true;
    }

    private final void zzad(com.google.android.gms.internal.measurement.zzfn zzfnVar, com.google.android.gms.internal.measurement.zzfn zzfnVar2) {
        Preconditions.checkArgument("_e".equals(zzfnVar.zzk()));
        zzak(this.zzi);
        com.google.android.gms.internal.measurement.zzfs zzfsVarZzA = zzkp.zzA(zzfnVar.zzaA(), "_et");
        if (zzfsVarZzA == null || !zzfsVarZzA.zze() || zzfsVarZzA.zzf() <= 0) {
            return;
        }
        long jZzf = zzfsVarZzA.zzf();
        zzak(this.zzi);
        com.google.android.gms.internal.measurement.zzfs zzfsVarZzA2 = zzkp.zzA(zzfnVar2.zzaA(), "_et");
        if (zzfsVarZzA2 != null && zzfsVarZzA2.zzf() > 0) {
            jZzf += zzfsVarZzA2.zzf();
        }
        zzak(this.zzi);
        zzkp.zzy(zzfnVar2, "_et", Long.valueOf(jZzf));
        zzak(this.zzi);
        zzkp.zzy(zzfnVar, "_fr", 1L);
    }

    private final boolean zzae() {
        zzav().zzg();
        zzr();
        zzai zzaiVar = this.zze;
        zzak(zzaiVar);
        if (zzaiVar.zzG()) {
            return true;
        }
        zzai zzaiVar2 = this.zze;
        zzak(zzaiVar2);
        return !TextUtils.isEmpty(zzaiVar2.zzy());
    }

    private final void zzaf() {
        long jMax;
        long jMax2;
        zzav().zzg();
        zzr();
        if (this.zza > 0) {
            long jAbs = 3600000 - Math.abs(zzay().elapsedRealtime() - this.zza);
            if (jAbs > 0) {
                zzau().zzk().zzb("Upload has been suspended. Will update scheduling later in approximately ms", Long.valueOf(jAbs));
                zzj().zzb();
                zzkc zzkcVar = this.zzg;
                zzak(zzkcVar);
                zzkcVar.zzd();
                return;
            }
            this.zza = 0L;
        }
        if (!this.zzm.zzL() || !zzae()) {
            zzau().zzk().zza("Nothing to upload or uploading impossible");
            zzj().zzb();
            zzkc zzkcVar2 = this.zzg;
            zzak(zzkcVar2);
            zzkcVar2.zzd();
            return;
        }
        long jCurrentTimeMillis = zzay().currentTimeMillis();
        zzd();
        long jMax3 = Math.max(0L, zzea.zzz.zzb(null).longValue());
        zzai zzaiVar = this.zze;
        zzak(zzaiVar);
        boolean z = true;
        if (!zzaiVar.zzH()) {
            zzai zzaiVar2 = this.zze;
            zzak(zzaiVar2);
            if (!zzaiVar2.zzz()) {
                z = false;
            }
        }
        if (z) {
            String strZzu = zzd().zzu();
            if (TextUtils.isEmpty(strZzu) || ".none.".equals(strZzu)) {
                zzd();
                jMax = Math.max(0L, zzea.zzt.zzb(null).longValue());
            } else {
                zzd();
                jMax = Math.max(0L, zzea.zzu.zzb(null).longValue());
            }
        } else {
            zzd();
            jMax = Math.max(0L, zzea.zzs.zzb(null).longValue());
        }
        long jZza = this.zzk.zzc.zza();
        long jZza2 = this.zzk.zzd.zza();
        zzai zzaiVar3 = this.zze;
        zzak(zzaiVar3);
        boolean z2 = z;
        long jZzD = zzaiVar3.zzD();
        zzai zzaiVar4 = this.zze;
        zzak(zzaiVar4);
        long jMax4 = Math.max(jZzD, zzaiVar4.zzF());
        if (jMax4 == 0) {
            jMax2 = 0;
        } else {
            long jAbs2 = jCurrentTimeMillis - Math.abs(jMax4 - jCurrentTimeMillis);
            long jAbs3 = Math.abs(jZza - jCurrentTimeMillis);
            long jAbs4 = jCurrentTimeMillis - Math.abs(jZza2 - jCurrentTimeMillis);
            long jMax5 = Math.max(jCurrentTimeMillis - jAbs3, jAbs4);
            jMax2 = jAbs2 + jMax3;
            if (z2 && jMax5 > 0) {
                jMax2 = Math.min(jAbs2, jMax5) + jMax;
            }
            zzkp zzkpVar = this.zzi;
            zzak(zzkpVar);
            if (!zzkpVar.zzq(jMax5, jMax)) {
                jMax2 = jMax5 + jMax;
            }
            if (jAbs4 != 0 && jAbs4 >= jAbs2) {
                int i = 0;
                while (true) {
                    zzd();
                    if (i >= Math.min(20, Math.max(0, zzea.zzB.zzb(null).intValue()))) {
                        jMax2 = 0;
                        break;
                    }
                    zzd();
                    jMax2 += Math.max(0L, zzea.zzA.zzb(null).longValue()) * (1 << i);
                    if (jMax2 > jAbs4) {
                        break;
                    } else {
                        i++;
                    }
                }
            }
        }
        if (jMax2 == 0) {
            zzau().zzk().zza("Next upload time is 0");
            zzj().zzb();
            zzkc zzkcVar3 = this.zzg;
            zzak(zzkcVar3);
            zzkcVar3.zzd();
            return;
        }
        zzes zzesVar = this.zzd;
        zzak(zzesVar);
        if (!zzesVar.zzb()) {
            zzau().zzk().zza("No network");
            zzj().zza();
            zzkc zzkcVar4 = this.zzg;
            zzak(zzkcVar4);
            zzkcVar4.zzd();
            return;
        }
        long jZza3 = this.zzk.zzb.zza();
        zzd();
        long jMax6 = Math.max(0L, zzea.zzq.zzb(null).longValue());
        zzkp zzkpVar2 = this.zzi;
        zzak(zzkpVar2);
        if (!zzkpVar2.zzq(jZza3, jMax6)) {
            jMax2 = Math.max(jMax2, jZza3 + jMax6);
        }
        zzj().zzb();
        long jCurrentTimeMillis2 = jMax2 - zzay().currentTimeMillis();
        if (jCurrentTimeMillis2 <= 0) {
            zzd();
            jCurrentTimeMillis2 = Math.max(0L, zzea.zzv.zzb(null).longValue());
            this.zzk.zzc.zzb(zzay().currentTimeMillis());
        }
        zzau().zzk().zzb("Upload scheduled in approximately ms", Long.valueOf(jCurrentTimeMillis2));
        zzkc zzkcVar5 = this.zzg;
        zzak(zzkcVar5);
        zzkcVar5.zzc(jCurrentTimeMillis2);
    }

    private final void zzag() {
        zzav().zzg();
        if (this.zzs || this.zzt || this.zzu) {
            zzau().zzk().zzd("Not stopping services. fetch, network, upload", Boolean.valueOf(this.zzs), Boolean.valueOf(this.zzt), Boolean.valueOf(this.zzu));
            return;
        }
        zzau().zzk().zza("Stopping uploading service(s)");
        List<Runnable> list = this.zzp;
        if (list == null) {
            return;
        }
        Iterator<Runnable> it = list.iterator();
        while (it.hasNext()) {
            it.next().run();
        }
        ((List) Preconditions.checkNotNull(this.zzp)).clear();
    }

    private final Boolean zzah(zzg zzgVar) {
        try {
            if (zzgVar.zzv() != -2147483648L) {
                if (zzgVar.zzv() == Wrappers.packageManager(this.zzm.zzax()).getPackageInfo(zzgVar.zzc(), 0).versionCode) {
                    return true;
                }
            } else {
                String str = Wrappers.packageManager(this.zzm.zzax()).getPackageInfo(zzgVar.zzc(), 0).versionName;
                String strZzt = zzgVar.zzt();
                if (strZzt != null && strZzt.equals(str)) {
                    return true;
                }
            }
            return false;
        } catch (PackageManager.NameNotFoundException e) {
            return null;
        }
    }

    private final zzp zzai(String str) {
        zzai zzaiVar = this.zze;
        zzak(zzaiVar);
        zzg zzgVarZzs = zzaiVar.zzs(str);
        if (zzgVarZzs == null || TextUtils.isEmpty(zzgVarZzs.zzt())) {
            zzau().zzj().zzb("No app data available; dropping", str);
            return null;
        }
        Boolean boolZzah = zzah(zzgVarZzs);
        if (boolZzah != null && !boolZzah.booleanValue()) {
            zzau().zzb().zzb("App version does not match; dropping. appId", zzem.zzl(str));
            return null;
        }
        String strZzf = zzgVarZzs.zzf();
        String strZzt = zzgVarZzs.zzt();
        long jZzv = zzgVarZzs.zzv();
        String strZzx = zzgVarZzs.zzx();
        long jZzz = zzgVarZzs.zzz();
        long jZzB = zzgVarZzs.zzB();
        boolean zZzF = zzgVarZzs.zzF();
        String strZzn = zzgVarZzs.zzn();
        long jZzad = zzgVarZzs.zzad();
        boolean zZzaf = zzgVarZzs.zzaf();
        String strZzh = zzgVarZzs.zzh();
        Boolean boolZzah2 = zzgVarZzs.zzah();
        long jZzD = zzgVarZzs.zzD();
        List<String> listZzaj = zzgVarZzs.zzaj();
        zzov.zzb();
        return new zzp(str, strZzf, strZzt, jZzv, strZzx, jZzz, jZzB, (String) null, zZzF, false, strZzn, jZzad, 0L, 0, zZzaf, false, strZzh, boolZzah2, jZzD, listZzaj, zzd().zzn(str, zzea.zzag) ? zzgVarZzs.zzj() : null, zzt(str).zzd());
    }

    private final boolean zzaj(zzp zzpVar) {
        zzov.zzb();
        return zzd().zzn(zzpVar.zza, zzea.zzag) ? (TextUtils.isEmpty(zzpVar.zzb) && TextUtils.isEmpty(zzpVar.zzu) && TextUtils.isEmpty(zzpVar.zzq)) ? false : true : (TextUtils.isEmpty(zzpVar.zzb) && TextUtils.isEmpty(zzpVar.zzq)) ? false : true;
    }

    private static final zzke zzak(zzke zzkeVar) {
        if (zzkeVar == null) {
            throw new IllegalStateException("Upload Component not created");
        }
        if (zzkeVar.zzY()) {
            return zzkeVar;
        }
        String strValueOf = String.valueOf(zzkeVar.getClass());
        StringBuilder sb = new StringBuilder(String.valueOf(strValueOf).length() + 27);
        sb.append("Component not initialized: ");
        sb.append(strValueOf);
        throw new IllegalStateException(sb.toString());
    }

    final String zzA(zzaf zzafVar) {
        if (!zzafVar.zzh()) {
            return null;
        }
        byte[] bArr = new byte[16];
        zzq().zzf().nextBytes(bArr);
        return String.format(Locale.US, "%032x", new BigInteger(1, bArr));
    }

    /* JADX WARN: Multi-variable type inference failed */
    /* JADX WARN: Removed duplicated region for block: B:127:0x0281 A[Catch: all -> 0x052a, TRY_ENTER, TRY_LEAVE, TryCatch #8 {all -> 0x052a, blocks: (B:3:0x0010, B:5:0x0021, B:9:0x0034, B:11:0x003a, B:13:0x004a, B:15:0x0052, B:17:0x0058, B:19:0x0063, B:21:0x0073, B:23:0x007e, B:25:0x0091, B:27:0x00b0, B:29:0x00b6, B:30:0x00b9, B:32:0x00c5, B:33:0x00dc, B:35:0x00ed, B:37:0x00f3, B:42:0x010a, B:61:0x0133, B:65:0x013a, B:66:0x013d, B:67:0x013e, B:71:0x0166, B:75:0x016e, B:82:0x01aa, B:142:0x02b5, B:144:0x02bb, B:146:0x02c5, B:147:0x02c9, B:149:0x02cf, B:151:0x02e3, B:155:0x02ec, B:157:0x02f2, B:163:0x0317, B:160:0x0307, B:162:0x0311, B:164:0x031a, B:166:0x0335, B:170:0x0342, B:172:0x0355, B:174:0x038f, B:176:0x0394, B:178:0x039c, B:179:0x039f, B:181:0x03ab, B:182:0x03c1, B:183:0x03c9, B:185:0x03da, B:187:0x03eb, B:188:0x0406, B:190:0x0418, B:192:0x042d, B:194:0x0438, B:195:0x0441, B:191:0x0426, B:198:0x0485, B:127:0x0281, B:141:0x02b2, B:202:0x049c, B:203:0x049f, B:204:0x04a0, B:214:0x04ec, B:226:0x0509, B:228:0x050f, B:230:0x051a, B:235:0x0526, B:236:0x0529), top: B:250:0x0010, inners: #4 }] */
    /* JADX WARN: Removed duplicated region for block: B:144:0x02bb A[Catch: all -> 0x052a, TryCatch #8 {all -> 0x052a, blocks: (B:3:0x0010, B:5:0x0021, B:9:0x0034, B:11:0x003a, B:13:0x004a, B:15:0x0052, B:17:0x0058, B:19:0x0063, B:21:0x0073, B:23:0x007e, B:25:0x0091, B:27:0x00b0, B:29:0x00b6, B:30:0x00b9, B:32:0x00c5, B:33:0x00dc, B:35:0x00ed, B:37:0x00f3, B:42:0x010a, B:61:0x0133, B:65:0x013a, B:66:0x013d, B:67:0x013e, B:71:0x0166, B:75:0x016e, B:82:0x01aa, B:142:0x02b5, B:144:0x02bb, B:146:0x02c5, B:147:0x02c9, B:149:0x02cf, B:151:0x02e3, B:155:0x02ec, B:157:0x02f2, B:163:0x0317, B:160:0x0307, B:162:0x0311, B:164:0x031a, B:166:0x0335, B:170:0x0342, B:172:0x0355, B:174:0x038f, B:176:0x0394, B:178:0x039c, B:179:0x039f, B:181:0x03ab, B:182:0x03c1, B:183:0x03c9, B:185:0x03da, B:187:0x03eb, B:188:0x0406, B:190:0x0418, B:192:0x042d, B:194:0x0438, B:195:0x0441, B:191:0x0426, B:198:0x0485, B:127:0x0281, B:141:0x02b2, B:202:0x049c, B:203:0x049f, B:204:0x04a0, B:214:0x04ec, B:226:0x0509, B:228:0x050f, B:230:0x051a, B:235:0x0526, B:236:0x0529), top: B:250:0x0010, inners: #4 }] */
    /* JADX WARN: Removed duplicated region for block: B:202:0x049c A[Catch: all -> 0x052a, TryCatch #8 {all -> 0x052a, blocks: (B:3:0x0010, B:5:0x0021, B:9:0x0034, B:11:0x003a, B:13:0x004a, B:15:0x0052, B:17:0x0058, B:19:0x0063, B:21:0x0073, B:23:0x007e, B:25:0x0091, B:27:0x00b0, B:29:0x00b6, B:30:0x00b9, B:32:0x00c5, B:33:0x00dc, B:35:0x00ed, B:37:0x00f3, B:42:0x010a, B:61:0x0133, B:65:0x013a, B:66:0x013d, B:67:0x013e, B:71:0x0166, B:75:0x016e, B:82:0x01aa, B:142:0x02b5, B:144:0x02bb, B:146:0x02c5, B:147:0x02c9, B:149:0x02cf, B:151:0x02e3, B:155:0x02ec, B:157:0x02f2, B:163:0x0317, B:160:0x0307, B:162:0x0311, B:164:0x031a, B:166:0x0335, B:170:0x0342, B:172:0x0355, B:174:0x038f, B:176:0x0394, B:178:0x039c, B:179:0x039f, B:181:0x03ab, B:182:0x03c1, B:183:0x03c9, B:185:0x03da, B:187:0x03eb, B:188:0x0406, B:190:0x0418, B:192:0x042d, B:194:0x0438, B:195:0x0441, B:191:0x0426, B:198:0x0485, B:127:0x0281, B:141:0x02b2, B:202:0x049c, B:203:0x049f, B:204:0x04a0, B:214:0x04ec, B:226:0x0509, B:228:0x050f, B:230:0x051a, B:235:0x0526, B:236:0x0529), top: B:250:0x0010, inners: #4 }] */
    /* JADX WARN: Removed duplicated region for block: B:228:0x050f A[Catch: all -> 0x052a, TryCatch #8 {all -> 0x052a, blocks: (B:3:0x0010, B:5:0x0021, B:9:0x0034, B:11:0x003a, B:13:0x004a, B:15:0x0052, B:17:0x0058, B:19:0x0063, B:21:0x0073, B:23:0x007e, B:25:0x0091, B:27:0x00b0, B:29:0x00b6, B:30:0x00b9, B:32:0x00c5, B:33:0x00dc, B:35:0x00ed, B:37:0x00f3, B:42:0x010a, B:61:0x0133, B:65:0x013a, B:66:0x013d, B:67:0x013e, B:71:0x0166, B:75:0x016e, B:82:0x01aa, B:142:0x02b5, B:144:0x02bb, B:146:0x02c5, B:147:0x02c9, B:149:0x02cf, B:151:0x02e3, B:155:0x02ec, B:157:0x02f2, B:163:0x0317, B:160:0x0307, B:162:0x0311, B:164:0x031a, B:166:0x0335, B:170:0x0342, B:172:0x0355, B:174:0x038f, B:176:0x0394, B:178:0x039c, B:179:0x039f, B:181:0x03ab, B:182:0x03c1, B:183:0x03c9, B:185:0x03da, B:187:0x03eb, B:188:0x0406, B:190:0x0418, B:192:0x042d, B:194:0x0438, B:195:0x0441, B:191:0x0426, B:198:0x0485, B:127:0x0281, B:141:0x02b2, B:202:0x049c, B:203:0x049f, B:204:0x04a0, B:214:0x04ec, B:226:0x0509, B:228:0x050f, B:230:0x051a, B:235:0x0526, B:236:0x0529), top: B:250:0x0010, inners: #4 }] */
    /* JADX WARN: Removed duplicated region for block: B:42:0x010a A[Catch: all -> 0x052a, PHI: r7 r11
  0x010a: PHI (r7v16 long) = (r7v0 long), (r7v18 long), (r7v0 long) binds: [B:58:0x012f, B:47:0x0114, B:41:0x0108] A[DONT_GENERATE, DONT_INLINE]
  0x010a: PHI (r11v16 android.database.Cursor) = (r11v15 android.database.Cursor), (r11v18 android.database.Cursor), (r11v18 android.database.Cursor) binds: [B:58:0x012f, B:47:0x0114, B:41:0x0108] A[DONT_GENERATE, DONT_INLINE], TRY_ENTER, TRY_LEAVE, TryCatch #8 {all -> 0x052a, blocks: (B:3:0x0010, B:5:0x0021, B:9:0x0034, B:11:0x003a, B:13:0x004a, B:15:0x0052, B:17:0x0058, B:19:0x0063, B:21:0x0073, B:23:0x007e, B:25:0x0091, B:27:0x00b0, B:29:0x00b6, B:30:0x00b9, B:32:0x00c5, B:33:0x00dc, B:35:0x00ed, B:37:0x00f3, B:42:0x010a, B:61:0x0133, B:65:0x013a, B:66:0x013d, B:67:0x013e, B:71:0x0166, B:75:0x016e, B:82:0x01aa, B:142:0x02b5, B:144:0x02bb, B:146:0x02c5, B:147:0x02c9, B:149:0x02cf, B:151:0x02e3, B:155:0x02ec, B:157:0x02f2, B:163:0x0317, B:160:0x0307, B:162:0x0311, B:164:0x031a, B:166:0x0335, B:170:0x0342, B:172:0x0355, B:174:0x038f, B:176:0x0394, B:178:0x039c, B:179:0x039f, B:181:0x03ab, B:182:0x03c1, B:183:0x03c9, B:185:0x03da, B:187:0x03eb, B:188:0x0406, B:190:0x0418, B:192:0x042d, B:194:0x0438, B:195:0x0441, B:191:0x0426, B:198:0x0485, B:127:0x0281, B:141:0x02b2, B:202:0x049c, B:203:0x049f, B:204:0x04a0, B:214:0x04ec, B:226:0x0509, B:228:0x050f, B:230:0x051a, B:235:0x0526, B:236:0x0529), top: B:250:0x0010, inners: #4 }] */
    /* JADX WARN: Removed duplicated region for block: B:65:0x013a A[Catch: all -> 0x052a, TryCatch #8 {all -> 0x052a, blocks: (B:3:0x0010, B:5:0x0021, B:9:0x0034, B:11:0x003a, B:13:0x004a, B:15:0x0052, B:17:0x0058, B:19:0x0063, B:21:0x0073, B:23:0x007e, B:25:0x0091, B:27:0x00b0, B:29:0x00b6, B:30:0x00b9, B:32:0x00c5, B:33:0x00dc, B:35:0x00ed, B:37:0x00f3, B:42:0x010a, B:61:0x0133, B:65:0x013a, B:66:0x013d, B:67:0x013e, B:71:0x0166, B:75:0x016e, B:82:0x01aa, B:142:0x02b5, B:144:0x02bb, B:146:0x02c5, B:147:0x02c9, B:149:0x02cf, B:151:0x02e3, B:155:0x02ec, B:157:0x02f2, B:163:0x0317, B:160:0x0307, B:162:0x0311, B:164:0x031a, B:166:0x0335, B:170:0x0342, B:172:0x0355, B:174:0x038f, B:176:0x0394, B:178:0x039c, B:179:0x039f, B:181:0x03ab, B:182:0x03c1, B:183:0x03c9, B:185:0x03da, B:187:0x03eb, B:188:0x0406, B:190:0x0418, B:192:0x042d, B:194:0x0438, B:195:0x0441, B:191:0x0426, B:198:0x0485, B:127:0x0281, B:141:0x02b2, B:202:0x049c, B:203:0x049f, B:204:0x04a0, B:214:0x04ec, B:226:0x0509, B:228:0x050f, B:230:0x051a, B:235:0x0526, B:236:0x0529), top: B:250:0x0010, inners: #4 }] */
    /* JADX WARN: Removed duplicated region for block: B:69:0x0163  */
    /* JADX WARN: Removed duplicated region for block: B:70:0x0165  */
    /* JADX WARN: Removed duplicated region for block: B:73:0x016b  */
    /* JADX WARN: Removed duplicated region for block: B:74:0x016d  */
    /* JADX WARN: Removed duplicated region for block: B:80:0x01a4 A[Catch: all -> 0x0289, SQLiteException -> 0x028d, TRY_LEAVE, TryCatch #7 {all -> 0x0289, blocks: (B:78:0x019e, B:80:0x01a4, B:84:0x01b1, B:85:0x01b7, B:86:0x01bc, B:87:0x01c7, B:89:0x01dc, B:91:0x01e2, B:92:0x01ec, B:94:0x01f2, B:98:0x01f8, B:100:0x0203, B:102:0x0209, B:103:0x0210, B:121:0x026e, B:105:0x0225, B:108:0x023b, B:114:0x0246, B:115:0x0255, B:120:0x025b), top: B:249:0x019e }] */
    /* JADX WARN: Removed duplicated region for block: B:84:0x01b1 A[Catch: all -> 0x0289, SQLiteException -> 0x028d, TRY_ENTER, TryCatch #7 {all -> 0x0289, blocks: (B:78:0x019e, B:80:0x01a4, B:84:0x01b1, B:85:0x01b7, B:86:0x01bc, B:87:0x01c7, B:89:0x01dc, B:91:0x01e2, B:92:0x01ec, B:94:0x01f2, B:98:0x01f8, B:100:0x0203, B:102:0x0209, B:103:0x0210, B:121:0x026e, B:105:0x0225, B:108:0x023b, B:114:0x0246, B:115:0x0255, B:120:0x025b), top: B:249:0x019e }] */
    /* JADX WARN: Type inference failed for: r0v28, types: [com.google.android.gms.measurement.internal.zzai, com.google.android.gms.measurement.internal.zzke] */
    /* JADX WARN: Type inference failed for: r3v0 */
    /* JADX WARN: Type inference failed for: r3v10 */
    /* JADX WARN: Type inference failed for: r3v11 */
    /* JADX WARN: Type inference failed for: r3v13 */
    /* JADX WARN: Type inference failed for: r3v2 */
    /* JADX WARN: Type inference failed for: r3v29 */
    /* JADX WARN: Type inference failed for: r3v31 */
    /* JADX WARN: Type inference failed for: r3v33, types: [java.io.ByteArrayOutputStream] */
    /* JADX WARN: Type inference failed for: r3v35 */
    /* JADX WARN: Type inference failed for: r3v37 */
    /* JADX WARN: Type inference failed for: r3v38 */
    /* JADX WARN: Type inference failed for: r3v39 */
    /* JADX WARN: Type inference failed for: r3v40 */
    /* JADX WARN: Type inference failed for: r3v41 */
    /* JADX WARN: Type inference failed for: r3v42 */
    /* JADX WARN: Type inference failed for: r3v43 */
    /* JADX WARN: Type inference failed for: r3v44 */
    /* JADX WARN: Type inference failed for: r3v45 */
    /* JADX WARN: Type inference failed for: r3v46 */
    /* JADX WARN: Type inference failed for: r3v47 */
    /* JADX WARN: Type inference failed for: r3v48 */
    /* JADX WARN: Type inference failed for: r3v49 */
    /* JADX WARN: Type inference failed for: r3v5, types: [android.database.Cursor] */
    /* JADX WARN: Type inference failed for: r3v50 */
    /* JADX WARN: Type inference failed for: r3v51 */
    /* JADX WARN: Type inference failed for: r3v52 */
    /* JADX WARN: Type inference failed for: r3v53 */
    /* JADX WARN: Type inference failed for: r3v54 */
    /* JADX WARN: Type inference failed for: r3v55 */
    /* JADX WARN: Type inference failed for: r3v6 */
    /* JADX WARN: Type inference failed for: r3v7, types: [android.database.Cursor] */
    /* JADX WARN: Type inference failed for: r3v8 */
    /* JADX WARN: Type inference failed for: r3v9 */
    /* JADX WARN: Type inference failed for: r9v0 */
    /* JADX WARN: Type inference failed for: r9v16 */
    /* JADX WARN: Type inference failed for: r9v2, types: [java.lang.CharSequence, java.lang.String] */
    /* JADX WARN: Type inference failed for: r9v3 */
    /* JADX WARN: Type inference failed for: r9v30 */
    /* JADX WARN: Type inference failed for: r9v31 */
    /* JADX WARN: Type inference failed for: r9v32 */
    /* JADX WARN: Type inference failed for: r9v33 */
    /* JADX WARN: Type inference failed for: r9v39 */
    /* JADX WARN: Type inference failed for: r9v4 */
    /* JADX WARN: Type inference failed for: r9v43 */
    /* JADX WARN: Type inference failed for: r9v44 */
    /* JADX WARN: Type inference failed for: r9v45 */
    /* JADX WARN: Type inference failed for: r9v46 */
    /* JADX WARN: Type inference failed for: r9v47 */
    /* JADX WARN: Type inference failed for: r9v48 */
    /* JADX WARN: Type inference failed for: r9v49 */
    /* JADX WARN: Type inference failed for: r9v5 */
    /* JADX WARN: Type inference failed for: r9v50 */
    /* JADX WARN: Type inference failed for: r9v51 */
    /* JADX WARN: Type inference failed for: r9v6, types: [android.database.Cursor] */
    /* JADX WARN: Type inference failed for: r9v7 */
    /* JADX WARN: Type inference failed for: r9v8 */
    /* JADX WARN: Type inference fix 'apply assigned field type' failed
    java.lang.UnsupportedOperationException: ArgType.getObject(), call class: class jadx.core.dex.instructions.args.ArgType$UnknownArg
    	at jadx.core.dex.instructions.args.ArgType.getObject(ArgType.java:593)
    	at jadx.core.dex.attributes.nodes.ClassTypeVarsAttr.getTypeVarsMapFor(ClassTypeVarsAttr.java:35)
    	at jadx.core.dex.nodes.utils.TypeUtils.replaceClassGenerics(TypeUtils.java:177)
    	at jadx.core.dex.visitors.typeinference.FixTypesVisitor.insertExplicitUseCast(FixTypesVisitor.java:397)
    	at jadx.core.dex.visitors.typeinference.FixTypesVisitor.tryFieldTypeWithNewCasts(FixTypesVisitor.java:359)
    	at jadx.core.dex.visitors.typeinference.FixTypesVisitor.applyFieldType(FixTypesVisitor.java:309)
    	at jadx.core.dex.visitors.typeinference.FixTypesVisitor.visit(FixTypesVisitor.java:94)
     */
    /* JADX WARN: Unsupported multi-entry loop pattern (BACK_EDGE: B:227:0x050d -> B:231:0x051d). Please report as a decompilation issue!!! */
    /* JADX WARN: Unsupported multi-entry loop pattern (BACK_EDGE: B:229:0x0518 -> B:231:0x051d). Please report as a decompilation issue!!! */
    /* JADX WARN: Unsupported multi-entry loop pattern (BACK_EDGE: B:230:0x051a -> B:231:0x051d). Please report as a decompilation issue!!! */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    final void zzB() {
        /*
            Method dump skipped, instruction units count: 1330
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzkn.zzB():void");
    }

    /* JADX WARN: Removed duplicated region for block: B:50:0x014b A[Catch: all -> 0x016b, TryCatch #2 {all -> 0x016b, blocks: (B:4:0x000d, B:5:0x000f, B:46:0x0123, B:51:0x015a, B:50:0x014b, B:12:0x0026, B:34:0x00c4, B:36:0x00d9, B:38:0x00df, B:40:0x00ea, B:39:0x00e3, B:42:0x00ee, B:43:0x00f6, B:45:0x00f8), top: B:60:0x000d, inners: #0 }] */
    /* JADX WARN: Removed duplicated region for block: B:57:0x0026 A[EXC_TOP_SPLITTER, SYNTHETIC] */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    final void zzC(int r9, java.lang.Throwable r10, byte[] r11, java.lang.String r12) {
        /*
            Method dump skipped, instruction units count: 370
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzkn.zzC(int, java.lang.Throwable, byte[], java.lang.String):void");
    }

    final void zzD(zzg zzgVar) throws Throwable {
        ArrayMap arrayMap;
        zzav().zzg();
        zzov.zzb();
        if (zzd().zzn(zzgVar.zzc(), zzea.zzag)) {
            if (TextUtils.isEmpty(zzgVar.zzf()) && TextUtils.isEmpty(zzgVar.zzj()) && TextUtils.isEmpty(zzgVar.zzh())) {
                zzE((String) Preconditions.checkNotNull(zzgVar.zzc()), 204, null, null, null);
                return;
            }
        } else if (TextUtils.isEmpty(zzgVar.zzf()) && TextUtils.isEmpty(zzgVar.zzh())) {
            zzE((String) Preconditions.checkNotNull(zzgVar.zzc()), 204, null, null, null);
            return;
        }
        zzkf zzkfVar = this.zzl;
        Uri.Builder builder = new Uri.Builder();
        String strZzf = zzgVar.zzf();
        if (TextUtils.isEmpty(strZzf)) {
            zzov.zzb();
            if (zzkfVar.zzs.zzc().zzn(zzgVar.zzc(), zzea.zzag)) {
                strZzf = zzgVar.zzj();
                if (TextUtils.isEmpty(strZzf)) {
                    strZzf = zzgVar.zzh();
                }
            } else {
                strZzf = zzgVar.zzh();
            }
        }
        Uri.Builder builderEncodedAuthority = builder.scheme(zzea.zzd.zzb(null)).encodedAuthority(zzea.zze.zzb(null));
        String strValueOf = String.valueOf(strZzf);
        Uri.Builder builderAppendQueryParameter = builderEncodedAuthority.path(strValueOf.length() != 0 ? "config/app/".concat(strValueOf) : new String("config/app/")).appendQueryParameter("app_instance_id", zzgVar.zzd()).appendQueryParameter("platform", "android");
        zzkfVar.zzs.zzc().zzf();
        builderAppendQueryParameter.appendQueryParameter("gmp_version", String.valueOf(42004L));
        zzpt.zzb();
        if (zzkfVar.zzs.zzc().zzn(zzgVar.zzc(), zzea.zzaD)) {
            builder.appendQueryParameter("runtime_version", "0");
        }
        String string = builder.build().toString();
        try {
            String str = (String) Preconditions.checkNotNull(zzgVar.zzc());
            URL url = new URL(string);
            zzau().zzk().zzb("Fetching remote configuration", str);
            zzfl zzflVar = this.zzc;
            zzak(zzflVar);
            com.google.android.gms.internal.measurement.zzfc zzfcVarZzb = zzflVar.zzb(str);
            zzfl zzflVar2 = this.zzc;
            zzak(zzflVar2);
            String strZzc = zzflVar2.zzc(str);
            if (zzfcVarZzb == null || TextUtils.isEmpty(strZzc)) {
                arrayMap = null;
            } else {
                ArrayMap arrayMap2 = new ArrayMap();
                arrayMap2.put("If-Modified-Since", strZzc);
                arrayMap = arrayMap2;
            }
            this.zzs = true;
            zzes zzesVar = this.zzd;
            zzak(zzesVar);
            zzki zzkiVar = new zzki(this);
            zzesVar.zzg();
            zzesVar.zzZ();
            Preconditions.checkNotNull(url);
            Preconditions.checkNotNull(zzkiVar);
            zzesVar.zzs.zzav().zzk(new zzer(zzesVar, str, url, null, arrayMap, zzkiVar));
        } catch (MalformedURLException e) {
            zzau().zzb().zzc("Failed to parse config URL. Not fetching. appId", zzem.zzl(zzgVar.zzc()), string);
        }
    }

    /* JADX WARN: Removed duplicated region for block: B:13:0x0045  */
    /* JADX WARN: Removed duplicated region for block: B:53:0x0127 A[Catch: all -> 0x016c, TryCatch #1 {all -> 0x016c, blocks: (B:6:0x002c, B:16:0x004a, B:61:0x015e, B:21:0x0064, B:26:0x00b6, B:25:0x00a7, B:29:0x00be, B:32:0x00ca, B:34:0x00d0, B:39:0x00dd, B:51:0x0112, B:53:0x0127, B:55:0x0146, B:57:0x0151, B:59:0x0157, B:60:0x015b, B:54:0x0135, B:45:0x00f6, B:47:0x0101), top: B:70:0x002c, outer: #0 }] */
    /* JADX WARN: Removed duplicated region for block: B:54:0x0135 A[Catch: all -> 0x016c, TryCatch #1 {all -> 0x016c, blocks: (B:6:0x002c, B:16:0x004a, B:61:0x015e, B:21:0x0064, B:26:0x00b6, B:25:0x00a7, B:29:0x00be, B:32:0x00ca, B:34:0x00d0, B:39:0x00dd, B:51:0x0112, B:53:0x0127, B:55:0x0146, B:57:0x0151, B:59:0x0157, B:60:0x015b, B:54:0x0135, B:45:0x00f6, B:47:0x0101), top: B:70:0x002c, outer: #0 }] */
    /* JADX WARN: Removed duplicated region for block: B:60:0x015b A[Catch: all -> 0x016c, TryCatch #1 {all -> 0x016c, blocks: (B:6:0x002c, B:16:0x004a, B:61:0x015e, B:21:0x0064, B:26:0x00b6, B:25:0x00a7, B:29:0x00be, B:32:0x00ca, B:34:0x00d0, B:39:0x00dd, B:51:0x0112, B:53:0x0127, B:55:0x0146, B:57:0x0151, B:59:0x0157, B:60:0x015b, B:54:0x0135, B:45:0x00f6, B:47:0x0101), top: B:70:0x002c, outer: #0 }] */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    final void zzE(java.lang.String r7, int r8, java.lang.Throwable r9, byte[] r10, java.util.Map<java.lang.String, java.util.List<java.lang.String>> r11) {
        /*
            Method dump skipped, instruction units count: 381
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzkn.zzE(java.lang.String, int, java.lang.Throwable, byte[], java.util.Map):void");
    }

    final void zzF(Runnable runnable) {
        zzav().zzg();
        if (this.zzp == null) {
            this.zzp = new ArrayList();
        }
        this.zzp.add(runnable);
    }

    final void zzG() {
        zzav().zzg();
        zzr();
        if (this.zzo) {
            return;
        }
        this.zzo = true;
        if (zzH()) {
            FileChannel fileChannel = this.zzw;
            zzav().zzg();
            int i = 0;
            if (fileChannel == null || !fileChannel.isOpen()) {
                zzau().zzb().zza("Bad channel to read from");
            } else {
                ByteBuffer byteBufferAllocate = ByteBuffer.allocate(4);
                try {
                    fileChannel.position(0L);
                    int i2 = fileChannel.read(byteBufferAllocate);
                    if (i2 == 4) {
                        byteBufferAllocate.flip();
                        i = byteBufferAllocate.getInt();
                    } else if (i2 != -1) {
                        zzau().zze().zzb("Unexpected data length. Bytes read", Integer.valueOf(i2));
                    }
                } catch (IOException e) {
                    zzau().zzb().zzb("Failed to read from channel", e);
                }
            }
            int iZzm = this.zzm.zzA().zzm();
            zzav().zzg();
            if (i > iZzm) {
                zzau().zzb().zzc("Panic: can't downgrade version. Previous, current version", Integer.valueOf(i), Integer.valueOf(iZzm));
                return;
            }
            if (i < iZzm) {
                FileChannel fileChannel2 = this.zzw;
                zzav().zzg();
                if (fileChannel2 == null || !fileChannel2.isOpen()) {
                    zzau().zzb().zza("Bad channel to read from");
                } else {
                    ByteBuffer byteBufferAllocate2 = ByteBuffer.allocate(4);
                    byteBufferAllocate2.putInt(iZzm);
                    byteBufferAllocate2.flip();
                    try {
                        fileChannel2.truncate(0L);
                        zzd().zzn(null, zzea.zzap);
                        fileChannel2.write(byteBufferAllocate2);
                        fileChannel2.force(true);
                        if (fileChannel2.size() != 4) {
                            zzau().zzb().zzb("Error writing to channel. Bytes written", Long.valueOf(fileChannel2.size()));
                        }
                        zzau().zzk().zzc("Storage version upgraded. Previous, current version", Integer.valueOf(i), Integer.valueOf(iZzm));
                        return;
                    } catch (IOException e2) {
                        zzau().zzb().zzb("Failed to write to channel", e2);
                    }
                }
                zzau().zzb().zzc("Storage version upgrade failed. Previous, current version", Integer.valueOf(i), Integer.valueOf(iZzm));
            }
        }
    }

    final boolean zzH() {
        FileLock fileLock;
        zzav().zzg();
        if (zzd().zzn(null, zzea.zzaf) && (fileLock = this.zzv) != null && fileLock.isValid()) {
            zzau().zzk().zza("Storage concurrent access okay");
            return true;
        }
        this.zze.zzs.zzc();
        try {
            FileChannel channel = new RandomAccessFile(new File(this.zzm.zzax().getFilesDir(), "google_app_measurement.db"), "rw").getChannel();
            this.zzw = channel;
            FileLock fileLockTryLock = channel.tryLock();
            this.zzv = fileLockTryLock;
            if (fileLockTryLock != null) {
                zzau().zzk().zza("Storage concurrent access okay");
                return true;
            }
            zzau().zzb().zza("Storage concurrent data access panic");
            return false;
        } catch (FileNotFoundException e) {
            zzau().zzb().zzb("Failed to acquire storage lock", e);
            return false;
        } catch (IOException e2) {
            zzau().zzb().zzb("Failed to access storage lock file", e2);
            return false;
        } catch (OverlappingFileLockException e3) {
            zzau().zze().zzb("Storage lock already acquired", e3);
            return false;
        }
    }

    final void zzI(zzp zzpVar) {
        if (this.zzx != null) {
            ArrayList arrayList = new ArrayList();
            this.zzy = arrayList;
            arrayList.addAll(this.zzx);
        }
        zzai zzaiVar = this.zze;
        zzak(zzaiVar);
        String str = (String) Preconditions.checkNotNull(zzpVar.zza);
        Preconditions.checkNotEmpty(str);
        zzaiVar.zzg();
        zzaiVar.zzZ();
        try {
            SQLiteDatabase sQLiteDatabaseZze = zzaiVar.zze();
            String[] strArr = {str};
            int iDelete = sQLiteDatabaseZze.delete("apps", "app_id=?", strArr) + sQLiteDatabaseZze.delete("events", "app_id=?", strArr) + sQLiteDatabaseZze.delete("user_attributes", "app_id=?", strArr) + sQLiteDatabaseZze.delete("conditional_properties", "app_id=?", strArr) + sQLiteDatabaseZze.delete("raw_events", "app_id=?", strArr) + sQLiteDatabaseZze.delete("raw_events_metadata", "app_id=?", strArr) + sQLiteDatabaseZze.delete("queue", "app_id=?", strArr) + sQLiteDatabaseZze.delete("audience_filter_values", "app_id=?", strArr) + sQLiteDatabaseZze.delete("main_event_params", "app_id=?", strArr) + sQLiteDatabaseZze.delete("default_event_params", "app_id=?", strArr);
            if (iDelete > 0) {
                zzaiVar.zzs.zzau().zzk().zzc("Reset analytics data. app, records", str, Integer.valueOf(iDelete));
            }
        } catch (SQLiteException e) {
            zzaiVar.zzs.zzau().zzb().zzc("Error resetting analytics data. appId, error", zzem.zzl(str), e);
        }
        if (zzpVar.zzh) {
            zzO(zzpVar);
        }
    }

    /* JADX WARN: Removed duplicated region for block: B:39:0x00f2  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    final void zzJ(com.google.android.gms.measurement.internal.zzkq r19, com.google.android.gms.measurement.internal.zzp r20) {
        /*
            Method dump skipped, instruction units count: 470
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzkn.zzJ(com.google.android.gms.measurement.internal.zzkq, com.google.android.gms.measurement.internal.zzp):void");
    }

    final void zzK(zzkq zzkqVar, zzp zzpVar) {
        zzav().zzg();
        zzr();
        if (zzaj(zzpVar)) {
            if (!zzpVar.zzh) {
                zzT(zzpVar);
                return;
            }
            if ("_npa".equals(zzkqVar.zzb) && zzpVar.zzr != null) {
                zzau().zzj().zza("Falling back to manifest metadata value for ad personalization");
                zzJ(new zzkq("_npa", zzay().currentTimeMillis(), Long.valueOf(true != zzpVar.zzr.booleanValue() ? 0L : 1L), DebugKt.DEBUG_PROPERTY_VALUE_AUTO), zzpVar);
                return;
            }
            zzau().zzj().zzb("Removing user property", this.zzm.zzm().zze(zzkqVar.zzb));
            zzai zzaiVar = this.zze;
            zzak(zzaiVar);
            zzaiVar.zzb();
            try {
                zzT(zzpVar);
                zzai zzaiVar2 = this.zze;
                zzak(zzaiVar2);
                zzaiVar2.zzi((String) Preconditions.checkNotNull(zzpVar.zza), zzkqVar.zzb);
                zzai zzaiVar3 = this.zze;
                zzak(zzaiVar3);
                zzaiVar3.zzc();
                zzau().zzj().zzb("User property removed", this.zzm.zzm().zze(zzkqVar.zzb));
            } finally {
                zzai zzaiVar4 = this.zze;
                zzak(zzaiVar4);
                zzaiVar4.zzd();
            }
        }
    }

    final void zzL() {
        this.zzq++;
    }

    final void zzM() {
        this.zzr++;
    }

    final zzfu zzN() {
        return this.zzm;
    }

    /* JADX WARN: Removed duplicated region for block: B:135:0x03ee A[Catch: all -> 0x05c7, TryCatch #0 {all -> 0x05c7, blocks: (B:25:0x00a8, B:27:0x00b7, B:45:0x011b, B:47:0x012e, B:49:0x0144, B:50:0x016b, B:52:0x01ba, B:56:0x01d2, B:59:0x01ea, B:61:0x01f5, B:66:0x0206, B:69:0x0214, B:73:0x021f, B:75:0x0222, B:77:0x0243, B:79:0x0248, B:82:0x0267, B:85:0x027b, B:87:0x02a5, B:132:0x03ad, B:133:0x03bc, B:135:0x03ee, B:136:0x03f1, B:138:0x041a, B:178:0x0502, B:179:0x0505, B:184:0x0567, B:186:0x0575, B:190:0x05b6, B:140:0x042f, B:145:0x0458, B:147:0x0460, B:149:0x046c, B:153:0x047f, B:157:0x0492, B:161:0x049e, B:165:0x04c0, B:170:0x04e5, B:172:0x04ea, B:173:0x04f1, B:175:0x04f7, B:168:0x04d1, B:155:0x0488, B:143:0x0442, B:90:0x02ae, B:92:0x02bd, B:93:0x02cf, B:95:0x02fc, B:96:0x030e, B:98:0x0316, B:100:0x031c, B:102:0x0326, B:104:0x0330, B:106:0x0336, B:108:0x033c, B:109:0x0341, B:111:0x034c, B:116:0x0366, B:122:0x036e, B:126:0x0387, B:130:0x039c, B:180:0x051c, B:182:0x0550, B:183:0x0553, B:187:0x0599, B:189:0x059d, B:80:0x0257, B:31:0x00c8, B:33:0x00cc, B:37:0x00db, B:39:0x00f6, B:41:0x0100, B:44:0x010b), top: B:197:0x00a8, inners: #1, #2, #3 }] */
    /* JADX WARN: Removed duplicated region for block: B:138:0x041a A[Catch: all -> 0x05c7, TRY_LEAVE, TryCatch #0 {all -> 0x05c7, blocks: (B:25:0x00a8, B:27:0x00b7, B:45:0x011b, B:47:0x012e, B:49:0x0144, B:50:0x016b, B:52:0x01ba, B:56:0x01d2, B:59:0x01ea, B:61:0x01f5, B:66:0x0206, B:69:0x0214, B:73:0x021f, B:75:0x0222, B:77:0x0243, B:79:0x0248, B:82:0x0267, B:85:0x027b, B:87:0x02a5, B:132:0x03ad, B:133:0x03bc, B:135:0x03ee, B:136:0x03f1, B:138:0x041a, B:178:0x0502, B:179:0x0505, B:184:0x0567, B:186:0x0575, B:190:0x05b6, B:140:0x042f, B:145:0x0458, B:147:0x0460, B:149:0x046c, B:153:0x047f, B:157:0x0492, B:161:0x049e, B:165:0x04c0, B:170:0x04e5, B:172:0x04ea, B:173:0x04f1, B:175:0x04f7, B:168:0x04d1, B:155:0x0488, B:143:0x0442, B:90:0x02ae, B:92:0x02bd, B:93:0x02cf, B:95:0x02fc, B:96:0x030e, B:98:0x0316, B:100:0x031c, B:102:0x0326, B:104:0x0330, B:106:0x0336, B:108:0x033c, B:109:0x0341, B:111:0x034c, B:116:0x0366, B:122:0x036e, B:126:0x0387, B:130:0x039c, B:180:0x051c, B:182:0x0550, B:183:0x0553, B:187:0x0599, B:189:0x059d, B:80:0x0257, B:31:0x00c8, B:33:0x00cc, B:37:0x00db, B:39:0x00f6, B:41:0x0100, B:44:0x010b), top: B:197:0x00a8, inners: #1, #2, #3 }] */
    /* JADX WARN: Removed duplicated region for block: B:178:0x0502 A[Catch: all -> 0x05c7, TryCatch #0 {all -> 0x05c7, blocks: (B:25:0x00a8, B:27:0x00b7, B:45:0x011b, B:47:0x012e, B:49:0x0144, B:50:0x016b, B:52:0x01ba, B:56:0x01d2, B:59:0x01ea, B:61:0x01f5, B:66:0x0206, B:69:0x0214, B:73:0x021f, B:75:0x0222, B:77:0x0243, B:79:0x0248, B:82:0x0267, B:85:0x027b, B:87:0x02a5, B:132:0x03ad, B:133:0x03bc, B:135:0x03ee, B:136:0x03f1, B:138:0x041a, B:178:0x0502, B:179:0x0505, B:184:0x0567, B:186:0x0575, B:190:0x05b6, B:140:0x042f, B:145:0x0458, B:147:0x0460, B:149:0x046c, B:153:0x047f, B:157:0x0492, B:161:0x049e, B:165:0x04c0, B:170:0x04e5, B:172:0x04ea, B:173:0x04f1, B:175:0x04f7, B:168:0x04d1, B:155:0x0488, B:143:0x0442, B:90:0x02ae, B:92:0x02bd, B:93:0x02cf, B:95:0x02fc, B:96:0x030e, B:98:0x0316, B:100:0x031c, B:102:0x0326, B:104:0x0330, B:106:0x0336, B:108:0x033c, B:109:0x0341, B:111:0x034c, B:116:0x0366, B:122:0x036e, B:126:0x0387, B:130:0x039c, B:180:0x051c, B:182:0x0550, B:183:0x0553, B:187:0x0599, B:189:0x059d, B:80:0x0257, B:31:0x00c8, B:33:0x00cc, B:37:0x00db, B:39:0x00f6, B:41:0x0100, B:44:0x010b), top: B:197:0x00a8, inners: #1, #2, #3 }] */
    /* JADX WARN: Removed duplicated region for block: B:199:0x042f A[EXC_TOP_SPLITTER, SYNTHETIC] */
    /* JADX WARN: Removed duplicated region for block: B:72:0x021e  */
    /* JADX WARN: Removed duplicated region for block: B:75:0x0222 A[Catch: all -> 0x05c7, TryCatch #0 {all -> 0x05c7, blocks: (B:25:0x00a8, B:27:0x00b7, B:45:0x011b, B:47:0x012e, B:49:0x0144, B:50:0x016b, B:52:0x01ba, B:56:0x01d2, B:59:0x01ea, B:61:0x01f5, B:66:0x0206, B:69:0x0214, B:73:0x021f, B:75:0x0222, B:77:0x0243, B:79:0x0248, B:82:0x0267, B:85:0x027b, B:87:0x02a5, B:132:0x03ad, B:133:0x03bc, B:135:0x03ee, B:136:0x03f1, B:138:0x041a, B:178:0x0502, B:179:0x0505, B:184:0x0567, B:186:0x0575, B:190:0x05b6, B:140:0x042f, B:145:0x0458, B:147:0x0460, B:149:0x046c, B:153:0x047f, B:157:0x0492, B:161:0x049e, B:165:0x04c0, B:170:0x04e5, B:172:0x04ea, B:173:0x04f1, B:175:0x04f7, B:168:0x04d1, B:155:0x0488, B:143:0x0442, B:90:0x02ae, B:92:0x02bd, B:93:0x02cf, B:95:0x02fc, B:96:0x030e, B:98:0x0316, B:100:0x031c, B:102:0x0326, B:104:0x0330, B:106:0x0336, B:108:0x033c, B:109:0x0341, B:111:0x034c, B:116:0x0366, B:122:0x036e, B:126:0x0387, B:130:0x039c, B:180:0x051c, B:182:0x0550, B:183:0x0553, B:187:0x0599, B:189:0x059d, B:80:0x0257, B:31:0x00c8, B:33:0x00cc, B:37:0x00db, B:39:0x00f6, B:41:0x0100, B:44:0x010b), top: B:197:0x00a8, inners: #1, #2, #3 }] */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    final void zzO(com.google.android.gms.measurement.internal.zzp r24) {
        /*
            Method dump skipped, instruction units count: 1490
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzkn.zzO(com.google.android.gms.measurement.internal.zzp):void");
    }

    final void zzP(zzaa zzaaVar) {
        zzp zzpVarZzai = zzai((String) Preconditions.checkNotNull(zzaaVar.zza));
        if (zzpVarZzai != null) {
            zzQ(zzaaVar, zzpVarZzai);
        }
    }

    final void zzQ(zzaa zzaaVar, zzp zzpVar) {
        zzas zzasVar;
        Preconditions.checkNotNull(zzaaVar);
        Preconditions.checkNotEmpty(zzaaVar.zza);
        Preconditions.checkNotNull(zzaaVar.zzb);
        Preconditions.checkNotNull(zzaaVar.zzc);
        Preconditions.checkNotEmpty(zzaaVar.zzc.zzb);
        zzav().zzg();
        zzr();
        if (zzaj(zzpVar)) {
            if (!zzpVar.zzh) {
                zzT(zzpVar);
                return;
            }
            zzaa zzaaVar2 = new zzaa(zzaaVar);
            boolean z = false;
            zzaaVar2.zze = false;
            zzai zzaiVar = this.zze;
            zzak(zzaiVar);
            zzaiVar.zzb();
            try {
                zzai zzaiVar2 = this.zze;
                zzak(zzaiVar2);
                zzaa zzaaVarZzo = zzaiVar2.zzo((String) Preconditions.checkNotNull(zzaaVar2.zza), zzaaVar2.zzc.zzb);
                if (zzaaVarZzo != null && !zzaaVarZzo.zzb.equals(zzaaVar2.zzb)) {
                    zzau().zze().zzd("Updating a conditional user property with different origin. name, origin, origin (from DB)", this.zzm.zzm().zze(zzaaVar2.zzc.zzb), zzaaVar2.zzb, zzaaVarZzo.zzb);
                }
                if (zzaaVarZzo != null && zzaaVarZzo.zze) {
                    zzaaVar2.zzb = zzaaVarZzo.zzb;
                    zzaaVar2.zzd = zzaaVarZzo.zzd;
                    zzaaVar2.zzh = zzaaVarZzo.zzh;
                    zzaaVar2.zzf = zzaaVarZzo.zzf;
                    zzaaVar2.zzi = zzaaVarZzo.zzi;
                    zzaaVar2.zze = true;
                    zzkq zzkqVar = zzaaVar2.zzc;
                    zzaaVar2.zzc = new zzkq(zzkqVar.zzb, zzaaVarZzo.zzc.zzc, zzkqVar.zza(), zzaaVarZzo.zzc.zzf);
                } else if (TextUtils.isEmpty(zzaaVar2.zzf)) {
                    zzkq zzkqVar2 = zzaaVar2.zzc;
                    zzaaVar2.zzc = new zzkq(zzkqVar2.zzb, zzaaVar2.zzd, zzkqVar2.zza(), zzaaVar2.zzc.zzf);
                    zzaaVar2.zze = true;
                    z = true;
                }
                if (zzaaVar2.zze) {
                    zzkq zzkqVar3 = zzaaVar2.zzc;
                    zzks zzksVar = new zzks((String) Preconditions.checkNotNull(zzaaVar2.zza), zzaaVar2.zzb, zzkqVar3.zzb, zzkqVar3.zzc, Preconditions.checkNotNull(zzkqVar3.zza()));
                    zzai zzaiVar3 = this.zze;
                    zzak(zzaiVar3);
                    if (zzaiVar3.zzj(zzksVar)) {
                        zzau().zzj().zzd("User property updated immediately", zzaaVar2.zza, this.zzm.zzm().zze(zzksVar.zzc), zzksVar.zze);
                    } else {
                        zzau().zzb().zzd("(2)Too many active user properties, ignoring", zzem.zzl(zzaaVar2.zza), this.zzm.zzm().zze(zzksVar.zzc), zzksVar.zze);
                    }
                    if (z && (zzasVar = zzaaVar2.zzi) != null) {
                        zzz(new zzas(zzasVar, zzaaVar2.zzd), zzpVar);
                    }
                }
                zzai zzaiVar4 = this.zze;
                zzak(zzaiVar4);
                if (zzaiVar4.zzn(zzaaVar2)) {
                    zzau().zzj().zzd("Conditional property added", zzaaVar2.zza, this.zzm.zzm().zze(zzaaVar2.zzc.zzb), zzaaVar2.zzc.zza());
                } else {
                    zzau().zzb().zzd("Too many conditional properties, ignoring", zzem.zzl(zzaaVar2.zza), this.zzm.zzm().zze(zzaaVar2.zzc.zzb), zzaaVar2.zzc.zza());
                }
                zzai zzaiVar5 = this.zze;
                zzak(zzaiVar5);
                zzaiVar5.zzc();
            } finally {
                zzai zzaiVar6 = this.zze;
                zzak(zzaiVar6);
                zzaiVar6.zzd();
            }
        }
    }

    final void zzR(zzaa zzaaVar) {
        zzp zzpVarZzai = zzai((String) Preconditions.checkNotNull(zzaaVar.zza));
        if (zzpVarZzai != null) {
            zzS(zzaaVar, zzpVarZzai);
        }
    }

    final void zzS(zzaa zzaaVar, zzp zzpVar) {
        Preconditions.checkNotNull(zzaaVar);
        Preconditions.checkNotEmpty(zzaaVar.zza);
        Preconditions.checkNotNull(zzaaVar.zzc);
        Preconditions.checkNotEmpty(zzaaVar.zzc.zzb);
        zzav().zzg();
        zzr();
        if (zzaj(zzpVar)) {
            if (!zzpVar.zzh) {
                zzT(zzpVar);
                return;
            }
            zzai zzaiVar = this.zze;
            zzak(zzaiVar);
            zzaiVar.zzb();
            try {
                zzT(zzpVar);
                String str = (String) Preconditions.checkNotNull(zzaaVar.zza);
                zzai zzaiVar2 = this.zze;
                zzak(zzaiVar2);
                zzaa zzaaVarZzo = zzaiVar2.zzo(str, zzaaVar.zzc.zzb);
                if (zzaaVarZzo != null) {
                    zzau().zzj().zzc("Removing conditional user property", zzaaVar.zza, this.zzm.zzm().zze(zzaaVar.zzc.zzb));
                    zzai zzaiVar3 = this.zze;
                    zzak(zzaiVar3);
                    zzaiVar3.zzp(str, zzaaVar.zzc.zzb);
                    if (zzaaVarZzo.zze) {
                        zzai zzaiVar4 = this.zze;
                        zzak(zzaiVar4);
                        zzaiVar4.zzi(str, zzaaVar.zzc.zzb);
                    }
                    zzas zzasVar = zzaaVar.zzk;
                    if (zzasVar != null) {
                        zzaq zzaqVar = zzasVar.zzb;
                        zzz((zzas) Preconditions.checkNotNull(zzq().zzV(str, ((zzas) Preconditions.checkNotNull(zzaaVar.zzk)).zza, zzaqVar != null ? zzaqVar.zzf() : null, zzaaVarZzo.zzb, zzaaVar.zzk.zzd, true, false)), zzpVar);
                    }
                } else {
                    zzau().zze().zzc("Conditional user property doesn't exist", zzem.zzl(zzaaVar.zza), this.zzm.zzm().zze(zzaaVar.zzc.zzb));
                }
                zzai zzaiVar5 = this.zze;
                zzak(zzaiVar5);
                zzaiVar5.zzc();
            } finally {
                zzai zzaiVar6 = this.zze;
                zzak(zzaiVar6);
                zzaiVar6.zzd();
            }
        }
    }

    final zzg zzT(zzp zzpVar) {
        boolean z;
        zzav().zzg();
        zzr();
        Preconditions.checkNotNull(zzpVar);
        Preconditions.checkNotEmpty(zzpVar.zza);
        zzai zzaiVar = this.zze;
        zzak(zzaiVar);
        zzg zzgVarZzs = zzaiVar.zzs(zzpVar.zza);
        zzaf zzafVarZzk = zzt(zzpVar.zza).zzk(zzaf.zzc(zzpVar.zzv));
        String strZzf = zzafVarZzk.zzf() ? this.zzk.zzf(zzpVar.zza) : "";
        zzoj.zzb();
        if (zzd().zzn(null, zzea.zzal)) {
            if (zzgVarZzs == null) {
                zzgVarZzs = new zzg(this.zzm, zzpVar.zza);
                if (zzafVarZzk.zzh()) {
                    zzgVarZzs.zze(zzA(zzafVarZzk));
                }
                if (zzafVarZzk.zzf()) {
                    zzgVarZzs.zzm(strZzf);
                }
            } else if (zzafVarZzk.zzf() && strZzf != null && !strZzf.equals(zzgVarZzs.zzl())) {
                zzgVarZzs.zzm(strZzf);
                zzgVarZzs.zze(zzA(zzafVarZzk));
            } else if (TextUtils.isEmpty(zzgVarZzs.zzd()) && zzafVarZzk.zzh()) {
                zzgVarZzs.zze(zzA(zzafVarZzk));
            }
            zzgVarZzs.zzg(zzpVar.zzb);
            zzgVarZzs.zzi(zzpVar.zzq);
            zzov.zzb();
            if (zzd().zzn(zzgVarZzs.zzc(), zzea.zzag)) {
                zzgVarZzs.zzk(zzpVar.zzu);
            }
            if (!TextUtils.isEmpty(zzpVar.zzk)) {
                zzgVarZzs.zzo(zzpVar.zzk);
            }
            long j = zzpVar.zze;
            if (j != 0) {
                zzgVarZzs.zzA(j);
            }
            if (!TextUtils.isEmpty(zzpVar.zzc)) {
                zzgVarZzs.zzu(zzpVar.zzc);
            }
            zzgVarZzs.zzw(zzpVar.zzj);
            String str = zzpVar.zzd;
            if (str != null) {
                zzgVarZzs.zzy(str);
            }
            zzgVarZzs.zzC(zzpVar.zzf);
            zzgVarZzs.zzG(zzpVar.zzh);
            if (!TextUtils.isEmpty(zzpVar.zzg)) {
                zzgVarZzs.zzac(zzpVar.zzg);
            }
            if (!zzd().zzn(null, zzea.zzat)) {
                zzgVarZzs.zzae(zzpVar.zzl);
            }
            zzgVarZzs.zzag(zzpVar.zzo);
            zzgVarZzs.zzai(zzpVar.zzr);
            zzgVarZzs.zzE(zzpVar.zzs);
            if (zzgVarZzs.zza()) {
                zzai zzaiVar2 = this.zze;
                zzak(zzaiVar2);
                zzaiVar2.zzt(zzgVarZzs);
            }
            return zzgVarZzs;
        }
        String str2 = (String) Preconditions.checkNotNull(zzpVar.zza);
        zzaf zzafVarZzk2 = zzt(str2).zzk(zzaf.zzc(zzpVar.zzv));
        boolean z2 = true;
        if (zzgVarZzs == null) {
            zzgVarZzs = new zzg(this.zzm, str2);
            if (zzafVarZzk2.zzh()) {
                zzgVarZzs.zze(zzA(zzafVarZzk2));
            }
            if (zzafVarZzk2.zzf()) {
                zzgVarZzs.zzm(strZzf);
                z = true;
            } else {
                z = true;
            }
        } else if (!zzafVarZzk2.zzf() || strZzf == null || strZzf.equals(zzgVarZzs.zzl())) {
            z = false;
            if (TextUtils.isEmpty(zzgVarZzs.zzd()) && zzafVarZzk2.zzh()) {
                zzgVarZzs.zze(zzA(zzafVarZzk2));
                z = true;
            }
        } else {
            zzgVarZzs.zzm(strZzf);
            if (zzafVarZzk2.zzh()) {
                zzgVarZzs.zze(zzA(zzafVarZzk2));
            }
            z = true;
        }
        if (!TextUtils.equals(zzpVar.zzb, zzgVarZzs.zzf())) {
            zzgVarZzs.zzg(zzpVar.zzb);
            z = true;
        }
        if (!TextUtils.equals(zzpVar.zzq, zzgVarZzs.zzh())) {
            zzgVarZzs.zzi(zzpVar.zzq);
            z = true;
        }
        zzov.zzb();
        if (zzd().zzn(zzgVarZzs.zzc(), zzea.zzag) && !TextUtils.equals(zzpVar.zzu, zzgVarZzs.zzj())) {
            zzgVarZzs.zzk(zzpVar.zzu);
            z = true;
        }
        if (!TextUtils.isEmpty(zzpVar.zzk) && !zzpVar.zzk.equals(zzgVarZzs.zzn())) {
            zzgVarZzs.zzo(zzpVar.zzk);
            z = true;
        }
        long j2 = zzpVar.zze;
        if (j2 != 0 && j2 != zzgVarZzs.zzz()) {
            zzgVarZzs.zzA(zzpVar.zze);
            z = true;
        }
        if (!TextUtils.isEmpty(zzpVar.zzc) && !zzpVar.zzc.equals(zzgVarZzs.zzt())) {
            zzgVarZzs.zzu(zzpVar.zzc);
            z = true;
        }
        if (zzpVar.zzj != zzgVarZzs.zzv()) {
            zzgVarZzs.zzw(zzpVar.zzj);
            z = true;
        }
        String str3 = zzpVar.zzd;
        if (str3 != null && !str3.equals(zzgVarZzs.zzx())) {
            zzgVarZzs.zzy(zzpVar.zzd);
            z = true;
        }
        if (zzpVar.zzf != zzgVarZzs.zzB()) {
            zzgVarZzs.zzC(zzpVar.zzf);
            z = true;
        }
        if (zzpVar.zzh != zzgVarZzs.zzF()) {
            zzgVarZzs.zzG(zzpVar.zzh);
            z = true;
        }
        if (!TextUtils.isEmpty(zzpVar.zzg) && !zzpVar.zzg.equals(zzgVarZzs.zzaa())) {
            zzgVarZzs.zzac(zzpVar.zzg);
            z = true;
        }
        if (!zzd().zzn(null, zzea.zzat) && zzpVar.zzl != zzgVarZzs.zzad()) {
            zzgVarZzs.zzae(zzpVar.zzl);
            z = true;
        }
        if (zzpVar.zzo != zzgVarZzs.zzaf()) {
            zzgVarZzs.zzag(zzpVar.zzo);
            z = true;
        }
        if (zzpVar.zzr != zzgVarZzs.zzah()) {
            zzgVarZzs.zzai(zzpVar.zzr);
        } else {
            z2 = z;
        }
        long j3 = zzpVar.zzs;
        if (j3 == 0 || j3 == zzgVarZzs.zzD()) {
            if (z2) {
            }
            return zzgVarZzs;
        }
        zzgVarZzs.zzE(zzpVar.zzs);
        zzai zzaiVar3 = this.zze;
        zzak(zzaiVar3);
        zzaiVar3.zzt(zzgVarZzs);
        return zzgVarZzs;
    }

    final String zzU(zzp zzpVar) {
        try {
            return (String) zzav().zze(new zzkj(this, zzpVar)).get(30000L, TimeUnit.MILLISECONDS);
        } catch (InterruptedException | ExecutionException | TimeoutException e) {
            zzau().zzb().zzc("Failed to get app instance id. appId", zzem.zzl(zzpVar.zza), e);
            return null;
        }
    }

    final void zzV(boolean z) {
        zzaf();
    }

    @Override // com.google.android.gms.measurement.internal.zzgp
    public final zzz zzat() {
        throw null;
    }

    @Override // com.google.android.gms.measurement.internal.zzgp
    public final zzem zzau() {
        return ((zzfu) Preconditions.checkNotNull(this.zzm)).zzau();
    }

    @Override // com.google.android.gms.measurement.internal.zzgp
    public final zzfr zzav() {
        return ((zzfu) Preconditions.checkNotNull(this.zzm)).zzav();
    }

    @Override // com.google.android.gms.measurement.internal.zzgp
    public final Context zzax() {
        return this.zzm.zzax();
    }

    @Override // com.google.android.gms.measurement.internal.zzgp
    public final Clock zzay() {
        return ((zzfu) Preconditions.checkNotNull(this.zzm)).zzay();
    }

    protected final void zzc() {
        zzav().zzg();
        zzai zzaiVar = this.zze;
        zzak(zzaiVar);
        zzaiVar.zzA();
        if (this.zzk.zzc.zza() == 0) {
            this.zzk.zzc.zzb(zzay().currentTimeMillis());
        }
        zzaf();
    }

    public final zzae zzd() {
        return ((zzfu) Preconditions.checkNotNull(this.zzm)).zzc();
    }

    public final zzfl zzf() {
        zzfl zzflVar = this.zzc;
        zzak(zzflVar);
        return zzflVar;
    }

    public final zzes zzh() {
        zzes zzesVar = this.zzd;
        zzak(zzesVar);
        return zzesVar;
    }

    public final zzai zzi() {
        zzai zzaiVar = this.zze;
        zzak(zzaiVar);
        return zzaiVar;
    }

    public final zzeu zzj() {
        zzeu zzeuVar = this.zzf;
        if (zzeuVar != null) {
            return zzeuVar;
        }
        throw new IllegalStateException("Network broadcast receiver not created");
    }

    public final zzy zzk() {
        zzy zzyVar = this.zzh;
        zzak(zzyVar);
        return zzyVar;
    }

    public final zzib zzl() {
        zzib zzibVar = this.zzj;
        zzak(zzibVar);
        return zzibVar;
    }

    public final zzkp zzm() {
        zzkp zzkpVar = this.zzi;
        zzak(zzkpVar);
        return zzkpVar;
    }

    public final zzjl zzn() {
        return this.zzk;
    }

    public final zzeh zzo() {
        return this.zzm.zzm();
    }

    public final zzku zzq() {
        return ((zzfu) Preconditions.checkNotNull(this.zzm)).zzl();
    }

    final void zzr() {
        if (!this.zzn) {
            throw new IllegalStateException("UploadController is not initialized");
        }
    }

    final void zzs(String str, zzaf zzafVar) {
        zzav().zzg();
        zzr();
        this.zzA.put(str, zzafVar);
        zzai zzaiVar = this.zze;
        zzak(zzaiVar);
        Preconditions.checkNotNull(str);
        Preconditions.checkNotNull(zzafVar);
        zzaiVar.zzg();
        zzaiVar.zzZ();
        ContentValues contentValues = new ContentValues();
        contentValues.put("app_id", str);
        contentValues.put("consent_state", zzafVar.zzd());
        try {
            if (zzaiVar.zze().insertWithOnConflict("consent_settings", null, contentValues, 5) == -1) {
                zzaiVar.zzs.zzau().zzb().zzb("Failed to insert/update consent setting (got -1). appId", zzem.zzl(str));
            }
        } catch (SQLiteException e) {
            zzaiVar.zzs.zzau().zzb().zzc("Error storing consent setting. appId, error", zzem.zzl(str), e);
        }
    }

    /* JADX WARN: Removed duplicated region for block: B:26:0x006b  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    final com.google.android.gms.measurement.internal.zzaf zzt(java.lang.String r6) throws java.lang.Throwable {
        /*
            r5 = this;
            com.google.android.gms.measurement.internal.zzfr r0 = r5.zzav()
            r0.zzg()
            r5.zzr()
            java.util.Map<java.lang.String, com.google.android.gms.measurement.internal.zzaf> r0 = r5.zzA
            java.lang.Object r0 = r0.get(r6)
            com.google.android.gms.measurement.internal.zzaf r0 = (com.google.android.gms.measurement.internal.zzaf) r0
            if (r0 != 0) goto L6f
            com.google.android.gms.measurement.internal.zzai r0 = r5.zze
            zzak(r0)
            com.google.android.gms.common.internal.Preconditions.checkNotNull(r6)
            r0.zzg()
            r0.zzZ()
            java.lang.String[] r1 = new java.lang.String[]{r6}
            android.database.sqlite.SQLiteDatabase r2 = r0.zze()
            java.lang.String r3 = "select consent_state from consent_settings where app_id=? limit 1;"
            r4 = 0
            android.database.Cursor r4 = r2.rawQuery(r3, r1)     // Catch: java.lang.Throwable -> L56 android.database.sqlite.SQLiteException -> L58
            boolean r1 = r4.moveToFirst()     // Catch: java.lang.Throwable -> L52 android.database.sqlite.SQLiteException -> L54
            if (r1 == 0) goto L43
            r1 = 0
            java.lang.String r0 = r4.getString(r1)     // Catch: java.lang.Throwable -> L52 android.database.sqlite.SQLiteException -> L54
            if (r4 == 0) goto L42
            r4.close()
            goto L4a
        L42:
            goto L4a
        L43:
            if (r4 == 0) goto L48
            r4.close()
        L48:
            java.lang.String r0 = "G1"
        L4a:
            com.google.android.gms.measurement.internal.zzaf r0 = com.google.android.gms.measurement.internal.zzaf.zzc(r0)
            r5.zzs(r6, r0)
            goto L70
        L52:
            r6 = move-exception
            goto L69
        L54:
            r6 = move-exception
            goto L59
        L56:
            r6 = move-exception
            goto L69
        L58:
            r6 = move-exception
        L59:
            com.google.android.gms.measurement.internal.zzfu r0 = r0.zzs     // Catch: java.lang.Throwable -> L52
            com.google.android.gms.measurement.internal.zzem r0 = r0.zzau()     // Catch: java.lang.Throwable -> L52
            com.google.android.gms.measurement.internal.zzek r0 = r0.zzb()     // Catch: java.lang.Throwable -> L52
            java.lang.String r1 = "Database error"
            r0.zzc(r1, r3, r6)     // Catch: java.lang.Throwable -> L52
            throw r6     // Catch: java.lang.Throwable -> L52
        L69:
            if (r4 == 0) goto L6e
            r4.close()
        L6e:
            throw r6
        L6f:
        L70:
            return r0
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzkn.zzt(java.lang.String):com.google.android.gms.measurement.internal.zzaf");
    }

    final long zzu() {
        long jCurrentTimeMillis = zzay().currentTimeMillis();
        zzjl zzjlVar = this.zzk;
        zzjlVar.zzZ();
        zzjlVar.zzg();
        long jZza = zzjlVar.zze.zza();
        if (jZza == 0) {
            jZza = ((long) zzjlVar.zzs.zzl().zzf().nextInt(86400000)) + 1;
            zzjlVar.zze.zzb(jZza);
        }
        return ((((jCurrentTimeMillis + jZza) / 1000) / 60) / 60) / 24;
    }

    final void zzv(zzas zzasVar, String str) {
        zzai zzaiVar = this.zze;
        zzak(zzaiVar);
        zzg zzgVarZzs = zzaiVar.zzs(str);
        if (zzgVarZzs == null || TextUtils.isEmpty(zzgVarZzs.zzt())) {
            zzau().zzj().zzb("No app data available; dropping event", str);
            return;
        }
        Boolean boolZzah = zzah(zzgVarZzs);
        if (boolZzah == null) {
            if (!"_ui".equals(zzasVar.zza)) {
                zzau().zze().zzb("Could not find package. appId", zzem.zzl(str));
            }
        } else if (!boolZzah.booleanValue()) {
            zzau().zzb().zzb("App version does not match; dropping event. appId", zzem.zzl(str));
            return;
        }
        String strZzf = zzgVarZzs.zzf();
        String strZzt = zzgVarZzs.zzt();
        long jZzv = zzgVarZzs.zzv();
        String strZzx = zzgVarZzs.zzx();
        long jZzz = zzgVarZzs.zzz();
        long jZzB = zzgVarZzs.zzB();
        boolean zZzF = zzgVarZzs.zzF();
        String strZzn = zzgVarZzs.zzn();
        long jZzad = zzgVarZzs.zzad();
        boolean zZzaf = zzgVarZzs.zzaf();
        String strZzh = zzgVarZzs.zzh();
        Boolean boolZzah2 = zzgVarZzs.zzah();
        long jZzD = zzgVarZzs.zzD();
        List<String> listZzaj = zzgVarZzs.zzaj();
        zzov.zzb();
        zzx(zzasVar, new zzp(str, strZzf, strZzt, jZzv, strZzx, jZzz, jZzB, (String) null, zZzF, false, strZzn, jZzad, 0L, 0, zZzaf, false, strZzh, boolZzah2, jZzD, listZzaj, zzd().zzn(zzgVarZzs.zzc(), zzea.zzag) ? zzgVarZzs.zzj() : null, zzt(str).zzd()));
    }

    final void zzx(zzas zzasVar, zzp zzpVar) {
        Preconditions.checkNotEmpty(zzpVar.zza);
        zzen zzenVarZza = zzen.zza(zzasVar);
        zzku zzkuVarZzq = zzq();
        Bundle bundle = zzenVarZza.zzd;
        zzai zzaiVar = this.zze;
        zzak(zzaiVar);
        zzkuVarZzq.zzH(bundle, zzaiVar.zzK(zzpVar.zza));
        zzq().zzG(zzenVarZza, zzd().zzd(zzpVar.zza));
        zzas zzasVarZzb = zzenVarZza.zzb();
        if (zzd().zzn(null, zzea.zzab) && Constants.ScionAnalytics.EVENT_FIREBASE_CAMPAIGN.equals(zzasVarZzb.zza) && "referrer API v2".equals(zzasVarZzb.zzb.zzd("_cis"))) {
            String strZzd = zzasVarZzb.zzb.zzd("gclid");
            if (!TextUtils.isEmpty(strZzd)) {
                zzJ(new zzkq("_lgclid", zzasVarZzb.zzd, strZzd, DebugKt.DEBUG_PROPERTY_VALUE_AUTO), zzpVar);
            }
        }
        zzy(zzasVarZzb, zzpVar);
    }

    final void zzy(zzas zzasVar, zzp zzpVar) {
        List<zzaa> listZzr;
        List<zzaa> listZzr2;
        List<zzaa> listZzr3;
        zzas zzasVar2 = zzasVar;
        Preconditions.checkNotNull(zzpVar);
        Preconditions.checkNotEmpty(zzpVar.zza);
        zzav().zzg();
        zzr();
        String str = zzpVar.zza;
        long j = zzasVar2.zzd;
        zzak(this.zzi);
        if (zzkp.zzz(zzasVar, zzpVar)) {
            if (!zzpVar.zzh) {
                zzT(zzpVar);
                return;
            }
            List<String> list = zzpVar.zzt;
            if (list != null) {
                if (!list.contains(zzasVar2.zza)) {
                    zzau().zzj().zzd("Dropping non-safelisted event. appId, event name, origin", str, zzasVar2.zza, zzasVar2.zzc);
                    return;
                } else {
                    Bundle bundleZzf = zzasVar2.zzb.zzf();
                    bundleZzf.putLong("ga_safelisted", 1L);
                    zzasVar2 = new zzas(zzasVar2.zza, new zzaq(bundleZzf), zzasVar2.zzc, zzasVar2.zzd);
                }
            }
            zzai zzaiVar = this.zze;
            zzak(zzaiVar);
            zzaiVar.zzb();
            try {
                zzai zzaiVar2 = this.zze;
                zzak(zzaiVar2);
                Preconditions.checkNotEmpty(str);
                zzaiVar2.zzg();
                zzaiVar2.zzZ();
                if (j < 0) {
                    zzaiVar2.zzs.zzau().zze().zzc("Invalid time querying timed out conditional properties", zzem.zzl(str), Long.valueOf(j));
                    listZzr = Collections.emptyList();
                } else {
                    listZzr = zzaiVar2.zzr("active=0 and app_id=? and abs(? - creation_timestamp) > trigger_timeout", new String[]{str, String.valueOf(j)});
                }
                for (zzaa zzaaVar : listZzr) {
                    if (zzaaVar != null) {
                        zzau().zzk().zzd("User property timed out", zzaaVar.zza, this.zzm.zzm().zze(zzaaVar.zzc.zzb), zzaaVar.zzc.zza());
                        zzas zzasVar3 = zzaaVar.zzg;
                        if (zzasVar3 != null) {
                            zzz(new zzas(zzasVar3, j), zzpVar);
                        }
                        zzai zzaiVar3 = this.zze;
                        zzak(zzaiVar3);
                        zzaiVar3.zzp(str, zzaaVar.zzc.zzb);
                    }
                }
                zzai zzaiVar4 = this.zze;
                zzak(zzaiVar4);
                Preconditions.checkNotEmpty(str);
                zzaiVar4.zzg();
                zzaiVar4.zzZ();
                if (j < 0) {
                    zzaiVar4.zzs.zzau().zze().zzc("Invalid time querying expired conditional properties", zzem.zzl(str), Long.valueOf(j));
                    listZzr2 = Collections.emptyList();
                } else {
                    listZzr2 = zzaiVar4.zzr("active<>0 and app_id=? and abs(? - triggered_timestamp) > time_to_live", new String[]{str, String.valueOf(j)});
                }
                ArrayList arrayList = new ArrayList(listZzr2.size());
                for (zzaa zzaaVar2 : listZzr2) {
                    if (zzaaVar2 != null) {
                        zzau().zzk().zzd("User property expired", zzaaVar2.zza, this.zzm.zzm().zze(zzaaVar2.zzc.zzb), zzaaVar2.zzc.zza());
                        zzai zzaiVar5 = this.zze;
                        zzak(zzaiVar5);
                        zzaiVar5.zzi(str, zzaaVar2.zzc.zzb);
                        zzas zzasVar4 = zzaaVar2.zzk;
                        if (zzasVar4 != null) {
                            arrayList.add(zzasVar4);
                        }
                        zzai zzaiVar6 = this.zze;
                        zzak(zzaiVar6);
                        zzaiVar6.zzp(str, zzaaVar2.zzc.zzb);
                    }
                }
                Iterator it = arrayList.iterator();
                while (it.hasNext()) {
                    zzz(new zzas((zzas) it.next(), j), zzpVar);
                }
                zzai zzaiVar7 = this.zze;
                zzak(zzaiVar7);
                String str2 = zzasVar2.zza;
                Preconditions.checkNotEmpty(str);
                Preconditions.checkNotEmpty(str2);
                zzaiVar7.zzg();
                zzaiVar7.zzZ();
                if (j < 0) {
                    zzaiVar7.zzs.zzau().zze().zzd("Invalid time querying triggered conditional properties", zzem.zzl(str), zzaiVar7.zzs.zzm().zzc(str2), Long.valueOf(j));
                    listZzr3 = Collections.emptyList();
                } else {
                    listZzr3 = zzaiVar7.zzr("active=0 and app_id=? and trigger_event_name=? and abs(? - creation_timestamp) <= trigger_timeout", new String[]{str, str2, String.valueOf(j)});
                }
                ArrayList arrayList2 = new ArrayList(listZzr3.size());
                for (zzaa zzaaVar3 : listZzr3) {
                    if (zzaaVar3 != null) {
                        zzkq zzkqVar = zzaaVar3.zzc;
                        zzks zzksVar = new zzks((String) Preconditions.checkNotNull(zzaaVar3.zza), zzaaVar3.zzb, zzkqVar.zzb, j, Preconditions.checkNotNull(zzkqVar.zza()));
                        zzai zzaiVar8 = this.zze;
                        zzak(zzaiVar8);
                        if (zzaiVar8.zzj(zzksVar)) {
                            zzau().zzk().zzd("User property triggered", zzaaVar3.zza, this.zzm.zzm().zze(zzksVar.zzc), zzksVar.zze);
                        } else {
                            zzau().zzb().zzd("Too many active user properties, ignoring", zzem.zzl(zzaaVar3.zza), this.zzm.zzm().zze(zzksVar.zzc), zzksVar.zze);
                        }
                        zzas zzasVar5 = zzaaVar3.zzi;
                        if (zzasVar5 != null) {
                            arrayList2.add(zzasVar5);
                        }
                        zzaaVar3.zzc = new zzkq(zzksVar);
                        zzaaVar3.zze = true;
                        zzai zzaiVar9 = this.zze;
                        zzak(zzaiVar9);
                        zzaiVar9.zzn(zzaaVar3);
                    }
                }
                zzz(zzasVar2, zzpVar);
                Iterator it2 = arrayList2.iterator();
                while (it2.hasNext()) {
                    zzz(new zzas((zzas) it2.next(), j), zzpVar);
                }
                zzai zzaiVar10 = this.zze;
                zzak(zzaiVar10);
                zzaiVar10.zzc();
            } finally {
                zzai zzaiVar11 = this.zze;
                zzak(zzaiVar11);
                zzaiVar11.zzd();
            }
        }
    }

    /* JADX WARN: Can't wrap try/catch for region: R(11:80|(1:82)(1:84)|83|85|(2:87|(1:89)(3:90|99|(1:101)))(1:91)|92|331|93|98|99|(0)) */
    /* JADX WARN: Code restructure failed: missing block: B:95:0x02ee, code lost:
    
        r0 = move-exception;
     */
    /* JADX WARN: Code restructure failed: missing block: B:97:0x02f0, code lost:
    
        r11.zzs.zzau().zzb().zzc("Error pruning currencies. appId", com.google.android.gms.measurement.internal.zzem.zzl(r10), r0);
     */
    /* JADX WARN: Multi-variable type inference failed */
    /* JADX WARN: Removed duplicated region for block: B:101:0x032c A[Catch: all -> 0x0b2f, TryCatch #9 {all -> 0x0b2f, blocks: (B:39:0x017a, B:42:0x0189, B:44:0x0193, B:49:0x01a0, B:104:0x0373, B:115:0x03ad, B:117:0x03e9, B:119:0x03ee, B:120:0x0405, B:123:0x0413, B:125:0x042b, B:127:0x0432, B:128:0x0449, B:132:0x0479, B:136:0x049c, B:137:0x04b3, B:139:0x04bf, B:142:0x04dc, B:143:0x04f0, B:145:0x04fa, B:147:0x0507, B:149:0x050d, B:150:0x0516, B:151:0x0524, B:153:0x0539, B:163:0x056d, B:164:0x0582, B:166:0x05ab, B:169:0x05c3, B:171:0x060c, B:173:0x0638, B:175:0x0675, B:176:0x067a, B:178:0x0682, B:179:0x0687, B:181:0x068f, B:182:0x0694, B:184:0x069d, B:185:0x06a1, B:187:0x06ae, B:188:0x06b3, B:190:0x06e1, B:192:0x06eb, B:194:0x06f3, B:195:0x06f8, B:197:0x0702, B:199:0x070c, B:201:0x0714, B:207:0x0731, B:209:0x0739, B:210:0x073c, B:212:0x0754, B:233:0x07dd, B:234:0x07e0, B:236:0x07fc, B:238:0x080e, B:240:0x0812, B:242:0x081d, B:243:0x0828, B:245:0x086c, B:246:0x0871, B:248:0x0879, B:250:0x0883, B:251:0x0886, B:253:0x0893, B:255:0x08b3, B:256:0x08be, B:258:0x08f5, B:259:0x08fa, B:260:0x0907, B:262:0x090d, B:264:0x0917, B:265:0x0924, B:267:0x092e, B:268:0x093b, B:269:0x0947, B:271:0x094d, B:273:0x097d, B:274:0x09c3, B:276:0x09cd, B:277:0x09d0, B:278:0x09dc, B:280:0x09e2, B:289:0x0a33, B:290:0x0a81, B:292:0x0a90, B:312:0x0afc, B:295:0x0aa8, B:297:0x0aac, B:283:0x09ef, B:285:0x0a1b, B:311:0x0ae7, B:306:0x0acb, B:307:0x0ae2, B:215:0x075d, B:216:0x0777, B:218:0x077d, B:220:0x0791, B:222:0x079d, B:224:0x07aa, B:228:0x07c4, B:229:0x07d4, B:202:0x071a, B:204:0x0724, B:206:0x072c, B:172:0x062a, B:160:0x0552, B:107:0x038b, B:108:0x0392, B:110:0x0398, B:112:0x03a4, B:54:0x01b5, B:57:0x01c1, B:59:0x01d8, B:65:0x01f6, B:76:0x0238, B:78:0x023e, B:80:0x024c, B:82:0x0258, B:85:0x0264, B:87:0x026f, B:92:0x02b9, B:93:0x02d3, B:98:0x0303, B:99:0x0321, B:101:0x032c, B:97:0x02f0, B:90:0x027e, B:84:0x025e, B:70:0x0206, B:75:0x022e), top: B:335:0x017a, inners: #1, #6, #7 }] */
    /* JADX WARN: Removed duplicated region for block: B:103:0x036e  */
    /* JADX WARN: Removed duplicated region for block: B:106:0x0388  */
    /* JADX WARN: Removed duplicated region for block: B:107:0x038b A[Catch: all -> 0x0b2f, TryCatch #9 {all -> 0x0b2f, blocks: (B:39:0x017a, B:42:0x0189, B:44:0x0193, B:49:0x01a0, B:104:0x0373, B:115:0x03ad, B:117:0x03e9, B:119:0x03ee, B:120:0x0405, B:123:0x0413, B:125:0x042b, B:127:0x0432, B:128:0x0449, B:132:0x0479, B:136:0x049c, B:137:0x04b3, B:139:0x04bf, B:142:0x04dc, B:143:0x04f0, B:145:0x04fa, B:147:0x0507, B:149:0x050d, B:150:0x0516, B:151:0x0524, B:153:0x0539, B:163:0x056d, B:164:0x0582, B:166:0x05ab, B:169:0x05c3, B:171:0x060c, B:173:0x0638, B:175:0x0675, B:176:0x067a, B:178:0x0682, B:179:0x0687, B:181:0x068f, B:182:0x0694, B:184:0x069d, B:185:0x06a1, B:187:0x06ae, B:188:0x06b3, B:190:0x06e1, B:192:0x06eb, B:194:0x06f3, B:195:0x06f8, B:197:0x0702, B:199:0x070c, B:201:0x0714, B:207:0x0731, B:209:0x0739, B:210:0x073c, B:212:0x0754, B:233:0x07dd, B:234:0x07e0, B:236:0x07fc, B:238:0x080e, B:240:0x0812, B:242:0x081d, B:243:0x0828, B:245:0x086c, B:246:0x0871, B:248:0x0879, B:250:0x0883, B:251:0x0886, B:253:0x0893, B:255:0x08b3, B:256:0x08be, B:258:0x08f5, B:259:0x08fa, B:260:0x0907, B:262:0x090d, B:264:0x0917, B:265:0x0924, B:267:0x092e, B:268:0x093b, B:269:0x0947, B:271:0x094d, B:273:0x097d, B:274:0x09c3, B:276:0x09cd, B:277:0x09d0, B:278:0x09dc, B:280:0x09e2, B:289:0x0a33, B:290:0x0a81, B:292:0x0a90, B:312:0x0afc, B:295:0x0aa8, B:297:0x0aac, B:283:0x09ef, B:285:0x0a1b, B:311:0x0ae7, B:306:0x0acb, B:307:0x0ae2, B:215:0x075d, B:216:0x0777, B:218:0x077d, B:220:0x0791, B:222:0x079d, B:224:0x07aa, B:228:0x07c4, B:229:0x07d4, B:202:0x071a, B:204:0x0724, B:206:0x072c, B:172:0x062a, B:160:0x0552, B:107:0x038b, B:108:0x0392, B:110:0x0398, B:112:0x03a4, B:54:0x01b5, B:57:0x01c1, B:59:0x01d8, B:65:0x01f6, B:76:0x0238, B:78:0x023e, B:80:0x024c, B:82:0x0258, B:85:0x0264, B:87:0x026f, B:92:0x02b9, B:93:0x02d3, B:98:0x0303, B:99:0x0321, B:101:0x032c, B:97:0x02f0, B:90:0x027e, B:84:0x025e, B:70:0x0206, B:75:0x022e), top: B:335:0x017a, inners: #1, #6, #7 }] */
    /* JADX WARN: Removed duplicated region for block: B:117:0x03e9 A[Catch: all -> 0x0b2f, TryCatch #9 {all -> 0x0b2f, blocks: (B:39:0x017a, B:42:0x0189, B:44:0x0193, B:49:0x01a0, B:104:0x0373, B:115:0x03ad, B:117:0x03e9, B:119:0x03ee, B:120:0x0405, B:123:0x0413, B:125:0x042b, B:127:0x0432, B:128:0x0449, B:132:0x0479, B:136:0x049c, B:137:0x04b3, B:139:0x04bf, B:142:0x04dc, B:143:0x04f0, B:145:0x04fa, B:147:0x0507, B:149:0x050d, B:150:0x0516, B:151:0x0524, B:153:0x0539, B:163:0x056d, B:164:0x0582, B:166:0x05ab, B:169:0x05c3, B:171:0x060c, B:173:0x0638, B:175:0x0675, B:176:0x067a, B:178:0x0682, B:179:0x0687, B:181:0x068f, B:182:0x0694, B:184:0x069d, B:185:0x06a1, B:187:0x06ae, B:188:0x06b3, B:190:0x06e1, B:192:0x06eb, B:194:0x06f3, B:195:0x06f8, B:197:0x0702, B:199:0x070c, B:201:0x0714, B:207:0x0731, B:209:0x0739, B:210:0x073c, B:212:0x0754, B:233:0x07dd, B:234:0x07e0, B:236:0x07fc, B:238:0x080e, B:240:0x0812, B:242:0x081d, B:243:0x0828, B:245:0x086c, B:246:0x0871, B:248:0x0879, B:250:0x0883, B:251:0x0886, B:253:0x0893, B:255:0x08b3, B:256:0x08be, B:258:0x08f5, B:259:0x08fa, B:260:0x0907, B:262:0x090d, B:264:0x0917, B:265:0x0924, B:267:0x092e, B:268:0x093b, B:269:0x0947, B:271:0x094d, B:273:0x097d, B:274:0x09c3, B:276:0x09cd, B:277:0x09d0, B:278:0x09dc, B:280:0x09e2, B:289:0x0a33, B:290:0x0a81, B:292:0x0a90, B:312:0x0afc, B:295:0x0aa8, B:297:0x0aac, B:283:0x09ef, B:285:0x0a1b, B:311:0x0ae7, B:306:0x0acb, B:307:0x0ae2, B:215:0x075d, B:216:0x0777, B:218:0x077d, B:220:0x0791, B:222:0x079d, B:224:0x07aa, B:228:0x07c4, B:229:0x07d4, B:202:0x071a, B:204:0x0724, B:206:0x072c, B:172:0x062a, B:160:0x0552, B:107:0x038b, B:108:0x0392, B:110:0x0398, B:112:0x03a4, B:54:0x01b5, B:57:0x01c1, B:59:0x01d8, B:65:0x01f6, B:76:0x0238, B:78:0x023e, B:80:0x024c, B:82:0x0258, B:85:0x0264, B:87:0x026f, B:92:0x02b9, B:93:0x02d3, B:98:0x0303, B:99:0x0321, B:101:0x032c, B:97:0x02f0, B:90:0x027e, B:84:0x025e, B:70:0x0206, B:75:0x022e), top: B:335:0x017a, inners: #1, #6, #7 }] */
    /* JADX WARN: Removed duplicated region for block: B:122:0x0411  */
    /* JADX WARN: Removed duplicated region for block: B:130:0x0474  */
    /* JADX WARN: Removed duplicated region for block: B:139:0x04bf A[Catch: all -> 0x0b2f, TRY_ENTER, TRY_LEAVE, TryCatch #9 {all -> 0x0b2f, blocks: (B:39:0x017a, B:42:0x0189, B:44:0x0193, B:49:0x01a0, B:104:0x0373, B:115:0x03ad, B:117:0x03e9, B:119:0x03ee, B:120:0x0405, B:123:0x0413, B:125:0x042b, B:127:0x0432, B:128:0x0449, B:132:0x0479, B:136:0x049c, B:137:0x04b3, B:139:0x04bf, B:142:0x04dc, B:143:0x04f0, B:145:0x04fa, B:147:0x0507, B:149:0x050d, B:150:0x0516, B:151:0x0524, B:153:0x0539, B:163:0x056d, B:164:0x0582, B:166:0x05ab, B:169:0x05c3, B:171:0x060c, B:173:0x0638, B:175:0x0675, B:176:0x067a, B:178:0x0682, B:179:0x0687, B:181:0x068f, B:182:0x0694, B:184:0x069d, B:185:0x06a1, B:187:0x06ae, B:188:0x06b3, B:190:0x06e1, B:192:0x06eb, B:194:0x06f3, B:195:0x06f8, B:197:0x0702, B:199:0x070c, B:201:0x0714, B:207:0x0731, B:209:0x0739, B:210:0x073c, B:212:0x0754, B:233:0x07dd, B:234:0x07e0, B:236:0x07fc, B:238:0x080e, B:240:0x0812, B:242:0x081d, B:243:0x0828, B:245:0x086c, B:246:0x0871, B:248:0x0879, B:250:0x0883, B:251:0x0886, B:253:0x0893, B:255:0x08b3, B:256:0x08be, B:258:0x08f5, B:259:0x08fa, B:260:0x0907, B:262:0x090d, B:264:0x0917, B:265:0x0924, B:267:0x092e, B:268:0x093b, B:269:0x0947, B:271:0x094d, B:273:0x097d, B:274:0x09c3, B:276:0x09cd, B:277:0x09d0, B:278:0x09dc, B:280:0x09e2, B:289:0x0a33, B:290:0x0a81, B:292:0x0a90, B:312:0x0afc, B:295:0x0aa8, B:297:0x0aac, B:283:0x09ef, B:285:0x0a1b, B:311:0x0ae7, B:306:0x0acb, B:307:0x0ae2, B:215:0x075d, B:216:0x0777, B:218:0x077d, B:220:0x0791, B:222:0x079d, B:224:0x07aa, B:228:0x07c4, B:229:0x07d4, B:202:0x071a, B:204:0x0724, B:206:0x072c, B:172:0x062a, B:160:0x0552, B:107:0x038b, B:108:0x0392, B:110:0x0398, B:112:0x03a4, B:54:0x01b5, B:57:0x01c1, B:59:0x01d8, B:65:0x01f6, B:76:0x0238, B:78:0x023e, B:80:0x024c, B:82:0x0258, B:85:0x0264, B:87:0x026f, B:92:0x02b9, B:93:0x02d3, B:98:0x0303, B:99:0x0321, B:101:0x032c, B:97:0x02f0, B:90:0x027e, B:84:0x025e, B:70:0x0206, B:75:0x022e), top: B:335:0x017a, inners: #1, #6, #7 }] */
    /* JADX WARN: Removed duplicated region for block: B:57:0x01c1 A[Catch: all -> 0x0b2f, TRY_ENTER, TryCatch #9 {all -> 0x0b2f, blocks: (B:39:0x017a, B:42:0x0189, B:44:0x0193, B:49:0x01a0, B:104:0x0373, B:115:0x03ad, B:117:0x03e9, B:119:0x03ee, B:120:0x0405, B:123:0x0413, B:125:0x042b, B:127:0x0432, B:128:0x0449, B:132:0x0479, B:136:0x049c, B:137:0x04b3, B:139:0x04bf, B:142:0x04dc, B:143:0x04f0, B:145:0x04fa, B:147:0x0507, B:149:0x050d, B:150:0x0516, B:151:0x0524, B:153:0x0539, B:163:0x056d, B:164:0x0582, B:166:0x05ab, B:169:0x05c3, B:171:0x060c, B:173:0x0638, B:175:0x0675, B:176:0x067a, B:178:0x0682, B:179:0x0687, B:181:0x068f, B:182:0x0694, B:184:0x069d, B:185:0x06a1, B:187:0x06ae, B:188:0x06b3, B:190:0x06e1, B:192:0x06eb, B:194:0x06f3, B:195:0x06f8, B:197:0x0702, B:199:0x070c, B:201:0x0714, B:207:0x0731, B:209:0x0739, B:210:0x073c, B:212:0x0754, B:233:0x07dd, B:234:0x07e0, B:236:0x07fc, B:238:0x080e, B:240:0x0812, B:242:0x081d, B:243:0x0828, B:245:0x086c, B:246:0x0871, B:248:0x0879, B:250:0x0883, B:251:0x0886, B:253:0x0893, B:255:0x08b3, B:256:0x08be, B:258:0x08f5, B:259:0x08fa, B:260:0x0907, B:262:0x090d, B:264:0x0917, B:265:0x0924, B:267:0x092e, B:268:0x093b, B:269:0x0947, B:271:0x094d, B:273:0x097d, B:274:0x09c3, B:276:0x09cd, B:277:0x09d0, B:278:0x09dc, B:280:0x09e2, B:289:0x0a33, B:290:0x0a81, B:292:0x0a90, B:312:0x0afc, B:295:0x0aa8, B:297:0x0aac, B:283:0x09ef, B:285:0x0a1b, B:311:0x0ae7, B:306:0x0acb, B:307:0x0ae2, B:215:0x075d, B:216:0x0777, B:218:0x077d, B:220:0x0791, B:222:0x079d, B:224:0x07aa, B:228:0x07c4, B:229:0x07d4, B:202:0x071a, B:204:0x0724, B:206:0x072c, B:172:0x062a, B:160:0x0552, B:107:0x038b, B:108:0x0392, B:110:0x0398, B:112:0x03a4, B:54:0x01b5, B:57:0x01c1, B:59:0x01d8, B:65:0x01f6, B:76:0x0238, B:78:0x023e, B:80:0x024c, B:82:0x0258, B:85:0x0264, B:87:0x026f, B:92:0x02b9, B:93:0x02d3, B:98:0x0303, B:99:0x0321, B:101:0x032c, B:97:0x02f0, B:90:0x027e, B:84:0x025e, B:70:0x0206, B:75:0x022e), top: B:335:0x017a, inners: #1, #6, #7 }] */
    /* JADX WARN: Removed duplicated region for block: B:74:0x022c  */
    /* JADX WARN: Removed duplicated region for block: B:78:0x023e A[Catch: all -> 0x0b2f, TryCatch #9 {all -> 0x0b2f, blocks: (B:39:0x017a, B:42:0x0189, B:44:0x0193, B:49:0x01a0, B:104:0x0373, B:115:0x03ad, B:117:0x03e9, B:119:0x03ee, B:120:0x0405, B:123:0x0413, B:125:0x042b, B:127:0x0432, B:128:0x0449, B:132:0x0479, B:136:0x049c, B:137:0x04b3, B:139:0x04bf, B:142:0x04dc, B:143:0x04f0, B:145:0x04fa, B:147:0x0507, B:149:0x050d, B:150:0x0516, B:151:0x0524, B:153:0x0539, B:163:0x056d, B:164:0x0582, B:166:0x05ab, B:169:0x05c3, B:171:0x060c, B:173:0x0638, B:175:0x0675, B:176:0x067a, B:178:0x0682, B:179:0x0687, B:181:0x068f, B:182:0x0694, B:184:0x069d, B:185:0x06a1, B:187:0x06ae, B:188:0x06b3, B:190:0x06e1, B:192:0x06eb, B:194:0x06f3, B:195:0x06f8, B:197:0x0702, B:199:0x070c, B:201:0x0714, B:207:0x0731, B:209:0x0739, B:210:0x073c, B:212:0x0754, B:233:0x07dd, B:234:0x07e0, B:236:0x07fc, B:238:0x080e, B:240:0x0812, B:242:0x081d, B:243:0x0828, B:245:0x086c, B:246:0x0871, B:248:0x0879, B:250:0x0883, B:251:0x0886, B:253:0x0893, B:255:0x08b3, B:256:0x08be, B:258:0x08f5, B:259:0x08fa, B:260:0x0907, B:262:0x090d, B:264:0x0917, B:265:0x0924, B:267:0x092e, B:268:0x093b, B:269:0x0947, B:271:0x094d, B:273:0x097d, B:274:0x09c3, B:276:0x09cd, B:277:0x09d0, B:278:0x09dc, B:280:0x09e2, B:289:0x0a33, B:290:0x0a81, B:292:0x0a90, B:312:0x0afc, B:295:0x0aa8, B:297:0x0aac, B:283:0x09ef, B:285:0x0a1b, B:311:0x0ae7, B:306:0x0acb, B:307:0x0ae2, B:215:0x075d, B:216:0x0777, B:218:0x077d, B:220:0x0791, B:222:0x079d, B:224:0x07aa, B:228:0x07c4, B:229:0x07d4, B:202:0x071a, B:204:0x0724, B:206:0x072c, B:172:0x062a, B:160:0x0552, B:107:0x038b, B:108:0x0392, B:110:0x0398, B:112:0x03a4, B:54:0x01b5, B:57:0x01c1, B:59:0x01d8, B:65:0x01f6, B:76:0x0238, B:78:0x023e, B:80:0x024c, B:82:0x0258, B:85:0x0264, B:87:0x026f, B:92:0x02b9, B:93:0x02d3, B:98:0x0303, B:99:0x0321, B:101:0x032c, B:97:0x02f0, B:90:0x027e, B:84:0x025e, B:70:0x0206, B:75:0x022e), top: B:335:0x017a, inners: #1, #6, #7 }] */
    /* JADX WARN: Type inference failed for: r16v16 */
    /* JADX WARN: Type inference failed for: r16v21 */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    final void zzz(com.google.android.gms.measurement.internal.zzas r33, com.google.android.gms.measurement.internal.zzp r34) throws java.lang.Throwable {
        /*
            Method dump skipped, instruction units count: 2878
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzkn.zzz(com.google.android.gms.measurement.internal.zzas, com.google.android.gms.measurement.internal.zzp):void");
    }

    private final void zzab(com.google.android.gms.internal.measurement.zzfv zzfvVar, long j, boolean z) {
        String str = true != z ? "_lte" : "_se";
        zzai zzaiVar = this.zze;
        zzak(zzaiVar);
        zzks zzksVarZzk = zzaiVar.zzk(zzfvVar.zzG(), str);
        zzks zzksVar = (zzksVarZzk == null || zzksVarZzk.zze == null) ? new zzks(zzfvVar.zzG(), DebugKt.DEBUG_PROPERTY_VALUE_AUTO, str, zzay().currentTimeMillis(), Long.valueOf(j)) : new zzks(zzfvVar.zzG(), DebugKt.DEBUG_PROPERTY_VALUE_AUTO, str, zzay().currentTimeMillis(), Long.valueOf(((Long) zzksVarZzk.zze).longValue() + j));
        com.google.android.gms.internal.measurement.zzgg zzggVarZzj = com.google.android.gms.internal.measurement.zzgh.zzj();
        zzggVarZzj.zzb(str);
        zzggVarZzj.zza(zzay().currentTimeMillis());
        zzggVarZzj.zze(((Long) zzksVar.zze).longValue());
        com.google.android.gms.internal.measurement.zzgh zzghVarZzaA = zzggVarZzj.zzaA();
        int iZzu = zzkp.zzu(zzfvVar, str);
        if (iZzu >= 0) {
            zzfvVar.zzm(iZzu, zzghVarZzaA);
        } else {
            zzfvVar.zzn(zzghVarZzaA);
        }
        if (j > 0) {
            zzai zzaiVar2 = this.zze;
            zzak(zzaiVar2);
            zzaiVar2.zzj(zzksVar);
            zzau().zzk().zzc("Updated engagement user property. scope, value", true != z ? "lifetime" : "session-scoped", zzksVar.zze);
        }
    }
}
