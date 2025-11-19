#include "PresetUI.h"
#include <cstring>

PresetUI::PresetUI()
    : preset_manager_(nullptr)
{
    memset(&ui_state_, 0, sizeof(UIState));
    memset(&preview_state_, 0, sizeof(PreviewState));

    ui_state_.selected_preset_id = -1;
    ui_state_.selected_category_index = 0;
    ui_state_.type_filter = PRESET_TRANSITION;
    ui_state_.use_type_filter = false;
}

PresetUI::~PresetUI()
{
    ClearPreview();
}

PF_Err PresetUI::Initialize(PF_InData* in_data)
{
    ui_state_.is_visible = false;
    ui_state_.is_preview_mode = false;

    return PF_Err_NONE;
}

PF_Err PresetUI::Shutdown()
{
    ClearPreview();
    return PF_Err_NONE;
}

void PresetUI::SetPresetManager(PresetManagerV2* manager)
{
    preset_manager_ = manager;

    if (preset_manager_) {
        UpdateCategoryList();
        UpdatePresetList();
    }
}

void PresetUI::UpdatePresetList()
{
    if (!preset_manager_) return;

    ApplyFilters();
}

void PresetUI::UpdateCategoryList()
{
    if (!preset_manager_) return;

    categories_.clear();
    preset_manager_->GetCategories(categories_);
}

PF_Err PresetUI::DrawUI(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_ParamDef* params[],
    PF_EventExtra* event_extra)
{
    PF_Err err = PF_Err_NONE;

    if (!ui_state_.is_visible || !event_extra) {
        return err;
    }

    // Draw UI components
    // Note: Actual drawing would use AE's drawing suites
    // This is a simplified version

    DrawPresetList(event_extra);
    DrawCategoryList(event_extra);
    DrawSearchBar(event_extra);

    if (ui_state_.is_preview_mode) {
        DrawPreviewPanel(event_extra);
    }

    DrawPresetDetails(event_extra);
    DrawControls(event_extra);

    return err;
}

PF_Err PresetUI::HandleEvent(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_ParamDef* params[],
    PF_EventExtra* event_extra)
{
    PF_Err err = PF_Err_NONE;

    if (!event_extra) return err;

    // Handle mouse clicks, keyboard input, etc.
    // This is simplified - actual implementation would handle
    // specific event types

    switch (event_extra->e_type) {
        case PF_Event_MOUSE_DOWN:
            // Handle click events
            break;

        case PF_Event_KEY_DOWN:
            // Handle keyboard input
            break;

        case PF_Event_DRAW:
            err = DrawUI(in_data, out_data, params, event_extra);
            break;

        default:
            break;
    }

    return err;
}

PF_Err PresetUI::StartPreview(A_long preset_id, PF_FpLong intensity)
{
    if (!preset_manager_) {
        return PF_Err_BAD_CALLBACK_PARAM;
    }

    PresetInfoEx* preset = preset_manager_->GetPresetByID(preset_id);
    if (!preset) {
        return PF_Err_BAD_CALLBACK_PARAM;
    }

    preview_state_.is_active = true;
    preview_state_.preview_preset_id = preset_id;
    preview_state_.preview_intensity = intensity;
    preview_state_.needs_update = true;

    ui_state_.is_preview_mode = true;

    return PF_Err_NONE;
}

PF_Err PresetUI::StopPreview()
{
    ClearPreview();
    preview_state_.is_active = false;
    ui_state_.is_preview_mode = false;

    return PF_Err_NONE;
}

PF_Err PresetUI::UpdatePreview()
{
    if (!preview_state_.is_active || !preview_state_.needs_update) {
        return PF_Err_NONE;
    }

    // Preview update would happen during render
    preview_state_.needs_update = false;

    return PF_Err_NONE;
}

void PresetUI::SelectPreset(A_long preset_id)
{
    ui_state_.selected_preset_id = preset_id;
    OnPresetSelected(preset_id);
}

void PresetUI::SelectCategory(A_long category_index)
{
    ui_state_.selected_category_index = category_index;
    OnCategorySelected(category_index);
}

void PresetUI::SetSearchText(const char* text)
{
    if (text && strlen(text) < sizeof(ui_state_.search_text)) {
        strcpy(ui_state_.search_text, text);
        ApplyFilters();
    }
}

