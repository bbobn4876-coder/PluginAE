#include "PresetManagerV2.h"
#include <algorithm>
#include <fstream>
#include <sstream>
#include <cstring>
#include <cmath>

PresetManagerV2::PresetManagerV2()
{
    InitializeDefaultCategories();
    InitializeDefaultPresets();
    RebuildIndex();
}

PresetManagerV2::~PresetManagerV2()
{
    presets_.clear();
    categories_.clear();
    favorites_.clear();
    preset_index_.clear();
}

void PresetManagerV2::InitializeDefaultCategories()
{
    CategoryInfo cat;

    // Transitions category
    memset(&cat, 0, sizeof(CategoryInfo));
    strcpy(cat.name, "Transitions");
    strcpy(cat.description, "Transition effects between scenes");
    cat.is_custom = false;
    categories_["Transitions"] = cat;

    // Effects category
    memset(&cat, 0, sizeof(CategoryInfo));
    strcpy(cat.name, "Effects");
    strcpy(cat.description, "Visual effects and filters");
    cat.is_custom = false;
    categories_["Effects"] = cat;

    // Color category
    memset(&cat, 0, sizeof(CategoryInfo));
    strcpy(cat.name, "Color Grading");
    strcpy(cat.description, "Color correction and grading presets");
    cat.is_custom = false;
    categories_["Color Grading"] = cat;

    // Custom category
    memset(&cat, 0, sizeof(CategoryInfo));
    strcpy(cat.name, "Custom");
    strcpy(cat.description, "User-created presets");
    cat.is_custom = true;
    categories_["Custom"] = cat;
}

