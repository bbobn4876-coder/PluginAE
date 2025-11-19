#include "AEConfig.h"
#include "AE_EffectVers.h"

#ifndef AE_OS_WIN
    #include "AE_General.r"
#endif

resource 'PiPL' (16000) {
    {
        Kind {
            AEEffect
        },
        Name {
            "PluginAE Presets"
        },
        Category {
            "Custom"
        },
#ifdef AE_OS_WIN
    #ifdef AE_PROC_INTELx64
        CodeWin64X86 {"PluginMain"},
    #endif
#else
    #ifdef AE_OS_MAC
        CodeMachOPowerPC {"PluginMain"},
        CodeMacIntel32 {"PluginMain"},
        CodeMacIntel64 {"PluginMain"},
        CodeMacARM64 {"PluginMain"},
    #endif
#endif
        AE_PiPL_Version {
            2,
            0
        },
        AE_Effect_Spec_Version {
            PF_PLUG_IN_VERSION,
            PF_PLUG_IN_SUBVERS
        },
        AE_Effect_Version {
            524289
        },
        AE_Effect_Info_Flags {
            0
        },
        AE_Effect_Global_OutFlags {
            0x02000000  // PF_OutFlag_DEEP_COLOR_AWARE
        },
        AE_Effect_Global_OutFlags_2 {
            0x00000080  // PF_OutFlag2_FLOAT_COLOR_AWARE
        },
        AE_Effect_Match_Name {
            "PluginAE_Presets"
        },
        AE_Reserved_Info {
            0
        }
    }
};
