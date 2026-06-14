package com.google.android.datatransport.runtime.scheduling.jobscheduling;

import com.google.android.datatransport.Priority;
import com.google.android.datatransport.runtime.scheduling.jobscheduling.SchedulerConfig;
import com.google.android.datatransport.runtime.time.Clock;
import java.util.Map;

/* JADX INFO: loaded from: classes.dex */
final class AutoValue_SchedulerConfig extends SchedulerConfig {
    private final Clock clock;
    private final Map<Priority, SchedulerConfig.ConfigValue> values;

    AutoValue_SchedulerConfig(Clock clock, Map<Priority, SchedulerConfig.ConfigValue> values) {
        if (clock == null) {
            throw new NullPointerException("Null clock");
        }
        this.clock = clock;
        if (values == null) {
            throw new NullPointerException("Null values");
        }
        this.values = values;
    }

    @Override // com.google.android.datatransport.runtime.scheduling.jobscheduling.SchedulerConfig
    Clock getClock() {
        return this.clock;
    }

    @Override // com.google.android.datatransport.runtime.scheduling.jobscheduling.SchedulerConfig
    Map<Priority, SchedulerConfig.ConfigValue> getValues() {
        return this.values;
    }

    public String toString() {
        return "SchedulerConfig{clock=" + this.clock + ", values=" + this.values + "}";
    }

    public boolean equals(Object o) {
        if (o == this) {
            return true;
        }
        if (!(o instanceof SchedulerConfig)) {
            return false;
        }
        SchedulerConfig that = (SchedulerConfig) o;
        return this.clock.equals(that.getClock()) && this.values.equals(that.getValues());
    }

    public int hashCode() {
        int h$ = 1 * 1000003;
        return ((h$ ^ this.clock.hashCode()) * 1000003) ^ this.values.hashCode();
    }
}