void PresetManagerV2::InitializeDefaultPresets()
{
    PresetInfoEx preset;

    // Transition Presets
    // 1. Fade In/Out
    memset(&preset, 0, sizeof(PresetInfoEx));
    strcpy(preset.name, "Fade In/Out");
    strcpy(preset.category, "Transitions");
    strcpy(preset.description, "Smooth fade transition effect");
    strcpy(preset.author, "PluginAE");
    strcpy(preset.version, "1.0");
    strcpy(preset.tags[0], "fade");
    strcpy(preset.tags[1], "transition");
    strcpy(preset.tags[2], "smooth");
    preset.tag_count = 3;
    preset.type = PRESET_TRANSITION;
    preset.id = 1;
    preset.default_intensity = 0.5;
    preset.is_favorite = false;
    presets_.push_back(preset);

    // 2. Zoom Blur Transition
    memset(&preset, 0, sizeof(PresetInfoEx));
    strcpy(preset.name, "Zoom Blur");
    strcpy(preset.category, "Transitions");
    strcpy(preset.description, "Radial zoom blur transition");
    strcpy(preset.author, "PluginAE");
    strcpy(preset.version, "1.0");
    strcpy(preset.tags[0], "zoom");
    strcpy(preset.tags[1], "blur");
    strcpy(preset.tags[2], "dynamic");
    preset.tag_count = 3;
    preset.type = PRESET_TRANSITION;
    preset.id = 2;
    preset.default_intensity = 0.7;
    preset.is_favorite = false;
    presets_.push_back(preset);

    // 3. Slide Transition
    memset(&preset, 0, sizeof(PresetInfoEx));
    strcpy(preset.name, "Slide");
    strcpy(preset.category, "Transitions");
    strcpy(preset.description, "Sliding transition effect");
    strcpy(preset.author, "PluginAE");
    strcpy(preset.version, "1.0");
    strcpy(preset.tags[0], "slide");
    strcpy(preset.tags[1], "move");
    preset.tag_count = 2;
    preset.type = PRESET_TRANSITION;
    preset.id = 3;
    preset.default_intensity = 0.5;
    preset.is_favorite = false;
    presets_.push_back(preset);

    // Effect Presets
    // 4. Blur Effect
    memset(&preset, 0, sizeof(PresetInfoEx));
    strcpy(preset.name, "Blur Effect");
    strcpy(preset.category, "Effects");
    strcpy(preset.description, "Gaussian blur effect");
    strcpy(preset.author, "PluginAE");
    strcpy(preset.version, "1.0");
    strcpy(preset.tags[0], "blur");
    strcpy(preset.tags[1], "soft");
    preset.tag_count = 2;
    preset.type = PRESET_EFFECT;
    preset.id = 4;
    preset.default_intensity = 0.5;
    preset.is_favorite = false;
    presets_.push_back(preset);

    // 5. Sharpen
    memset(&preset, 0, sizeof(PresetInfoEx));
    strcpy(preset.name, "Sharpen");
    strcpy(preset.category, "Effects");
    strcpy(preset.description, "Sharpening filter");
    strcpy(preset.author, "PluginAE");
    strcpy(preset.version, "1.0");
    strcpy(preset.tags[0], "sharpen");
    strcpy(preset.tags[1], "enhance");
    preset.tag_count = 2;
    preset.type = PRESET_EFFECT;
    preset.id = 5;
    preset.default_intensity = 0.3;
    preset.is_favorite = false;
    presets_.push_back(preset);

    // 6. Film Grain
    memset(&preset, 0, sizeof(PresetInfoEx));
    strcpy(preset.name, "Film Grain");
    strcpy(preset.category, "Effects");
    strcpy(preset.description, "Adds realistic film grain texture");
    strcpy(preset.author, "PluginAE");
    strcpy(preset.version, "1.0");
    strcpy(preset.tags[0], "grain");
    strcpy(preset.tags[1], "noise");
    strcpy(preset.tags[2], "vintage");
    preset.tag_count = 3;
    preset.type = PRESET_EFFECT;
    preset.id = 6;
    preset.default_intensity = 0.2;
    preset.is_favorite = false;
    presets_.push_back(preset);

    // 7. Vignette
    memset(&preset, 0, sizeof(PresetInfoEx));
    strcpy(preset.name, "Vignette");
    strcpy(preset.category, "Effects");
    strcpy(preset.description, "Darkens edges for cinematic look");
    strcpy(preset.author, "PluginAE");
    strcpy(preset.version, "1.0");
    strcpy(preset.tags[0], "vignette");
    strcpy(preset.tags[1], "cinematic");
    strcpy(preset.tags[2], "edges");
    preset.tag_count = 3;
    preset.type = PRESET_EFFECT;
    preset.id = 7;
    preset.default_intensity = 0.5;
    preset.is_favorite = false;
    presets_.push_back(preset);

    // Color Grading Presets
    // 8. Cinematic Blue
    memset(&preset, 0, sizeof(PresetInfoEx));
    strcpy(preset.name, "Cinematic Blue");
    strcpy(preset.category, "Color Grading");
    strcpy(preset.description, "Cool blue cinematic color grade");
    strcpy(preset.author, "PluginAE");
    strcpy(preset.version, "1.0");
    strcpy(preset.tags[0], "blue");
    strcpy(preset.tags[1], "cinematic");
    strcpy(preset.tags[2], "cool");
    preset.tag_count = 3;
    preset.type = PRESET_COLOR;
    preset.id = 8;
    preset.default_intensity = 0.6;
    preset.is_favorite = false;
    presets_.push_back(preset);

    // 9. Warm Sunset
    memset(&preset, 0, sizeof(PresetInfoEx));
    strcpy(preset.name, "Warm Sunset");
    strcpy(preset.category, "Color Grading");
    strcpy(preset.description, "Warm orange and red sunset tones");
    strcpy(preset.author, "PluginAE");
    strcpy(preset.version, "1.0");
    strcpy(preset.tags[0], "warm");
    strcpy(preset.tags[1], "sunset");
    strcpy(preset.tags[2], "orange");
    preset.tag_count = 3;
    preset.type = PRESET_COLOR;
    preset.id = 9;
    preset.default_intensity = 0.5;
    preset.is_favorite = false;
    presets_.push_back(preset);

    // 10. Teal & Orange
    memset(&preset, 0, sizeof(PresetInfoEx));
    strcpy(preset.name, "Teal & Orange");
    strcpy(preset.category, "Color Grading");
    strcpy(preset.description, "Popular Hollywood teal and orange look");
    strcpy(preset.author, "PluginAE");
    strcpy(preset.version, "1.0");
    strcpy(preset.tags[0], "teal");
    strcpy(preset.tags[1], "orange");
    strcpy(preset.tags[2], "hollywood");
    preset.tag_count = 3;
    preset.type = PRESET_COLOR;
    preset.id = 10;
    preset.default_intensity = 0.7;
    preset.is_favorite = false;
    presets_.push_back(preset);

    // 11. Black & White
    memset(&preset, 0, sizeof(PresetInfoEx));
    strcpy(preset.name, "Black & White");
    strcpy(preset.category, "Color Grading");
    strcpy(preset.description, "Classic black and white conversion");
    strcpy(preset.author, "PluginAE");
    strcpy(preset.version, "1.0");
    strcpy(preset.tags[0], "bw");
    strcpy(preset.tags[1], "monochrome");
    strcpy(preset.tags[2], "classic");
    preset.tag_count = 3;
    preset.type = PRESET_COLOR;
    preset.id = 11;
    preset.default_intensity = 1.0;
    preset.is_favorite = false;
    presets_.push_back(preset);

    // 12. Vintage Film
    memset(&preset, 0, sizeof(PresetInfoEx));
    strcpy(preset.name, "Vintage Film");
    strcpy(preset.category, "Color Grading");
    strcpy(preset.description, "Vintage film look with warm tones");
    strcpy(preset.author, "PluginAE");
    strcpy(preset.version, "1.0");
    strcpy(preset.tags[0], "vintage");
    strcpy(preset.tags[1], "retro");
    strcpy(preset.tags[2], "film");
    preset.tag_count = 3;
    preset.type = PRESET_COLOR;
    preset.id = 12;
    preset.default_intensity = 0.8;
    preset.is_favorite = false;
    presets_.push_back(preset);

    // Update category counts
    for (auto& preset : presets_) {
        auto it = categories_.find(preset.category);
        if (it != categories_.end()) {
            it->second.preset_count++;
        }
    }
}

