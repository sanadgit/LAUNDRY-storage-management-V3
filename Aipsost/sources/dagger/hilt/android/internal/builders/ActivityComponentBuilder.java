package dagger.hilt.android.internal.builders;

import android.app.Activity;
import dagger.BindsInstance;
import dagger.hilt.android.components.ActivityComponent;

/* JADX INFO: loaded from: classes11.dex */
public interface ActivityComponentBuilder {
    ActivityComponentBuilder activity(@BindsInstance Activity activity);

    ActivityComponent build();
}