void PresetUI::SetCategoryFilter(A_long category_index)
{
    ui_state_.selected_category_index = category_index;
    ApplyFilters();
}

void PresetUI::SetTypeFilter(PresetType type, bool enabled)
{
    ui_state_.type_filter = type;
    ui_state_.use_type_filter = enabled;
    ApplyFilters();
}

void PresetUI::ToggleFavoritesOnly()
{
    ui_state_.show_favorites_only = !ui_state_.show_favorites_only;
    ApplyFilters();
}

void PresetUI::ApplyFilters()
{
    if (!preset_manager_) return;

    SearchFilter filter;
    memset(&filter, 0, sizeof(SearchFilter));

    strcpy(filter.search_text, ui_state_.search_text);
    filter.favorites_only = ui_state_.show_favorites_only;
    filter.use_type_filter = ui_state_.use_type_filter;
    filter.type_filter = ui_state_.type_filter;

    if (ui_state_.selected_category_index > 0 &&
        ui_state_.selected_category_index <= static_cast<A_long>(categories_.size())) {
        filter.use_category_filter = true;
        strcpy(filter.category_filter,
               categories_[ui_state_.selected_category_index - 1].name);
    } else {
        filter.use_category_filter = false;
    }

    preset_manager_->SearchPresets(filter, filtered_presets_);
    RefreshFilteredList();
}

void PresetUI::RefreshFilteredList()
{
    // Update UI to show filtered presets
    // This would refresh the preset list widget
}

void PresetUI::ClearPreview()
{
    if (preview_state_.preview_buffer) {
        // Free preview buffer
        preview_state_.preview_buffer = nullptr;
    }

    preview_state_.is_active = false;
    preview_state_.preview_preset_id = -1;
    preview_state_.preview_intensity = 0.0;
    preview_state_.needs_update = false;
}

// UI Drawing Methods (simplified - actual implementation would use AE drawing suites)

void PresetUI::DrawPresetList(PF_EventExtra* event_extra)
{
    // Draw list of presets
    // In actual implementation, this would use PF_EffectCustomUISuite
    // to draw the preset list with proper AE styling
}

void PresetUI::DrawCategoryList(PF_EventExtra* event_extra)
{
    // Draw category list
}

void PresetUI::DrawSearchBar(PF_EventExtra* event_extra)
{
    // Draw search input field
}

void PresetUI::DrawPreviewPanel(PF_EventExtra* event_extra)
{
    // Draw preview panel with preview image
}

void PresetUI::DrawPresetDetails(PF_EventExtra* event_extra)
{
    // Draw selected preset details (name, description, tags, etc.)
}

void PresetUI::DrawControls(PF_EventExtra* event_extra)
{
    // Draw control buttons (Apply, Cancel, etc.)
}

// Event Handlers

void PresetUI::OnPresetSelected(A_long preset_id)
{
    if (!preset_manager_) return;

    PresetInfoEx* preset = preset_manager_->GetPresetByID(preset_id);
    if (preset) {
        // Update UI to show preset details
        // If preview mode is on, generate preview
        if (ui_state_.is_preview_mode) {
            StartPreview(preset_id, preset->default_intensity);
        }
    }
}

void PresetUI::OnCategorySelected(A_long category_index)
{
    ui_state_.selected_category_index = category_index;
    ApplyFilters();
}

void PresetUI::OnSearchChanged(const char* text)
{
    SetSearchText(text);
}

void PresetUI::OnPreviewToggled()
{
    if (ui_state_.is_preview_mode) {
        StopPreview();
    } else if (ui_state_.selected_preset_id >= 0) {
        PresetInfoEx* preset = preset_manager_->GetPresetByID(
            ui_state_.selected_preset_id);
        if (preset) {
            StartPreview(ui_state_.selected_preset_id,
                        preset->default_intensity);
        }
    }
}

void PresetUI::OnFavoriteToggled()
{
    if (!preset_manager_ || ui_state_.selected_preset_id < 0) return;

    preset_manager_->ToggleFavorite(ui_state_.selected_preset_id);
    RefreshFilteredList();
}

void PresetUI::OnApplyClicked()
{
    // Apply the selected preset
    // This would update the effect parameters
    StopPreview();
}
