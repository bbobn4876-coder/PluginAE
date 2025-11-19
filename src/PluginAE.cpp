#include "PluginAE.h"
#include "PresetManager.h"
#include <string.h>

static PresetManager* g_preset_manager = nullptr;

// Initialize preset manager
static PF_Err InitPresetManager()
{
    if (!g_preset_manager) {
        g_preset_manager = new PresetManager();
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
        "%s v%d.%d.%d\r%s",
        PLUGIN_NAME,
        PLUGIN_MAJOR_VERSION,
        PLUGIN_MINOR_VERSION,
        PLUGIN_BUG_VERSION,
        "Plugin with customizable presets for transitions, effects, and color grading.");

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
                          PF_OutFlag_PIX_INDEPENDENT;

    out_data->out_flags2 = PF_OutFlag2_SUPPORTS_SMART_RENDER |
                           PF_OutFlag2_FLOAT_COLOR_AWARE;

    // Initialize preset manager
    InitPresetManager();

    return PF_Err_NONE;
}

// Global teardown
static PF_Err GlobalSetdown(
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output)
{
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

    // Preset selector
    PF_ADD_POPUP(
        "Preset",
        g_preset_manager ? g_preset_manager->GetPresetCount() : 1,
        1,
        "None",
        PLUGIN_PRESET_SELECTOR);

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

    out_data->num_params = PLUGIN_NUM_PARAMS;

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
    PF_ParamDef preset_param;
    PF_ParamDef intensity_param;

    AEFX_CLR_STRUCT(preset_param);
    AEFX_CLR_STRUCT(intensity_param);

    ERR(PF_CHECKOUT_PARAM(
        in_data,
        PLUGIN_PRESET_SELECTOR,
        in_data->current_time,
        in_data->time_step,
        in_data->time_scale,
        &preset_param));

    ERR(PF_CHECKOUT_PARAM(
        in_data,
        PLUGIN_INTENSITY,
        in_data->current_time,
        in_data->time_step,
        in_data->time_scale,
        &intensity_param));

    if (!err && g_preset_manager) {
        A_long preset_index = preset_param.u.pd.value - 1;
        PF_FpLong intensity = intensity_param.u.fs_d.value / 100.0;

        PresetInfo* preset = g_preset_manager->GetPreset(preset_index);

        if (preset) {
            err = g_preset_manager->ApplyPreset(
                in_data,
                out_data,
                &params[PLUGIN_INPUT]->u.ld,
                output,
                preset,
                intensity);
        } else {
            // No preset selected, copy input to output
            ERR(PF_COPY(&params[PLUGIN_INPUT]->u.ld, output, NULL, NULL));
        }
    }

    // Checkin parameters
    ERR2(PF_CHECKIN_PARAM(in_data, &preset_param));
    ERR2(PF_CHECKIN_PARAM(in_data, &intensity_param));

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

    ERR((extra->cb->checkout_layer_pixels(
        in_data->effect_ref,
        PLUGIN_INPUT,
        &input_worldP)));

    ERR(extra->cb->checkout_output(
        in_data->effect_ref,
        &output_worldP));

    if (!err) {
        PF_ParamDef preset_param, intensity_param;

        AEFX_CLR_STRUCT(preset_param);
        AEFX_CLR_STRUCT(intensity_param);

        ERR(PF_CHECKOUT_PARAM(
            in_data,
            PLUGIN_PRESET_SELECTOR,
            in_data->current_time,
            in_data->time_step,
            in_data->time_scale,
            &preset_param));

        ERR(PF_CHECKOUT_PARAM(
            in_data,
            PLUGIN_INTENSITY,
            in_data->current_time,
            in_data->time_step,
            in_data->time_scale,
            &intensity_param));

        if (!err && g_preset_manager) {
            A_long preset_index = preset_param.u.pd.value - 1;
            PF_FpLong intensity = intensity_param.u.fs_d.value / 100.0;

            PresetInfo* preset = g_preset_manager->GetPreset(preset_index);

            if (preset) {
                err = g_preset_manager->ApplyPreset(
                    in_data,
                    out_data,
                    input_worldP,
                    output_worldP,
                    preset,
                    intensity);
            } else {
                ERR(PF_COPY(input_worldP, output_worldP, NULL, NULL));
            }
        }

        ERR2(PF_CHECKIN_PARAM(in_data, &preset_param));
        ERR2(PF_CHECKIN_PARAM(in_data, &intensity_param));
    }

    return err;
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

            default:
                break;
        }
    }
    catch (PF_Err &thrown_err) {
        err = thrown_err;
    }

    return err;
}
