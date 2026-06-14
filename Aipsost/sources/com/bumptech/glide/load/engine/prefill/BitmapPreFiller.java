package com.bumptech.glide.load.engine.prefill;

import android.graphics.Bitmap;
import com.bumptech.glide.load.DecodeFormat;
import com.bumptech.glide.load.engine.bitmap_recycle.BitmapPool;
import com.bumptech.glide.load.engine.cache.MemoryCache;
import com.bumptech.glide.load.engine.prefill.PreFillType;
import com.bumptech.glide.util.Util;
import java.util.HashMap;
import java.util.Map;

/* JADX INFO: loaded from: classes.dex */
public final class BitmapPreFiller {
    private final BitmapPool bitmapPool;
    private BitmapPreFillRunner current;
    private final DecodeFormat defaultFormat;
    private final MemoryCache memoryCache;

    public BitmapPreFiller(MemoryCache memoryCache, BitmapPool bitmapPool, DecodeFormat defaultFormat) {
        this.memoryCache = memoryCache;
        this.bitmapPool = bitmapPool;
        this.defaultFormat = defaultFormat;
    }

    public void preFill(PreFillType.Builder... bitmapAttributeBuilders) {
        Bitmap.Config config;
        BitmapPreFillRunner bitmapPreFillRunner = this.current;
        if (bitmapPreFillRunner != null) {
            bitmapPreFillRunner.cancel();
        }
        PreFillType[] bitmapAttributes = new PreFillType[bitmapAttributeBuilders.length];
        for (int i = 0; i < bitmapAttributeBuilders.length; i++) {
            PreFillType.Builder builder = bitmapAttributeBuilders[i];
            if (builder.getConfig() == null) {
                if (this.defaultFormat == DecodeFormat.PREFER_ARGB_8888) {
                    config = Bitmap.Config.ARGB_8888;
                } else {
                    config = Bitmap.Config.RGB_565;
                }
                builder.setConfig(config);
            }
            bitmapAttributes[i] = builder.build();
        }
        PreFillQueue allocationOrder = generateAllocationOrder(bitmapAttributes);
        BitmapPreFillRunner bitmapPreFillRunner2 = new BitmapPreFillRunner(this.bitmapPool, this.memoryCache, allocationOrder);
        this.current = bitmapPreFillRunner2;
        Util.postOnUiThread(bitmapPreFillRunner2);
    }

    PreFillQueue generateAllocationOrder(PreFillType... preFillSizes) {
        long maxSize = (this.memoryCache.getMaxSize() - this.memoryCache.getCurrentSize()) + this.bitmapPool.getMaxSize();
        int totalWeight = 0;
        for (PreFillType preFillType : preFillSizes) {
            totalWeight += preFillType.getWeight();
        }
        float bytesPerWeight = maxSize / totalWeight;
        Map<PreFillType, Integer> attributeToCount = new HashMap<>();
        for (PreFillType size : preFillSizes) {
            int bytesForSize = Math.round(size.getWeight() * bytesPerWeight);
            int bytesPerBitmap = getSizeInBytes(size);
            int bitmapsForSize = bytesForSize / bytesPerBitmap;
            attributeToCount.put(size, Integer.valueOf(bitmapsForSize));
        }
        return new PreFillQueue(attributeToCount);
    }

    private static int getSizeInBytes(PreFillType size) {
        return Util.getBitmapByteSize(size.getWidth(), size.getHeight(), size.getConfig());
    }
}
