package com.aipsoft.aipsoftconnect.Service;

import android.app.Activity;
import android.app.PendingIntent;
import android.app.Service;
import android.view.View;
import androidx.core.app.NotificationCompat;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.SavedStateHandle;
import androidx.lifecycle.ViewModel;
import com.aipsoft.aipsoftconnect.MainActivity;
import com.aipsoft.aipsoftconnect.Service.BaseApplication_HiltComponents;
import com.aipsoft.aipsoftconnect.di.ServiceModule_ProvideBaseNotificationBuilderFactory;
import com.aipsoft.aipsoftconnect.di.ServiceModule_ProvideFusedLocationProvidedClientFactory;
import com.aipsoft.aipsoftconnect.di.ServiceModule_ProvideMainActivityPendingIntentFactory;
import com.google.android.gms.location.FusedLocationProviderClient;
import dagger.hilt.android.ActivityRetainedLifecycle;
import dagger.hilt.android.ViewModelLifecycle;
import dagger.hilt.android.flags.HiltWrapper_FragmentGetContextFix_FragmentGetContextFixModule;
import dagger.hilt.android.internal.builders.ActivityComponentBuilder;
import dagger.hilt.android.internal.builders.ActivityRetainedComponentBuilder;
import dagger.hilt.android.internal.builders.FragmentComponentBuilder;
import dagger.hilt.android.internal.builders.ServiceComponentBuilder;
import dagger.hilt.android.internal.builders.ViewComponentBuilder;
import dagger.hilt.android.internal.builders.ViewModelComponentBuilder;
import dagger.hilt.android.internal.builders.ViewWithFragmentComponentBuilder;
import dagger.hilt.android.internal.lifecycle.DefaultViewModelFactories;
import dagger.hilt.android.internal.lifecycle.DefaultViewModelFactories_InternalFactoryFactory_Factory;
import dagger.hilt.android.internal.managers.ActivityRetainedComponentManager_LifecycleModule_ProvideActivityRetainedLifecycleFactory;
import dagger.hilt.android.internal.modules.ApplicationContextModule;
import dagger.hilt.android.internal.modules.ApplicationContextModule_ProvideContextFactory;
import dagger.internal.DoubleCheck;
import dagger.internal.Preconditions;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import javax.inject.Provider;

/* JADX INFO: loaded from: classes6.dex */
public final class DaggerBaseApplication_HiltComponents_SingletonC {
    private DaggerBaseApplication_HiltComponents_SingletonC() {
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private ApplicationContextModule applicationContextModule;

        private Builder() {
        }

        public Builder applicationContextModule(ApplicationContextModule applicationContextModule) {
            this.applicationContextModule = (ApplicationContextModule) Preconditions.checkNotNull(applicationContextModule);
            return this;
        }

        @Deprecated
        public Builder hiltWrapper_FragmentGetContextFix_FragmentGetContextFixModule(HiltWrapper_FragmentGetContextFix_FragmentGetContextFixModule hiltWrapper_FragmentGetContextFix_FragmentGetContextFixModule) {
            Preconditions.checkNotNull(hiltWrapper_FragmentGetContextFix_FragmentGetContextFixModule);
            return this;
        }

        public BaseApplication_HiltComponents.SingletonC build() {
            Preconditions.checkBuilderRequirement(this.applicationContextModule, ApplicationContextModule.class);
            return new SingletonCImpl(this.applicationContextModule);
        }
    }

    private static final class ActivityRetainedCBuilder implements BaseApplication_HiltComponents.ActivityRetainedC.Builder {
        private final SingletonCImpl singletonCImpl;

        private ActivityRetainedCBuilder(SingletonCImpl singletonCImpl) {
            this.singletonCImpl = singletonCImpl;
        }

        @Override // dagger.hilt.android.internal.builders.ActivityRetainedComponentBuilder
        public BaseApplication_HiltComponents.ActivityRetainedC build() {
            return new ActivityRetainedCImpl(this.singletonCImpl);
        }
    }

