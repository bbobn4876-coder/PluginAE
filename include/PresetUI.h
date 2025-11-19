#ifndef PRESET_UI_H
#define PRESET_UI_H

#include "PluginAE.h"
#include "PresetManagerV2.h"
#include "AE_EffectUI.h"

// UI Panel state
typedef struct {
    bool is_visible;
    bool is_preview_mode;
    A_long selected_preset_id;
    A_long selected_category_index;
    char search_text[256];
    bool show_favorites_only;
    PresetType type_filter;
    bool use_type_filter;
} UIState;

// Preview state
typedef struct {
    bool is_active;
    PF_LayerDef* preview_buffer;
    A_long preview_preset_id;
    PF_FpLong preview_intensity;
    bool needs_update;
} PreviewState;

class PresetUI {
public:
    PresetUI();
    ~PresetUI();

    // UI initialization
    PF_Err Initialize(PF_InData* in_data);
    PF_Err Shutdown();

    // UI drawing
    PF_Err DrawUI(
        PF_InData* in_data,
        PF_OutData* out_data,
        PF_ParamDef* params[],
        PF_EventExtra* event_extra);

    // Event handling
    PF_Err HandleEvent(
        PF_InData* in_data,
        PF_OutData* out_data,
        PF_ParamDef* params[],
        PF_EventExtra* event_extra);

    // UI state management
    void SetPresetManager(PresetManagerV2* manager);
    void UpdatePresetList();
    void UpdateCategoryList();

    // Preview management
    PF_Err StartPreview(A_long preset_id, PF_FpLong intensity);
    PF_Err StopPreview();
    PF_Err UpdatePreview();
    bool IsPreviewActive() const { return preview_state_.is_active; }

    // Selection
    void SelectPreset(A_long preset_id);
    void SelectCategory(A_long category_index);
    A_long GetSelectedPresetID() const { return ui_state_.selected_preset_id; }

    // Search and filter
    void SetSearchText(const char* text);
    void SetCategoryFilter(A_long category_index);
    void SetTypeFilter(PresetType type, bool enabled);
    void ToggleFavoritesOnly();
    void ApplyFilters();

private:
    PresetManagerV2* preset_manager_;
    UIState ui_state_;
    PreviewState preview_state_;

    std::vector<A_long> filtered_presets_;
    std::vector<CategoryInfo> categories_;

    // UI drawing helpers
    void DrawPresetList(PF_EventExtra* event_extra);
    void DrawCategoryList(PF_EventExtra* event_extra);
    void DrawSearchBar(PF_EventExtra* event_extra);
    void DrawPreviewPanel(PF_EventExtra* event_extra);
    void DrawPresetDetails(PF_EventExtra* event_extra);
    void DrawControls(PF_EventExtra* event_extra);

    // Event handlers
    void OnPresetSelected(A_long preset_id);
    void OnCategorySelected(A_long category_index);
    void OnSearchChanged(const char* text);
    void OnPreviewToggled();
    void OnFavoriteToggled();
    void OnApplyClicked();

    // Helper methods
    void ClearPreview();
    void RefreshFilteredList();
};

#endif // PRESET_UI_H
