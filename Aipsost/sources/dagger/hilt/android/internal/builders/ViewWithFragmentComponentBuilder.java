package dagger.hilt.android.internal.builders;

import android.view.View;
import dagger.BindsInstance;
import dagger.hilt.android.components.ViewWithFragmentComponent;

/* JADX INFO: loaded from: classes11.dex */
public interface ViewWithFragmentComponentBuilder {
    ViewWithFragmentComponent build();

    ViewWithFragmentComponentBuilder view(@BindsInstance View view);
}
