#ifndef PLUGIN_AE_H
#define PLUGIN_AE_H

#include "AEConfig.h"
#include "entry.h"
#include "AE_Effect.h"
#include "AE_EffectCB.h"
#include "AE_Macros.h"
#include "Param_Utils.h"
#include "AE_EffectCBSuites.h"
#include "String_Utils.h"
#include "AE_GeneralPlug.h"
#include "AEFX_ChannelDepthTpl.h"
#include "AEGP_SuiteHandler.h"

#define PLUGIN_NAME "PluginAE Presets"
#define PLUGIN_MAJOR_VERSION 1
#define PLUGIN_MINOR_VERSION 0
#define PLUGIN_BUG_VERSION 0
#define PLUGIN_STAGE_VERSION PF_Stage_DEVELOP
#define PLUGIN_BUILD_VERSION 1

// Parameter indices
enum {
    PLUGIN_INPUT = 0,
    PLUGIN_PRESET_SELECTOR,
    PLUGIN_INTENSITY,
    PLUGIN_BLEND_MODE,
    PLUGIN_NUM_PARAMS
};

// Preset types
enum PresetType {
    PRESET_TRANSITION = 0,
    PRESET_EFFECT,
    PRESET_COLOR,
    PRESET_CUSTOM
};

// Preset structure
typedef struct {
    char name[256];
    PresetType type;
    A_long id;
    PF_FpLong default_intensity;
    void* data;  // Custom preset data
} PresetInfo;

// Global data structure
typedef struct {
    PF_FpLong intensity;
    A_long preset_index;
    A_long blend_mode;
} GlobalData;

// Function prototypes
#ifdef __cplusplus
extern "C" {
#endif

DllExport PF_Err
PluginMain(
    PF_Cmd cmd,
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output,
    void *extra);

#ifdef __cplusplus
}
#endif

#endif // PLUGIN_AE_H
