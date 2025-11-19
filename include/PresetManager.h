#ifndef PRESET_MANAGER_H
#define PRESET_MANAGER_H

#include "PluginAE.h"
#include <vector>
#include <string>

class PresetManager {
public:
    PresetManager();
    ~PresetManager();

    // Load presets from file
    bool LoadPresets(const char* preset_path);

    // Get preset by index
    PresetInfo* GetPreset(A_long index);

    // Get preset count
    A_long GetPresetCount() const;

    // Get preset names for UI
    void GetPresetNames(std::vector<std::string>& names);

    // Apply preset to image
    PF_Err ApplyPreset(
        PF_InData* in_data,
        PF_OutData* out_data,
        PF_LayerDef* input,
        PF_LayerDef* output,
        PresetInfo* preset,
        PF_FpLong intensity);

private:
    std::vector<PresetInfo> presets_;

    // Preset application methods
    PF_Err ApplyTransition(PF_InData* in_data, PF_OutData* out_data,
                          PF_LayerDef* input, PF_LayerDef* output,
                          PresetInfo* preset, PF_FpLong intensity);

    PF_Err ApplyEffect(PF_InData* in_data, PF_OutData* out_data,
                      PF_LayerDef* input, PF_LayerDef* output,
                      PresetInfo* preset, PF_FpLong intensity);

    PF_Err ApplyColorGrade(PF_InData* in_data, PF_OutData* out_data,
                          PF_LayerDef* input, PF_LayerDef* output,
                          PresetInfo* preset, PF_FpLong intensity);

    // Initialize default presets
    void InitializeDefaultPresets();
};

#endif // PRESET_MANAGER_H