    private static final class ActivityCBuilder implements BaseApplication_HiltComponents.ActivityC.Builder {
        private Activity activity;
        private final ActivityRetainedCImpl activityRetainedCImpl;
        private final SingletonCImpl singletonCImpl;

        private ActivityCBuilder(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl) {
            this.singletonCImpl = singletonCImpl;
            this.activityRetainedCImpl = activityRetainedCImpl;
        }

        @Override // dagger.hilt.android.internal.builders.ActivityComponentBuilder
        public ActivityCBuilder activity(Activity activity) {
            this.activity = (Activity) Preconditions.checkNotNull(activity);
            return this;
        }

        @Override // dagger.hilt.android.internal.builders.ActivityComponentBuilder
        public BaseApplication_HiltComponents.ActivityC build() {
            Preconditions.checkBuilderRequirement(this.activity, Activity.class);
            return new ActivityCImpl(this.singletonCImpl, this.activityRetainedCImpl, this.activity);
        }
    }

    private static final class FragmentCBuilder implements BaseApplication_HiltComponents.FragmentC.Builder {
        private final ActivityCImpl activityCImpl;
        private final ActivityRetainedCImpl activityRetainedCImpl;
        private Fragment fragment;
        private final SingletonCImpl singletonCImpl;

        private FragmentCBuilder(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl, ActivityCImpl activityCImpl) {
            this.singletonCImpl = singletonCImpl;
            this.activityRetainedCImpl = activityRetainedCImpl;
            this.activityCImpl = activityCImpl;
        }

        @Override // dagger.hilt.android.internal.builders.FragmentComponentBuilder
        public FragmentCBuilder fragment(Fragment fragment) {
            this.fragment = (Fragment) Preconditions.checkNotNull(fragment);
            return this;
        }

        @Override // dagger.hilt.android.internal.builders.FragmentComponentBuilder
        public BaseApplication_HiltComponents.FragmentC build() {
            Preconditions.checkBuilderRequirement(this.fragment, Fragment.class);
            return new FragmentCImpl(this.singletonCImpl, this.activityRetainedCImpl, this.activityCImpl, this.fragment);
        }
    }

    private static final class ViewWithFragmentCBuilder implements BaseApplication_HiltComponents.ViewWithFragmentC.Builder {
        private final ActivityCImpl activityCImpl;
        private final ActivityRetainedCImpl activityRetainedCImpl;
        private final FragmentCImpl fragmentCImpl;
        private final SingletonCImpl singletonCImpl;
        private View view;

        private ViewWithFragmentCBuilder(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl, ActivityCImpl activityCImpl, FragmentCImpl fragmentCImpl) {
            this.singletonCImpl = singletonCImpl;
            this.activityRetainedCImpl = activityRetainedCImpl;
            this.activityCImpl = activityCImpl;
            this.fragmentCImpl = fragmentCImpl;
        }

        @Override // dagger.hilt.android.internal.builders.ViewWithFragmentComponentBuilder
        public ViewWithFragmentCBuilder view(View view) {
            this.view = (View) Preconditions.checkNotNull(view);
            return this;
        }

        @Override // dagger.hilt.android.internal.builders.ViewWithFragmentComponentBuilder
        public BaseApplication_HiltComponents.ViewWithFragmentC build() {
            Preconditions.checkBuilderRequirement(this.view, View.class);
            return new ViewWithFragmentCImpl(this.singletonCImpl, this.activityRetainedCImpl, this.activityCImpl, this.fragmentCImpl, this.view);
        }
    }

    private static final class ViewCBuilder implements BaseApplication_HiltComponents.ViewC.Builder {
        private final ActivityCImpl activityCImpl;
        private final ActivityRetainedCImpl activityRetainedCImpl;
        private final SingletonCImpl singletonCImpl;
        private View view;