void PresetManagerV2::RebuildIndex()
{
    preset_index_.clear();
    for (size_t i = 0; i < presets_.size(); ++i) {
        preset_index_[presets_[i].id] = &presets_[i];
    }
}

PresetInfoEx* PresetManagerV2::GetPreset(A_long index)
{
    if (index >= 0 && index < static_cast<A_long>(presets_.size())) {
        return &presets_[index];
    }
    return nullptr;
}

PresetInfoEx* PresetManagerV2::GetPresetByID(A_long id)
{
    auto it = preset_index_.find(id);
    if (it != preset_index_.end()) {
        return it->second;
    }
    return nullptr;
}

PresetInfoEx* PresetManagerV2::GetPresetByName(const char* name)
{
    for (auto& preset : presets_) {
        if (strcmp(preset.name, name) == 0) {
            return &preset;
        }
    }
    return nullptr;
}

A_long PresetManagerV2::GetPresetCount() const
{
    return static_cast<A_long>(presets_.size());
}

bool PresetManagerV2::CreateCategory(const char* name, const char* description)
{
    if (categories_.find(name) != categories_.end()) {
        return false; // Category already exists
    }

    CategoryInfo cat;
    memset(&cat, 0, sizeof(CategoryInfo));
    strcpy(cat.name, name);
    strcpy(cat.description, description);
    cat.preset_count = 0;
    cat.is_custom = true;

    categories_[name] = cat;
    return true;
}

bool PresetManagerV2::DeleteCategory(const char* name)
{
    auto it = categories_.find(name);
    if (it == categories_.end() || !it->second.is_custom) {
        return false; // Can't delete built-in categories
    }

    // Remove all presets in this category
    presets_.erase(
        std::remove_if(presets_.begin(), presets_.end(),
            [name](const PresetInfoEx& p) { return strcmp(p.category, name) == 0; }),
        presets_.end());

    categories_.erase(it);
    RebuildIndex();
    return true;
}

void PresetManagerV2::GetCategories(std::vector<CategoryInfo>& categories)
{
    categories.clear();
    for (const auto& pair : categories_) {
        categories.push_back(pair.second);
    }
}

A_long PresetManagerV2::GetCategoryPresetCount(const char* category)
{
    A_long count = 0;
    for (const auto& preset : presets_) {
        if (strcmp(preset.category, category) == 0) {
            count++;
        }
    }
    return count;
}

void PresetManagerV2::SearchPresets(const SearchFilter& filter, std::vector<A_long>& results)
{
    results.clear();

    for (const auto& preset : presets_) {
        if (MatchesSearchFilter(&preset, filter)) {
            results.push_back(preset.id);
        }
    }
}

