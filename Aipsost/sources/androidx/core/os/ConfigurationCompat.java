package androidx.core.os;

import android.content.res.Configuration;
import android.os.Build;
import android.os.LocaleList;

/* JADX INFO: loaded from: classes.dex */
public final class ConfigurationCompat {
    private ConfigurationCompat() {
    }

    public static LocaleListCompat getLocales(Configuration configuration) {
        return Build.VERSION.SDK_INT >= 24 ? LocaleListCompat.wrap(Api24Impl.getLocales(configuration)) : LocaleListCompat.create(configuration.locale);
    }

    public static void setLocales(Configuration configuration, LocaleListCompat locales) {
        if (Build.VERSION.SDK_INT >= 24) {
            Api24Impl.setLocales(configuration, locales);
        } else {
            Api17Impl.setLocale(configuration, locales);
        }
    }

    static class Api17Impl {
        private Api17Impl() {
        }

        static void setLocale(Configuration configuration, LocaleListCompat locales) {
            if (!locales.isEmpty()) {
                configuration.setLocale(locales.get(0));
            }
        }
    }

    static class Api24Impl {
        private Api24Impl() {
        }

        static LocaleList getLocales(Configuration configuration) {
            return configuration.getLocales();
        }

        static void setLocales(Configuration configuration, LocaleListCompat locales) {
            configuration.setLocales((LocaleList) locales.unwrap());
        }
    }
}
