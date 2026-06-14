package com.bumptech.glide.module;

import android.content.Context;
import com.bumptech.glide.GlideBuilder;

/* JADX INFO: loaded from: classes.dex */
public abstract class AppGlideModule extends LibraryGlideModule implements AppliesOptions {
    public boolean isManifestParsingEnabled() {
        return true;
    }

    @Override // com.bumptech.glide.module.AppliesOptions
    public void applyOptions(Context context, GlideBuilder builder) {
    }
}