        private ViewCBuilder(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl, ActivityCImpl activityCImpl) {
            this.singletonCImpl = singletonCImpl;
            this.activityRetainedCImpl = activityRetainedCImpl;
            this.activityCImpl = activityCImpl;
        }

        @Override // dagger.hilt.android.internal.builders.ViewComponentBuilder
        public ViewCBuilder view(View view) {
            this.view = (View) Preconditions.checkNotNull(view);
            return this;
        }

        @Override // dagger.hilt.android.internal.builders.ViewComponentBuilder
        public BaseApplication_HiltComponents.ViewC build() {
            Preconditions.checkBuilderRequirement(this.view, View.class);
            return new ViewCImpl(this.singletonCImpl, this.activityRetainedCImpl, this.activityCImpl, this.view);
        }
    }

    private static final class ViewModelCBuilder implements BaseApplication_HiltComponents.ViewModelC.Builder {
        private final ActivityRetainedCImpl activityRetainedCImpl;
        private SavedStateHandle savedStateHandle;
        private final SingletonCImpl singletonCImpl;
        private ViewModelLifecycle viewModelLifecycle;

        private ViewModelCBuilder(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl) {
            this.singletonCImpl = singletonCImpl;
            this.activityRetainedCImpl = activityRetainedCImpl;
        }

        @Override // dagger.hilt.android.internal.builders.ViewModelComponentBuilder
        public ViewModelCBuilder savedStateHandle(SavedStateHandle handle) {
            this.savedStateHandle = (SavedStateHandle) Preconditions.checkNotNull(handle);
            return this;
        }

        @Override // dagger.hilt.android.internal.builders.ViewModelComponentBuilder
        public ViewModelCBuilder viewModelLifecycle(ViewModelLifecycle viewModelLifecycle) {
            this.viewModelLifecycle = (ViewModelLifecycle) Preconditions.checkNotNull(viewModelLifecycle);
            return this;
        }

        @Override // dagger.hilt.android.internal.builders.ViewModelComponentBuilder
        public BaseApplication_HiltComponents.ViewModelC build() {
            Preconditions.checkBuilderRequirement(this.savedStateHandle, SavedStateHandle.class);
            Preconditions.checkBuilderRequirement(this.viewModelLifecycle, ViewModelLifecycle.class);
            return new ViewModelCImpl(this.singletonCImpl, this.activityRetainedCImpl, this.savedStateHandle, this.viewModelLifecycle);
        }
    }

    private static final class ServiceCBuilder implements BaseApplication_HiltComponents.ServiceC.Builder {
        private Service service;
        private final SingletonCImpl singletonCImpl;

        private ServiceCBuilder(SingletonCImpl singletonCImpl) {
            this.singletonCImpl = singletonCImpl;
        }

        @Override // dagger.hilt.android.internal.builders.ServiceComponentBuilder
        public ServiceCBuilder service(Service service) {
            this.service = (Service) Preconditions.checkNotNull(service);
            return this;
        }

        @Override // dagger.hilt.android.internal.builders.ServiceComponentBuilder
        public BaseApplication_HiltComponents.ServiceC build() {
            Preconditions.checkBuilderRequirement(this.service, Service.class);
            return new ServiceCImpl(this.singletonCImpl, this.service);
        }
    }

    private static final class ViewWithFragmentCImpl extends BaseApplication_HiltComponents.ViewWithFragmentC {
        private final ActivityCImpl activityCImpl;
        private final ActivityRetainedCImpl activityRetainedCImpl;
        private final FragmentCImpl fragmentCImpl;
        private final SingletonCImpl singletonCImpl;
        private final ViewWithFragmentCImpl viewWithFragmentCImpl;

        private ViewWithFragmentCImpl(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl, ActivityCImpl activityCImpl, FragmentCImpl fragmentCImpl, View viewParam) {
            this.viewWithFragmentCImpl = this;
            this.singletonCImpl = singletonCImpl;
            this.activityRetainedCImpl = activityRetainedCImpl;
            this.activityCImpl = activityCImpl;
            this.fragmentCImpl = fragmentCImpl;
        }
    }

