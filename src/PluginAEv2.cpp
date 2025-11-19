#include "PluginAE.h"
#include "PresetManagerV2.h"
#include "PresetUI.h"
#include <string.h>

static PresetManagerV2* g_preset_manager = nullptr;
static PresetUI* g_preset_ui = nullptr;

// Initialize preset manager and UI
static PF_Err InitPresetSystem(PF_InData* in_data)
{
    if (!g_preset_manager) {
        g_preset_manager = new PresetManagerV2();
    }

    if (!g_preset_ui) {
        g_preset_ui = new PresetUI();
        g_preset_ui->SetPresetManager(g_preset_manager);
        g_preset_ui->Initialize(in_data);
    }

    return PF_Err_NONE;
}

// About function
static PF_Err About(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output)
{
    AEGP_SuiteHandler suites(in_data->pica_basicP);

    suites.ANSICallbacksSuite1()->sprintf(
        out_data->return_msg,
        "%s v%d.%d.%d\r%s\r%s",
        PLUGIN_NAME,
        PLUGIN_MAJOR_VERSION,
        PLUGIN_MINOR_VERSION,
        PLUGIN_BUG_VERSION,
        "Advanced preset system with categories, search, and preview.",
        "Create, manage, and preview custom transitions, effects, and color grades.");

    return PF_Err_NONE;
}

// Global setup
static PF_Err GlobalSetup(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output)
{
    out_data->my_version = PF_VERSION(
        PLUGIN_MAJOR_VERSION,
        PLUGIN_MINOR_VERSION,
        PLUGIN_BUG_VERSION,
        PLUGIN_STAGE_VERSION,
        PLUGIN_BUILD_VERSION);

    out_data->out_flags = PF_OutFlag_DEEP_COLOR_AWARE |
                          PF_OutFlag_PIX_INDEPENDENT |
                          PF_OutFlag_CUSTOM_UI;

    out_data->out_flags2 = PF_OutFlag2_SUPPORTS_SMART_RENDER |
                           PF_OutFlag2_FLOAT_COLOR_AWARE |
                           PF_OutFlag2_PARAM_GROUP_START_COLLAPSED_FLAG;

    // Initialize preset system
    InitPresetSystem(in_data);

    return PF_Err_NONE;
}

// Global teardown
static PF_Err GlobalSetdown(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output)
{
    if (g_preset_ui) {
        g_preset_ui->Shutdown();
        delete g_preset_ui;
        g_preset_ui = nullptr;
    }

    if (g_preset_manager) {
        delete g_preset_manager;
        g_preset_manager = nullptr;
    }

    return PF_Err_NONE;
}

// Parameters setup
static PF_Err ParamsSetup(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output)
{
    PF_Err err = PF_Err_NONE;
    PF_ParamDef def;

    AEFX_CLR_STRUCT(def);

    // Category selector
    PF_ADD_POPUP(
        "Category",
        g_preset_manager ? g_preset_manager->GetCategoryCount() + 1 : 1,
        1,
        "All Categories",
        PLUGIN_PRESET_SELECTOR);

    // Preset selector (dynamic based on category)
    PF_ADD_POPUP(
        "Preset",
        g_preset_manager ? g_preset_manager->GetPresetCount() : 1,
        1,
        "None",
        PLUGIN_PRESET_SELECTOR + 1);

    // Search text (button to open search UI)
    PF_ADD_BUTTON(
        "Open Preset Manager",
        "Manage Presets",
        0,
        PF_ParamFlag_SUPERVISE,
        PLUGIN_PRESET_SELECTOR + 2);

    // Preview toggle
    PF_ADD_CHECKBOXX(
        "Preview Mode",
        FALSE,
        0,
        PLUGIN_PRESET_SELECTOR + 3);

    // Intensity slider
    PF_ADD_FLOAT_SLIDERX(
        "Intensity",
        0.0,
        100.0,
        0.0,
        100.0,
        50.0,
        PF_Precision_HUNDREDTHS,
        0,
        0,
        PLUGIN_INTENSITY);

    // Blend mode
    PF_ADD_POPUP(
        "Blend Mode",
        3,
        1,
        "Normal|Screen|Multiply",
        PLUGIN_BLEND_MODE);

    // Favorite toggle
    PF_ADD_CHECKBOXX(
        "Add to Favorites",
        FALSE,
        0,
        PLUGIN_PRESET_SELECTOR + 4);

    out_data->num_params = PLUGIN_NUM_PARAMS;

    return err;
}

