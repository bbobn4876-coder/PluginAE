#ifndef PRESET_MANAGER_V2_H
#define PRESET_MANAGER_V2_H

#include "PluginAE.h"
#include <vector>
#include <string>
#include <map>
#include <set>

// Extended preset info with category support
typedef struct {
    char name[256];
    char category[128];
    char description[512];
    char tags[10][64];
    int tag_count;
    PresetType type;
    A_long id;
    PF_FpLong default_intensity;
    bool is_favorite;
    char author[128];
    char version[32];
    void* data;
} PresetInfoEx;

// Category information
typedef struct {
    char name[128];
    char description[256];
    int preset_count;
    bool is_custom;
} CategoryInfo;

// Search filter
typedef struct {
    char search_text[256];
    PresetType type_filter;
    char category_filter[128];
    bool favorites_only;
    bool use_type_filter;
    bool use_category_filter;
} SearchFilter;

class PresetManagerV2 {
public:
    PresetManagerV2();
    ~PresetManagerV2();

    // Preset loading and management
    bool LoadPresets(const char* preset_path);
    bool LoadPresetFromJSON(const char* json_path);
    bool SavePreset(PresetInfoEx* preset, const char* output_path);
    bool DeletePreset(A_long preset_id);
    bool ReloadPresets();

    // Category management
    bool CreateCategory(const char* name, const char* description);
    bool DeleteCategory(const char* name);
    bool RenameCategory(const char* old_name, const char* new_name);
    void GetCategories(std::vector<CategoryInfo>& categories);
    A_long GetCategoryPresetCount(const char* category);

    // Preset access
    PresetInfoEx* GetPreset(A_long index);
    PresetInfoEx* GetPresetByID(A_long id);
    PresetInfoEx* GetPresetByName(const char* name);
    A_long GetPresetCount() const;

    // Search and filtering
    void SearchPresets(const SearchFilter& filter, std::vector<A_long>& results);
    void FilterByCategory(const char* category, std::vector<A_long>& results);
    void FilterByType(PresetType type, std::vector<A_long>& results);
    void FilterByTags(const char** tags, int tag_count, std::vector<A_long>& results);

    // Favorites
    bool ToggleFavorite(A_long preset_id);
    void GetFavorites(std::vector<A_long>& favorites);

    // UI support
    void GetPresetNames(std::vector<std::string>& names);
    void GetPresetNamesForCategory(const char* category, std::vector<std::string>& names);

    // Preview functionality
    PF_Err GeneratePreview(
        PF_InData* in_data,
        PF_OutData* out_data,
        PF_LayerDef* input,
        PF_LayerDef* output,
        A_long preset_id,
        PF_FpLong intensity);

    // Apply preset to image
    PF_Err ApplyPreset(
        PF_InData* in_data,
        PF_OutData* out_data,
        PF_LayerDef* input,
        PF_LayerDef* output,
        PresetInfoEx* preset,
        PF_FpLong intensity);

    // Statistics
    A_long GetTotalPresetCount() const { return static_cast<A_long>(presets_.size()); }
    A_long GetCategoryCount() const { return static_cast<A_long>(categories_.size()); }
    A_long GetFavoriteCount() const;

    // Import/Export
    bool ExportPresetsToJSON(const char* output_path);
    bool ImportPresetsFromJSON(const char* input_path);

private:
    std::vector<PresetInfoEx> presets_;
    std::map<std::string, CategoryInfo> categories_;
    std::set<A_long> favorites_;
    std::map<A_long, PresetInfoEx*> preset_index_;

    std::string preset_directory_;

    // Preset application methods
    PF_Err ApplyTransition(PF_InData* in_data, PF_OutData* out_data,
                          PF_LayerDef* input, PF_LayerDef* output,
                          PresetInfoEx* preset, PF_FpLong intensity);

    PF_Err ApplyEffect(PF_InData* in_data, PF_OutData* out_data,
                      PF_LayerDef* input, PF_LayerDef* output,
                      PresetInfoEx* preset, PF_FpLong intensity);

    PF_Err ApplyColorGrade(PF_InData* in_data, PF_OutData* out_data,
                          PF_LayerDef* input, PF_LayerDef* output,
                          PresetInfoEx* preset, PF_FpLong intensity);

    // Initialize default presets
    void InitializeDefaultPresets();
    void InitializeDefaultCategories();

    // Helper methods
    void RebuildIndex();
    bool MatchesSearchFilter(const PresetInfoEx* preset, const SearchFilter& filter);
    bool HasTag(const PresetInfoEx* preset, const char* tag);

    // JSON parsing helpers
    bool ParsePresetJSON(const char* json_content, PresetInfoEx& preset);
    bool SerializePresetToJSON(const PresetInfoEx& preset, std::string& json_out);
};

#endif // PRESET_MANAGER_V2_H
