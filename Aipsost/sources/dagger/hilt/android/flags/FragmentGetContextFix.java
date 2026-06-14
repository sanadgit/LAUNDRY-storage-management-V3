package dagger.hilt.android.flags;

import android.content.Context;
import dagger.Module;
import dagger.hilt.android.EntryPointAccessors;
import dagger.hilt.internal.Preconditions;
import dagger.multibindings.Multibinds;
import java.lang.annotation.ElementType;
import java.lang.annotation.Target;
import java.util.Set;
import javax.inject.Qualifier;

/* JADX INFO: loaded from: classes11.dex */
public final class FragmentGetContextFix {

    @Target({ElementType.METHOD, ElementType.PARAMETER, ElementType.FIELD})
    @Qualifier
    public @interface DisableFragmentGetContextFix {
    }

    public interface FragmentGetContextFixEntryPoint {
        Set<Boolean> getDisableFragmentGetContextFix();
    }

    public static boolean isFragmentGetContextFixDisabled(Context context) {
        Set<Boolean> flagSet = ((FragmentGetContextFixEntryPoint) EntryPointAccessors.fromApplication(context, FragmentGetContextFixEntryPoint.class)).getDisableFragmentGetContextFix();
        Preconditions.checkState(flagSet.size() <= 1, "Cannot bind the flag @DisableFragmentGetContextFix more than once.", new Object[0]);
        if (flagSet.isEmpty()) {
            return true;
        }
        return flagSet.iterator().next().booleanValue();
    }

    @Module
    static abstract class FragmentGetContextFixModule {
        @Multibinds
        abstract Set<Boolean> disableFragmentGetContextFix();

        FragmentGetContextFixModule() {
        }
    }

    private FragmentGetContextFix() {
    }
}