// User changed parameter
static PF_Err UserChangedParam(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output,
    PF_UserChangedParamExtra *extra)
{
    PF_Err err = PF_Err_NONE;

    // Handle favorite toggle
    if (extra->param_index == PLUGIN_PRESET_SELECTOR + 4) {
        PF_ParamDef preset_param;
        AEFX_CLR_STRUCT(preset_param);

        ERR(PF_CHECKOUT_PARAM(
            in_data,
            PLUGIN_PRESET_SELECTOR + 1,
            in_data->current_time,
            in_data->time_step,
            in_data->time_scale,
            &preset_param));

        if (!err && g_preset_manager) {
            A_long preset_index = preset_param.u.pd.value - 1;
            PresetInfoEx* preset = g_preset_manager->GetPreset(preset_index);
            if (preset) {
                g_preset_manager->ToggleFavorite(preset->id);
            }
        }

        ERR2(PF_CHECKIN_PARAM(in_data, &preset_param));
    }

    return err;
}

// Update parameter UI
static PF_Err UpdateParameterUI(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output)
{
    PF_Err err = PF_Err_NONE;

    // Update preset popup based on selected category
    // This would typically be done in a separate UI update function

    return err;
}

// Handle UI events
static PF_Err HandleEvent(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output,
    PF_EventExtra *event_extra)
{
    PF_Err err = PF_Err_NONE;

    if (g_preset_ui) {
        err = g_preset_ui->HandleEvent(in_data, out_data, params, event_extra);
    }

    return err;
}

// Draw custom UI
static PF_Err DrawEvent(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output,
    PF_EventExtra *event_extra)
{
    PF_Err err = PF_Err_NONE;

    if (g_preset_ui) {
        err = g_preset_ui->DrawUI(in_data, out_data, params, event_extra);
    }

    return err;
}

// Render function
static PF_Err Render(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output)
{
    PF_Err err = PF_Err_NONE;

    // Get parameters
    PF_ParamDef category_param, preset_param, intensity_param, preview_param;

    AEFX_CLR_STRUCT(category_param);
    AEFX_CLR_STRUCT(preset_param);
    AEFX_CLR_STRUCT(intensity_param);
    AEFX_CLR_STRUCT(preview_param);

    ERR(PF_CHECKOUT_PARAM(in_data, PLUGIN_PRESET_SELECTOR,
        in_data->current_time, in_data->time_step, in_data->time_scale,
        &category_param));

    ERR(PF_CHECKOUT_PARAM(in_data, PLUGIN_PRESET_SELECTOR + 1,
        in_data->current_time, in_data->time_step, in_data->time_scale,
        &preset_param));

    ERR(PF_CHECKOUT_PARAM(in_data, PLUGIN_INTENSITY,
        in_data->current_time, in_data->time_step, in_data->time_scale,
        &intensity_param));

    ERR(PF_CHECKOUT_PARAM(in_data, PLUGIN_PRESET_SELECTOR + 3,
        in_data->current_time, in_data->time_step, in_data->time_scale,
        &preview_param));

    if (!err && g_preset_manager) {
        A_long preset_index = preset_param.u.pd.value - 1;
        PF_FpLong intensity = intensity_param.u.fs_d.value / 100.0;
        bool preview_mode = preview_param.u.bd.value != 0;

        PresetInfoEx* preset = g_preset_manager->GetPreset(preset_index);

        if (preset) {
            if (preview_mode && g_preset_ui) {
                // Use preview mode
                err = g_preset_ui->StartPreview(preset->id, intensity);
                if (!err) {
                    err = g_preset_manager->GeneratePreview(
                        in_data, out_data,
                        &params[PLUGIN_INPUT]->u.ld,
                        output,
                        preset->id,
                        intensity);
                }
            } else {
                // Normal render
                err = g_preset_manager->ApplyPreset(
                    in_data, out_data,
                    &params[PLUGIN_INPUT]->u.ld,
                    output,
                    preset,
                    intensity);
            }
        } else {
            // No preset selected, copy input to output
            ERR(PF_COPY(&params[PLUGIN_INPUT]->u.ld, output, NULL, NULL));
        }
    }

    // Checkin parameters
    ERR2(PF_CHECKIN_PARAM(in_data, &category_param));
    ERR2(PF_CHECKIN_PARAM(in_data, &preset_param));
    ERR2(PF_CHECKIN_PARAM(in_data, &intensity_param));
    ERR2(PF_CHECKIN_PARAM(in_data, &preview_param));

    return err;
}