    private static final class FragmentCImpl extends BaseApplication_HiltComponents.FragmentC {
        private final ActivityCImpl activityCImpl;
        private final ActivityRetainedCImpl activityRetainedCImpl;
        private final FragmentCImpl fragmentCImpl;
        private final SingletonCImpl singletonCImpl;

        private FragmentCImpl(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl, ActivityCImpl activityCImpl, Fragment fragmentParam) {
            this.fragmentCImpl = this;
            this.singletonCImpl = singletonCImpl;
            this.activityRetainedCImpl = activityRetainedCImpl;
            this.activityCImpl = activityCImpl;
        }

        @Override // dagger.hilt.android.internal.lifecycle.DefaultViewModelFactories.FragmentEntryPoint
        public DefaultViewModelFactories.InternalFactoryFactory getHiltInternalFactoryFactory() {
            return this.activityCImpl.getHiltInternalFactoryFactory();
        }

        @Override // dagger.hilt.android.internal.managers.ViewComponentManager.ViewWithFragmentComponentBuilderEntryPoint
        public ViewWithFragmentComponentBuilder viewWithFragmentComponentBuilder() {
            return new ViewWithFragmentCBuilder(this.singletonCImpl, this.activityRetainedCImpl, this.activityCImpl, this.fragmentCImpl);
        }
    }

    private static final class ViewCImpl extends BaseApplication_HiltComponents.ViewC {
        private final ActivityCImpl activityCImpl;
        private final ActivityRetainedCImpl activityRetainedCImpl;
        private final SingletonCImpl singletonCImpl;
        private final ViewCImpl viewCImpl;

        private ViewCImpl(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl, ActivityCImpl activityCImpl, View viewParam) {
            this.viewCImpl = this;
            this.singletonCImpl = singletonCImpl;
            this.activityRetainedCImpl = activityRetainedCImpl;
            this.activityCImpl = activityCImpl;
        }
    }

    private static final class ActivityCImpl extends BaseApplication_HiltComponents.ActivityC {
        private final ActivityCImpl activityCImpl;
        private final ActivityRetainedCImpl activityRetainedCImpl;
        private final SingletonCImpl singletonCImpl;

        private ActivityCImpl(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl, Activity activityParam) {
            this.activityCImpl = this;
            this.singletonCImpl = singletonCImpl;
            this.activityRetainedCImpl = activityRetainedCImpl;
        }

        @Override // com.aipsoft.aipsoftconnect.MainActivity_GeneratedInjector
        public void injectMainActivity(MainActivity arg0) {
        }

        @Override // dagger.hilt.android.internal.lifecycle.DefaultViewModelFactories.ActivityEntryPoint
        public DefaultViewModelFactories.InternalFactoryFactory getHiltInternalFactoryFactory() {
            return DefaultViewModelFactories_InternalFactoryFactory_Factory.newInstance(Collections.emptySet(), new ViewModelCBuilder(this.singletonCImpl, this.activityRetainedCImpl));
        }

        @Override // dagger.hilt.android.internal.lifecycle.HiltViewModelFactory.ActivityCreatorEntryPoint
        public Set<String> getViewModelKeys() {
            return Collections.emptySet();
        }

        @Override // dagger.hilt.android.internal.lifecycle.HiltViewModelFactory.ActivityCreatorEntryPoint
        public ViewModelComponentBuilder getViewModelComponentBuilder() {
            return new ViewModelCBuilder(this.singletonCImpl, this.activityRetainedCImpl);
        }

        @Override // dagger.hilt.android.internal.managers.FragmentComponentManager.FragmentComponentBuilderEntryPoint
        public FragmentComponentBuilder fragmentComponentBuilder() {
            return new FragmentCBuilder(this.singletonCImpl, this.activityRetainedCImpl, this.activityCImpl);
        }

