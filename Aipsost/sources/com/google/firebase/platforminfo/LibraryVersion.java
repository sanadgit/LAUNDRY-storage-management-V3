package com.google.firebase.platforminfo;

import javax.annotation.Nonnull;

/* JADX INFO: loaded from: classes11.dex */
abstract class LibraryVersion {
    @Nonnull
    public abstract String getLibraryName();

    @Nonnull
    public abstract String getVersion();

    LibraryVersion() {
    }

    static LibraryVersion create(String name, String version) {
        return new AutoValue_LibraryVersion(name, version);
    }
}