bool PresetManagerV2::MatchesSearchFilter(const PresetInfoEx* preset, const SearchFilter& filter)
{
    // Check favorites
    if (filter.favorites_only && !preset->is_favorite) {
        return false;
    }

    // Check type filter
    if (filter.use_type_filter && preset->type != filter.type_filter) {
        return false;
    }

    // Check category filter
    if (filter.use_category_filter && strcmp(preset->category, filter.category_filter) != 0) {
        return false;
    }

    // Check search text
    if (strlen(filter.search_text) > 0) {
        std::string search_lower = filter.search_text;
        std::transform(search_lower.begin(), search_lower.end(), search_lower.begin(), ::tolower);

        std::string name_lower = preset->name;
        std::transform(name_lower.begin(), name_lower.end(), name_lower.begin(), ::tolower);

        std::string desc_lower = preset->description;
        std::transform(desc_lower.begin(), desc_lower.end(), desc_lower.begin(), ::tolower);

        bool found = (name_lower.find(search_lower) != std::string::npos) ||
                     (desc_lower.find(search_lower) != std::string::npos);

        if (!found) {
            // Check tags
            for (int i = 0; i < preset->tag_count; ++i) {
                std::string tag_lower = preset->tags[i];
                std::transform(tag_lower.begin(), tag_lower.end(), tag_lower.begin(), ::tolower);
                if (tag_lower.find(search_lower) != std::string::npos) {
                    found = true;
                    break;
                }
            }
        }

        if (!found) return false;
    }

    return true;
}

void PresetManagerV2::FilterByCategory(const char* category, std::vector<A_long>& results)
{
    results.clear();
    for (const auto& preset : presets_) {
        if (strcmp(preset.category, category) == 0) {
            results.push_back(preset.id);
        }
    }
}

void PresetManagerV2::FilterByType(PresetType type, std::vector<A_long>& results)
{
    results.clear();
    for (const auto& preset : presets_) {
        if (preset.type == type) {
            results.push_back(preset.id);
        }
    }
}

bool PresetManagerV2::ToggleFavorite(A_long preset_id)
{
    PresetInfoEx* preset = GetPresetByID(preset_id);
    if (!preset) return false;

    preset->is_favorite = !preset->is_favorite;

    if (preset->is_favorite) {
        favorites_.insert(preset_id);
    } else {
        favorites_.erase(preset_id);
    }

    return true;
}

void PresetManagerV2::GetFavorites(std::vector<A_long>& favorites)
{
    favorites.clear();
    for (A_long id : favorites_) {
        favorites.push_back(id);
    }
}

A_long PresetManagerV2::GetFavoriteCount() const
{
    return static_cast<A_long>(favorites_.size());
}

PF_Err PresetManagerV2::GeneratePreview(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_LayerDef* input,
    PF_LayerDef* output,
    A_long preset_id,
    PF_FpLong intensity)
{
    PresetInfoEx* preset = GetPresetByID(preset_id);
    if (!preset) {
        return PF_Err_BAD_CALLBACK_PARAM;
    }

    return ApplyPreset(in_data, out_data, input, output, preset, intensity);
}

PF_Err PresetManagerV2::ApplyPreset(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_LayerDef* input,
    PF_LayerDef* output,
    PresetInfoEx* preset,
    PF_FpLong intensity)
{
    PF_Err err = PF_Err_NONE;

    if (!preset || !input || !output) {
        return PF_Err_BAD_CALLBACK_PARAM;
    }

    switch (preset->type) {
        case PRESET_TRANSITION:
            err = ApplyTransition(in_data, out_data, input, output, preset, intensity);
            break;

        case PRESET_EFFECT:
            err = ApplyEffect(in_data, out_data, input, output, preset, intensity);
            break;

        case PRESET_COLOR:
            err = ApplyColorGrade(in_data, out_data, input, output, preset, intensity);
            break;

        default:
            err = PF_COPY(input, output, NULL, NULL);
            break;
    }

    return err;
}

// Implementation of Apply methods (reuse from PresetManager.cpp)
PF_Err PresetManagerV2::ApplyTransition(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_LayerDef* input,
    PF_LayerDef* output,
    PresetInfoEx* preset,
    PF_FpLong intensity)
{
    PF_Err err = PF_Err_NONE;

    switch (preset->id) {
        case 1: // Fade In/Out
        {
            for (int y = 0; y < input->height; ++y) {
                PF_Pixel8* in_pix = (PF_Pixel8*)((char*)input->data + y * input->rowbytes);
                PF_Pixel8* out_pix = (PF_Pixel8*)((char*)output->data + y * output->rowbytes);

                for (int x = 0; x < input->width; ++x) {
                    out_pix->alpha = (A_u_char)(in_pix->alpha * intensity);
                    out_pix->red = in_pix->red;
                    out_pix->green = in_pix->green;
                    out_pix->blue = in_pix->blue;
                    in_pix++;
                    out_pix++;
                }
            }
            break;
        }

        default:
            err = PF_COPY(input, output, NULL, NULL);
            break;
    }

    return err;
}