        @Override // dagger.hilt.android.internal.managers.ViewComponentManager.ViewComponentBuilderEntryPoint
        public ViewComponentBuilder viewComponentBuilder() {
            return new ViewCBuilder(this.singletonCImpl, this.activityRetainedCImpl, this.activityCImpl);
        }
    }

    private static final class ViewModelCImpl extends BaseApplication_HiltComponents.ViewModelC {
        private final ActivityRetainedCImpl activityRetainedCImpl;
        private final SingletonCImpl singletonCImpl;
        private final ViewModelCImpl viewModelCImpl;

        private ViewModelCImpl(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl, SavedStateHandle savedStateHandleParam, ViewModelLifecycle viewModelLifecycleParam) {
            this.viewModelCImpl = this;
            this.singletonCImpl = singletonCImpl;
            this.activityRetainedCImpl = activityRetainedCImpl;
        }

        @Override // dagger.hilt.android.internal.lifecycle.HiltViewModelFactory.ViewModelFactoriesEntryPoint
        public Map<String, Provider<ViewModel>> getHiltViewModelMap() {
            return Collections.emptyMap();
        }
    }

    private static final class ActivityRetainedCImpl extends BaseApplication_HiltComponents.ActivityRetainedC {
        private final ActivityRetainedCImpl activityRetainedCImpl;
        private Provider<ActivityRetainedLifecycle> provideActivityRetainedLifecycleProvider;
        private final SingletonCImpl singletonCImpl;

        private ActivityRetainedCImpl(SingletonCImpl singletonCImpl) {
            this.activityRetainedCImpl = this;
            this.singletonCImpl = singletonCImpl;
            initialize();
        }

        private void initialize() {
            this.provideActivityRetainedLifecycleProvider = DoubleCheck.provider(new SwitchingProvider(this.singletonCImpl, this.activityRetainedCImpl, 0));
        }

        @Override // dagger.hilt.android.internal.managers.ActivityComponentManager.ActivityComponentBuilderEntryPoint
        public ActivityComponentBuilder activityComponentBuilder() {
            return new ActivityCBuilder(this.singletonCImpl, this.activityRetainedCImpl);
        }

        @Override // dagger.hilt.android.internal.managers.ActivityRetainedComponentManager.ActivityRetainedLifecycleEntryPoint
        public ActivityRetainedLifecycle getActivityRetainedLifecycle() {
            return this.provideActivityRetainedLifecycleProvider.get();
        }

        private static final class SwitchingProvider<T> implements Provider<T> {
            private final ActivityRetainedCImpl activityRetainedCImpl;
            private final int id;
            private final SingletonCImpl singletonCImpl;

            SwitchingProvider(SingletonCImpl singletonCImpl, ActivityRetainedCImpl activityRetainedCImpl, int id) {
                this.singletonCImpl = singletonCImpl;
                this.activityRetainedCImpl = activityRetainedCImpl;
                this.id = id;
            }

            @Override // javax.inject.Provider
            public T get() {
                switch (this.id) {
                    case 0:
                        return (T) ActivityRetainedComponentManager_LifecycleModule_ProvideActivityRetainedLifecycleFactory.provideActivityRetainedLifecycle();
                    default:
                        throw new AssertionError(this.id);
                }
            }
        }
    }

    private static final class ServiceCImpl extends BaseApplication_HiltComponents.ServiceC {
        private Provider<NotificationCompat.Builder> provideBaseNotificationBuilderProvider;
        private Provider<FusedLocationProviderClient> provideFusedLocationProvidedClientProvider;
        private Provider<PendingIntent> provideMainActivityPendingIntentProvider;
        private final ServiceCImpl serviceCImpl;
        private final SingletonCImpl singletonCImpl;

        private ServiceCImpl(SingletonCImpl singletonCImpl, Service serviceParam) {
            this.serviceCImpl = this;
            this.singletonCImpl = singletonCImpl;
            initialize(serviceParam);
        }

