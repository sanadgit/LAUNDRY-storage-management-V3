package com.bumptech.glide.load.engine;

import com.bumptech.glide.load.Key;
import com.bumptech.glide.load.Options;
import com.bumptech.glide.load.Transformation;
import com.bumptech.glide.util.Preconditions;
import java.security.MessageDigest;
import java.util.Map;

/* JADX INFO: loaded from: classes.dex */
class EngineKey implements Key {
    private int hashCode;
    private final int height;
    private final Object model;
    private final Options options;
    private final Class<?> resourceClass;
    private final Key signature;
    private final Class<?> transcodeClass;
    private final Map<Class<?>, Transformation<?>> transformations;
    private final int width;

    EngineKey(Object model, Key signature, int width, int height, Map<Class<?>, Transformation<?>> transformations, Class<?> resourceClass, Class<?> transcodeClass, Options options) {
        this.model = Preconditions.checkNotNull(model);
        this.signature = (Key) Preconditions.checkNotNull(signature, "Signature must not be null");
        this.width = width;
        this.height = height;
        this.transformations = (Map) Preconditions.checkNotNull(transformations);
        this.resourceClass = (Class) Preconditions.checkNotNull(resourceClass, "Resource class must not be null");
        this.transcodeClass = (Class) Preconditions.checkNotNull(transcodeClass, "Transcode class must not be null");
        this.options = (Options) Preconditions.checkNotNull(options);
    }

    @Override // com.bumptech.glide.load.Key
    public boolean equals(Object o) {
        if (!(o instanceof EngineKey)) {
            return false;
        }
        EngineKey other = (EngineKey) o;
        return this.model.equals(other.model) && this.signature.equals(other.signature) && this.height == other.height && this.width == other.width && this.transformations.equals(other.transformations) && this.resourceClass.equals(other.resourceClass) && this.transcodeClass.equals(other.transcodeClass) && this.options.equals(other.options);
    }

    @Override // com.bumptech.glide.load.Key
    public int hashCode() {
        if (this.hashCode == 0) {
            int iHashCode = this.model.hashCode();
            this.hashCode = iHashCode;
            int iHashCode2 = (iHashCode * 31) + this.signature.hashCode();
            this.hashCode = iHashCode2;
            int i = (iHashCode2 * 31) + this.width;
            this.hashCode = i;
            int i2 = (i * 31) + this.height;
            this.hashCode = i2;
            int iHashCode3 = (i2 * 31) + this.transformations.hashCode();
            this.hashCode = iHashCode3;
            int iHashCode4 = (iHashCode3 * 31) + this.resourceClass.hashCode();
            this.hashCode = iHashCode4;
            int iHashCode5 = (iHashCode4 * 31) + this.transcodeClass.hashCode();
            this.hashCode = iHashCode5;
            this.hashCode = (iHashCode5 * 31) + this.options.hashCode();
        }
        return this.hashCode;
    }

    public String toString() {
        return "EngineKey{model=" + this.model + ", width=" + this.width + ", height=" + this.height + ", resourceClass=" + this.resourceClass + ", transcodeClass=" + this.transcodeClass + ", signature=" + this.signature + ", hashCode=" + this.hashCode + ", transformations=" + this.transformations + ", options=" + this.options + '}';
    }

    @Override // com.bumptech.glide.load.Key
    public void updateDiskCacheKey(MessageDigest messageDigest) {
        throw new UnsupportedOperationException();
    }
}