// SmartRender
static PF_Err SmartRender(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_SmartRenderExtra *extra)
{
    PF_Err err = PF_Err_NONE;

    // Get callbacks
    PF_EffectWorld *input_worldP = NULL;
    PF_EffectWorld *output_worldP = NULL;

    ERR(extra->cb->checkout_layer_pixels(
        in_data->effect_ref,
        PLUGIN_INPUT,
        &input_worldP));

    ERR(extra->cb->checkout_output(
        in_data->effect_ref,
        &output_worldP));

    if (!err) {
        PF_ParamDef category_param, preset_param, intensity_param, preview_param;

        AEFX_CLR_STRUCT(category_param);
        AEFX_CLR_STRUCT(preset_param);
        AEFX_CLR_STRUCT(intensity_param);
        AEFX_CLR_STRUCT(preview_param);

        ERR(PF_CHECKOUT_PARAM(in_data, PLUGIN_PRESET_SELECTOR,
            in_data->current_time, in_data->time_step, in_data->time_scale,
            &category_param));

        ERR(PF_CHECKOUT_PARAM(in_data, PLUGIN_PRESET_SELECTOR + 1,
            in_data->current_time, in_data->time_step, in_data->time_scale,
            &preset_param));

        ERR(PF_CHECKOUT_PARAM(in_data, PLUGIN_INTENSITY,
            in_data->current_time, in_data->time_step, in_data->time_scale,
            &intensity_param));

        ERR(PF_CHECKOUT_PARAM(in_data, PLUGIN_PRESET_SELECTOR + 3,
            in_data->current_time, in_data->time_step, in_data->time_scale,
            &preview_param));

        if (!err && g_preset_manager) {
            A_long preset_index = preset_param.u.pd.value - 1;
            PF_FpLong intensity = intensity_param.u.fs_d.value / 100.0;
            bool preview_mode = preview_param.u.bd.value != 0;

            PresetInfoEx* preset = g_preset_manager->GetPreset(preset_index);

            if (preset) {
                if (preview_mode) {
                    err = g_preset_manager->GeneratePreview(
                        in_data, out_data,
                        input_worldP, output_worldP,
                        preset->id, intensity);
                } else {
                    err = g_preset_manager->ApplyPreset(
                        in_data, out_data,
                        input_worldP, output_worldP,
                        preset, intensity);
                }
            } else {
                ERR(PF_COPY(input_worldP, output_worldP, NULL, NULL));
            }
        }

        ERR2(PF_CHECKIN_PARAM(in_data, &category_param));
        ERR2(PF_CHECKIN_PARAM(in_data, &preset_param));
        ERR2(PF_CHECKIN_PARAM(in_data, &intensity_param));
        ERR2(PF_CHECKIN_PARAM(in_data, &preview_param));
    }

    return err;
}

// Sequence setup (for custom data)
static PF_Err SequenceSetup(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output)
{
    PF_Err err = PF_Err_NONE;

    // Allocate sequence data if needed
    GlobalData* seq_data = NULL;

    out_data->sequence_data = PF_NEW_HANDLE(sizeof(GlobalData));

    if (out_data->sequence_data) {
        seq_data = reinterpret_cast<GlobalData*>(
            PF_LOCK_HANDLE(out_data->sequence_data));

        if (seq_data) {
            memset(seq_data, 0, sizeof(GlobalData));
            PF_UNLOCK_HANDLE(out_data->sequence_data);
        }
    } else {
        err = PF_Err_OUT_OF_MEMORY;
    }

    return err;
}

// Sequence setdown
static PF_Err SequenceSetdown(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output)
{
    if (in_data->sequence_data) {
        PF_DISPOSE_HANDLE(in_data->sequence_data);
        out_data->sequence_data = NULL;
    }

    return PF_Err_NONE;
}

// Main entry point
DllExport PF_Err PluginMain(
    PF_Cmd cmd,
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output,
    void *extra)
{
    PF_Err err = PF_Err_NONE;

    try {
        switch (cmd) {
            case PF_Cmd_ABOUT:
                err = About(in_data, out_data, params, output);
                break;

            case PF_Cmd_GLOBAL_SETUP:
                err = GlobalSetup(in_data, out_data, params, output);
                break;

            case PF_Cmd_GLOBAL_SETDOWN:
                err = GlobalSetdown(in_data, out_data, params, output);
                break;

            case PF_Cmd_PARAMS_SETUP:
                err = ParamsSetup(in_data, out_data, params, output);
                break;

            case PF_Cmd_SEQUENCE_SETUP:
                err = SequenceSetup(in_data, out_data, params, output);
                break;

            case PF_Cmd_SEQUENCE_SETDOWN:
                err = SequenceSetdown(in_data, out_data, params, output);
                break;

            case PF_Cmd_RENDER:
                err = Render(in_data, out_data, params, output);
                break;

            case PF_Cmd_SMART_PRE_RENDER:
                // Handled by AE
                break;

            case PF_Cmd_SMART_RENDER:
                err = SmartRender(in_data, out_data,
                    reinterpret_cast<PF_SmartRenderExtra*>(extra));
                break;

            case PF_Cmd_EVENT:
                err = HandleEvent(in_data, out_data, params, output,
                    reinterpret_cast<PF_EventExtra*>(extra));
                break;

            case PF_Cmd_USER_CHANGED_PARAM:
                err = UserChangedParam(in_data, out_data, params, output,
                    reinterpret_cast<PF_UserChangedParamExtra*>(extra));
                break;

            case PF_Cmd_UPDATE_PARAMS_UI:
                err = UpdateParameterUI(in_data, out_data, params, output);
                break;

            default:
                break;
        }
    }
    catch (PF_Err &thrown_err) {
        err = thrown_err;
    }

    return err;
}
