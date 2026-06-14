package com.bumptech.glide.load.engine.executor;

import android.os.StrictMode;
import java.io.File;
import java.io.FilenameFilter;
import java.util.regex.Pattern;

/* JADX INFO: loaded from: classes.dex */
final class RuntimeCompat {
    private static final String CPU_LOCATION = "/sys/devices/system/cpu/";
    private static final String CPU_NAME_REGEX = "cpu[0-9]+";
    private static final String TAG = "GlideRuntimeCompat";

    private RuntimeCompat() {
    }

    static int availableProcessors() {
        int cpus = Runtime.getRuntime().availableProcessors();
        return cpus;
    }

    private static int getCoreCountPre17() {
        File[] cpus = null;
        StrictMode.ThreadPolicy originalPolicy = StrictMode.allowThreadDiskReads();
        try {
            File cpuInfo = new File(CPU_LOCATION);
            final Pattern cpuNamePattern = Pattern.compile(CPU_NAME_REGEX);
            cpus = cpuInfo.listFiles(new FilenameFilter() { // from class: com.bumptech.glide.load.engine.executor.RuntimeCompat.1
                @Override // java.io.FilenameFilter
                public boolean accept(File file, String s) {
                    return cpuNamePattern.matcher(s).matches();
                }
            });
        } finally {
            try {
            } finally {
            }
        }
        return Math.max(1, cpus != null ? cpus.length : 0);
    }
}
