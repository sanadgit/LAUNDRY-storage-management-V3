package androidx.browser.trusted;

import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.content.pm.SigningInfo;
import android.os.Build;
import android.util.Log;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

/* JADX INFO: loaded from: classes.dex */
class PackageIdentityUtils {
    private static final String TAG = "PackageIdentity";

    interface SignaturesCompat {
        List<byte[]> getFingerprintsForPackage(String str, PackageManager packageManager) throws PackageManager.NameNotFoundException;

        boolean packageMatchesToken(String str, PackageManager packageManager, TokenContents tokenContents) throws PackageManager.NameNotFoundException, IOException;
    }

    private PackageIdentityUtils() {
    }

    static List<byte[]> getFingerprintsForPackage(String name, PackageManager pm) {
        try {
            return getImpl().getFingerprintsForPackage(name, pm);
        } catch (PackageManager.NameNotFoundException e) {
            Log.e(TAG, "Could not get fingerprint for package.", e);
            return null;
        }
    }

    static boolean packageMatchesToken(String name, PackageManager pm, TokenContents token) {
        try {
            return getImpl().packageMatchesToken(name, pm, token);
        } catch (PackageManager.NameNotFoundException | IOException e) {
            Log.e(TAG, "Could not check if package matches token.", e);
            return false;
        }
    }

    private static SignaturesCompat getImpl() {
        if (Build.VERSION.SDK_INT >= 28) {
            return new Api28Implementation();
        }
        return new Pre28Implementation();
    }

    static class Api28Implementation implements SignaturesCompat {
        Api28Implementation() {
        }

        @Override // androidx.browser.trusted.PackageIdentityUtils.SignaturesCompat
        public List<byte[]> getFingerprintsForPackage(String name, PackageManager pm) throws PackageManager.NameNotFoundException {
            PackageInfo packageInfo = pm.getPackageInfo(name, 134217728);
            List<byte[]> fingerprints = new ArrayList<>();
            SigningInfo signingInfo = packageInfo.signingInfo;
            if (signingInfo.hasMultipleSigners()) {
                for (Signature signature : signingInfo.getApkContentsSigners()) {
                    fingerprints.add(PackageIdentityUtils.getCertificateSHA256Fingerprint(signature));
                }
            } else {
                fingerprints.add(PackageIdentityUtils.getCertificateSHA256Fingerprint(signingInfo.getSigningCertificateHistory()[0]));
            }
            return fingerprints;
        }

        @Override // androidx.browser.trusted.PackageIdentityUtils.SignaturesCompat
        public boolean packageMatchesToken(String name, PackageManager pm, TokenContents token) throws PackageManager.NameNotFoundException, IOException {
            List<byte[]> fingerprints;
            if (!token.getPackageName().equals(name) || (fingerprints = getFingerprintsForPackage(name, pm)) == null) {
                return false;
            }
            if (fingerprints.size() == 1) {
                return pm.hasSigningCertificate(name, token.getFingerprint(0), 1);
            }
            TokenContents contents = TokenContents.create(name, fingerprints);
            return token.equals(contents);
        }
    }

    static class Pre28Implementation implements SignaturesCompat {
        Pre28Implementation() {
        }

        @Override // androidx.browser.trusted.PackageIdentityUtils.SignaturesCompat
        public List<byte[]> getFingerprintsForPackage(String name, PackageManager pm) throws PackageManager.NameNotFoundException {
            PackageInfo packageInfo = pm.getPackageInfo(name, 64);
            List<byte[]> fingerprints = new ArrayList<>(packageInfo.signatures.length);
            for (Signature signature : packageInfo.signatures) {
                byte[] fingerprint = PackageIdentityUtils.getCertificateSHA256Fingerprint(signature);
                if (fingerprint == null) {
                    return null;
                }
                fingerprints.add(fingerprint);
            }
            return fingerprints;
        }

        @Override // androidx.browser.trusted.PackageIdentityUtils.SignaturesCompat
        public boolean packageMatchesToken(String name, PackageManager pm, TokenContents token) throws PackageManager.NameNotFoundException, IOException {
            List<byte[]> fingerprints;
            if (!name.equals(token.getPackageName()) || (fingerprints = getFingerprintsForPackage(name, pm)) == null) {
                return false;
            }
            TokenContents contents = TokenContents.create(name, fingerprints);
            return token.equals(contents);
        }
    }

    static byte[] getCertificateSHA256Fingerprint(Signature signature) {
        try {
            return MessageDigest.getInstance("SHA256").digest(signature.toByteArray());
        } catch (NoSuchAlgorithmException e) {
            return null;
        }
    }
}