        private void initialize(final Service serviceParam) {
            this.provideFusedLocationProvidedClientProvider = DoubleCheck.provider(new SwitchingProvider(this.singletonCImpl, this.serviceCImpl, 0));
            this.provideMainActivityPendingIntentProvider = DoubleCheck.provider(new SwitchingProvider(this.singletonCImpl, this.serviceCImpl, 2));
            this.provideBaseNotificationBuilderProvider = DoubleCheck.provider(new SwitchingProvider(this.singletonCImpl, this.serviceCImpl, 1));
        }

        @Override // com.aipsoft.aipsoftconnect.Service.TrackingService_GeneratedInjector
        public void injectTrackingService(TrackingService arg0) {
            injectTrackingService2(arg0);
        }

        private TrackingService injectTrackingService2(TrackingService instance) {
            TrackingService_MembersInjector.injectFusedLocationProviderClient(instance, this.provideFusedLocationProvidedClientProvider.get());
            TrackingService_MembersInjector.injectBaseNotificationBuilder(instance, this.provideBaseNotificationBuilderProvider.get());
            return instance;
        }

        private static final class SwitchingProvider<T> implements Provider<T> {
            private final int id;
            private final ServiceCImpl serviceCImpl;
            private final SingletonCImpl singletonCImpl;

            SwitchingProvider(SingletonCImpl singletonCImpl, ServiceCImpl serviceCImpl, int id) {
                this.singletonCImpl = singletonCImpl;
                this.serviceCImpl = serviceCImpl;
                this.id = id;
            }

            @Override // javax.inject.Provider
            public T get() {
                switch (this.id) {
                    case 0:
                        return (T) ServiceModule_ProvideFusedLocationProvidedClientFactory.provideFusedLocationProvidedClient(ApplicationContextModule_ProvideContextFactory.provideContext(this.singletonCImpl.applicationContextModule));
                    case 1:
                        return (T) ServiceModule_ProvideBaseNotificationBuilderFactory.provideBaseNotificationBuilder(ApplicationContextModule_ProvideContextFactory.provideContext(this.singletonCImpl.applicationContextModule), (PendingIntent) this.serviceCImpl.provideMainActivityPendingIntentProvider.get());
                    case 2:
                        return (T) ServiceModule_ProvideMainActivityPendingIntentFactory.provideMainActivityPendingIntent(ApplicationContextModule_ProvideContextFactory.provideContext(this.singletonCImpl.applicationContextModule));
                    default:
                        throw new AssertionError(this.id);
                }
            }
        }
    }

    private static final class SingletonCImpl extends BaseApplication_HiltComponents.SingletonC {
        private final ApplicationContextModule applicationContextModule;
        private final SingletonCImpl singletonCImpl;

        private SingletonCImpl(ApplicationContextModule applicationContextModuleParam) {
            this.singletonCImpl = this;
            this.applicationContextModule = applicationContextModuleParam;
        }

        @Override // com.aipsoft.aipsoftconnect.Service.BaseApplication_GeneratedInjector
        public void injectBaseApplication(BaseApplication baseApplication) {
        }

        @Override // dagger.hilt.android.flags.FragmentGetContextFix.FragmentGetContextFixEntryPoint
        public Set<Boolean> getDisableFragmentGetContextFix() {
            return Collections.emptySet();
        }

        @Override // dagger.hilt.android.internal.managers.ActivityRetainedComponentManager.ActivityRetainedComponentBuilderEntryPoint
        public ActivityRetainedComponentBuilder retainedComponentBuilder() {
            return new ActivityRetainedCBuilder(this.singletonCImpl);
        }

        @Override // dagger.hilt.android.internal.managers.ServiceComponentManager.ServiceComponentBuilderEntryPoint
        public ServiceComponentBuilder serviceComponentBuilder() {
            return new ServiceCBuilder(this.singletonCImpl);
        }
    }
}