PF_Err PresetManagerV2::ApplyEffect(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_LayerDef* input,
    PF_LayerDef* output,
    PresetInfoEx* preset,
    PF_FpLong intensity)
{
    PF_Err err = PF_Err_NONE;

    switch (preset->id) {
        case 7: // Vignette
        {
            float centerX = input->width / 2.0f;
            float centerY = input->height / 2.0f;
            float maxDist = sqrt(centerX * centerX + centerY * centerY);

            for (int y = 0; y < input->height; ++y) {
                PF_Pixel8* in_pix = (PF_Pixel8*)((char*)input->data + y * input->rowbytes);
                PF_Pixel8* out_pix = (PF_Pixel8*)((char*)output->data + y * output->rowbytes);

                for (int x = 0; x < input->width; ++x) {
                    float dx = x - centerX;
                    float dy = y - centerY;
                    float dist = sqrt(dx * dx + dy * dy);
                    float vignette = 1.0f - (dist / maxDist) * intensity;
                    vignette = std::max(0.0f, std::min(1.0f, vignette));

                    out_pix->red = (A_u_char)(in_pix->red * vignette);
                    out_pix->green = (A_u_char)(in_pix->green * vignette);
                    out_pix->blue = (A_u_char)(in_pix->blue * vignette);
                    out_pix->alpha = in_pix->alpha;

                    in_pix++;
                    out_pix++;
                }
            }
            break;
        }

        default:
            err = PF_COPY(input, output, NULL, NULL);
            break;
    }

    return err;
}

PF_Err PresetManagerV2::ApplyColorGrade(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_LayerDef* input,
    PF_LayerDef* output,
    PresetInfoEx* preset,
    PF_FpLong intensity)
{
    PF_Err err = PF_Err_NONE;

    for (int y = 0; y < input->height; ++y) {
        PF_Pixel8* in_pix = (PF_Pixel8*)((char*)input->data + y * input->rowbytes);
        PF_Pixel8* out_pix = (PF_Pixel8*)((char*)output->data + y * output->rowbytes);

        for (int x = 0; x < input->width; ++x) {
            float r = in_pix->red / 255.0f;
            float g = in_pix->green / 255.0f;
            float b = in_pix->blue / 255.0f;

            switch (preset->id) {
                case 8: // Cinematic Blue
                    r *= (1.0f - intensity * 0.2f);
                    b *= (1.0f + intensity * 0.3f);
                    break;

                case 9: // Warm Sunset
                    r *= (1.0f + intensity * 0.3f);
                    g *= (1.0f + intensity * 0.1f);
                    b *= (1.0f - intensity * 0.2f);
                    break;

                case 10: // Teal & Orange
                {
                    float luminance = 0.299f * r + 0.587f * g + 0.114f * b;
                    if (luminance > 0.5f) {
                        r *= (1.0f + intensity * 0.2f);
                        g *= (1.0f + intensity * 0.1f);
                    } else {
                        g *= (1.0f + intensity * 0.2f);
                        b *= (1.0f + intensity * 0.2f);
                    }
                    break;
                }

                case 11: // Black & White
                {
                    float gray = 0.299f * r + 0.587f * g + 0.114f * b;
                    r = r * (1.0f - intensity) + gray * intensity;
                    g = g * (1.0f - intensity) + gray * intensity;
                    b = b * (1.0f - intensity) + gray * intensity;
                    break;
                }

                case 12: // Vintage Film
                {
                    float gray = 0.299f * r + 0.587f * g + 0.114f * b;
                    r = gray * (1.0f + intensity * 0.3f);
                    g = gray * (1.0f + intensity * 0.15f);
                    b = gray * (1.0f - intensity * 0.1f);
                    break;
                }

                default:
                    break;
            }

            out_pix->red = (A_u_char)(std::min(1.0f, std::max(0.0f, r)) * 255.0f);
            out_pix->green = (A_u_char)(std::min(1.0f, std::max(0.0f, g)) * 255.0f);
            out_pix->blue = (A_u_char)(std::min(1.0f, std::max(0.0f, b)) * 255.0f);
            out_pix->alpha = in_pix->alpha;

            in_pix++;
            out_pix++;
        }
    }

    return err;
}

bool PresetManagerV2::LoadPresets(const char* preset_path)
{
    preset_directory_ = preset_path;
    // TODO: Implement directory scanning and JSON loading
    return true;
}

bool PresetManagerV2::ReloadPresets()
{
    if (preset_directory_.empty()) return false;
    return LoadPresets(preset_directory_.c_str());
}
