package com.aipsoft.aipsoftconnect.databinding;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.TextView;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.viewbinding.ViewBinding;
import androidx.viewbinding.ViewBindings;
import com.aipsoft.aipsoftconnect.R;

/* JADX INFO: loaded from: classes3.dex */
public final class ActivitySettingsBinding implements ViewBinding {
    public final ImageView close;
    public final RadioButton defaultScreen;
    public final RadioButton disable;
    public final RadioButton enable;
    public final RadioButton fullScreen;
    public final RadioGroup fullScreenGroup;
    public final LinearLayout fullScreenLayout;
    public final LinearLayout headingLayout;
    public final RadioButton landscape;
    public final RadioButton portrait;
    public final LinearLayout printSettings;
    public final RadioGroup radioGroup;
    public final LinearLayout radioLayout;
    public final RadioGroup radioScreenGroup;
    public final LinearLayout radioScreenLayout;
    private final ConstraintLayout rootView;
    public final TextView title;

    private ActivitySettingsBinding(ConstraintLayout rootView, ImageView close, RadioButton defaultScreen, RadioButton disable, RadioButton enable, RadioButton fullScreen, RadioGroup fullScreenGroup, LinearLayout fullScreenLayout, LinearLayout headingLayout, RadioButton landscape, RadioButton portrait, LinearLayout printSettings, RadioGroup radioGroup, LinearLayout radioLayout, RadioGroup radioScreenGroup, LinearLayout radioScreenLayout, TextView title) {
        this.rootView = rootView;
        this.close = close;
        this.defaultScreen = defaultScreen;
        this.disable = disable;
        this.enable = enable;
        this.fullScreen = fullScreen;
        this.fullScreenGroup = fullScreenGroup;
        this.fullScreenLayout = fullScreenLayout;
        this.headingLayout = headingLayout;
        this.landscape = landscape;
        this.portrait = portrait;
        this.printSettings = printSettings;
        this.radioGroup = radioGroup;
        this.radioLayout = radioLayout;
        this.radioScreenGroup = radioScreenGroup;
        this.radioScreenLayout = radioScreenLayout;
        this.title = title;
    }

    @Override // androidx.viewbinding.ViewBinding
    public ConstraintLayout getRoot() {
        return this.rootView;
    }

    public static ActivitySettingsBinding inflate(LayoutInflater inflater) {
        return inflate(inflater, null, false);
    }

    public static ActivitySettingsBinding inflate(LayoutInflater inflater, ViewGroup parent, boolean attachToParent) {
        View root = inflater.inflate(R.layout.activity_settings, parent, false);
        if (attachToParent) {
            parent.addView(root);
        }
        return bind(root);
    }

    public static ActivitySettingsBinding bind(View rootView) {
        int id = R.id.close;
        ImageView close = (ImageView) ViewBindings.findChildViewById(rootView, id);
        if (close != null) {
            id = R.id.default_screen;
            RadioButton defaultScreen = (RadioButton) ViewBindings.findChildViewById(rootView, id);
            if (defaultScreen != null) {
                id = R.id.disable;
                RadioButton disable = (RadioButton) ViewBindings.findChildViewById(rootView, id);
                if (disable != null) {
                    id = R.id.enable;
                    RadioButton enable = (RadioButton) ViewBindings.findChildViewById(rootView, id);
                    if (enable != null) {
                        id = R.id.full_screen;
                        RadioButton fullScreen = (RadioButton) ViewBindings.findChildViewById(rootView, id);
                        if (fullScreen != null) {
                            id = R.id.fullScreenGroup;
                            RadioGroup fullScreenGroup = (RadioGroup) ViewBindings.findChildViewById(rootView, id);
                            if (fullScreenGroup != null) {
                                id = R.id.fullScreenLayout;
                                LinearLayout fullScreenLayout = (LinearLayout) ViewBindings.findChildViewById(rootView, id);
                                if (fullScreenLayout != null) {
                                    id = R.id.heading_layout;
                                    LinearLayout headingLayout = (LinearLayout) ViewBindings.findChildViewById(rootView, id);
                                    if (headingLayout != null) {
                                        id = R.id.landscape;
                                        RadioButton landscape = (RadioButton) ViewBindings.findChildViewById(rootView, id);
                                        if (landscape != null) {
                                            id = R.id.portrait;
                                            RadioButton portrait = (RadioButton) ViewBindings.findChildViewById(rootView, id);
                                            if (portrait != null) {
                                                id = R.id.print_settings;
                                                LinearLayout printSettings = (LinearLayout) ViewBindings.findChildViewById(rootView, id);
                                                if (printSettings != null) {
                                                    id = R.id.radioGroup;
                                                    RadioGroup radioGroup = (RadioGroup) ViewBindings.findChildViewById(rootView, id);
                                                    if (radioGroup != null) {
                                                        id = R.id.radioLayout;
                                                        LinearLayout radioLayout = (LinearLayout) ViewBindings.findChildViewById(rootView, id);
                                                        if (radioLayout != null) {
                                                            id = R.id.radioScreenGroup;
                                                            RadioGroup radioScreenGroup = (RadioGroup) ViewBindings.findChildViewById(rootView, id);
                                                            if (radioScreenGroup != null) {
                                                                id = R.id.radioScreenLayout;
                                                                LinearLayout radioScreenLayout = (LinearLayout) ViewBindings.findChildViewById(rootView, id);
                                                                if (radioScreenLayout != null) {
                                                                    id = R.id.title;
                                                                    TextView title = (TextView) ViewBindings.findChildViewById(rootView, id);
                                                                    if (title != null) {
                                                                        return new ActivitySettingsBinding((ConstraintLayout) rootView, close, defaultScreen, disable, enable, fullScreen, fullScreenGroup, fullScreenLayout, headingLayout, landscape, portrait, printSettings, radioGroup, radioLayout, radioScreenGroup, radioScreenLayout, title);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        String missingId = rootView.getResources().getResourceName(id);
        throw new NullPointerException("Missing required view with ID: ".concat(missingId));
    }
}
