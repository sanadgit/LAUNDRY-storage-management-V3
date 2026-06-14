package com.google.firebase.datatransport;

import android.content.Context;
import com.google.android.datatransport.TransportFactory;
import com.google.android.datatransport.cct.CCTDestination;
import com.google.android.datatransport.runtime.TransportRuntime;
import com.google.firebase.components.Component;
import com.google.firebase.components.ComponentContainer;
import com.google.firebase.components.ComponentFactory;
import com.google.firebase.components.ComponentRegistrar;
import com.google.firebase.components.Dependency;
import java.util.Collections;
import java.util.List;

/* JADX INFO: loaded from: classes11.dex */
public class TransportRegistrar implements ComponentRegistrar {
    @Override // com.google.firebase.components.ComponentRegistrar
    public List<Component<?>> getComponents() {
        return Collections.singletonList(Component.builder(TransportFactory.class).add(Dependency.required((Class<?>) Context.class)).factory(new ComponentFactory() { // from class: com.google.firebase.datatransport.TransportRegistrar$$ExternalSyntheticLambda0
            @Override // com.google.firebase.components.ComponentFactory
            public final Object create(ComponentContainer componentContainer) {
                return TransportRegistrar.lambda$getComponents$0(componentContainer);
            }
        }).build());
    }

    static /* synthetic */ TransportFactory lambda$getComponents$0(ComponentContainer c) {
        TransportRuntime.initialize((Context) c.get(Context.class));
        return TransportRuntime.getInstance().newFactory(CCTDestination.LEGACY_INSTANCE);
    }
}
