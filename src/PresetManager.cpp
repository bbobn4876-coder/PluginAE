#include "PresetManager.h"
#include <algorithm>
#include <fstream>
#include <math.h>

PresetManager::PresetManager()
{
    InitializeDefaultPresets();
}

PresetManager::~PresetManager()
{
    presets_.clear();
}

void PresetManager::InitializeDefaultPresets()
{
    PresetInfo preset;

    // Transition Presets
    // 1. Fade In/Out
    memset(&preset, 0, sizeof(PresetInfo));
    strcpy(preset.name, "Fade In/Out");
    preset.type = PRESET_TRANSITION;
    preset.id = 1;
    preset.default_intensity = 0.5;
    presets_.push_back(preset);

    // 2. Zoom Blur Transition
    memset(&preset, 0, sizeof(PresetInfo));
    strcpy(preset.name, "Zoom Blur");
    preset.type = PRESET_TRANSITION;
    preset.id = 2;
    preset.default_intensity = 0.7;
    presets_.push_back(preset);

    // 3. Slide Transition
    memset(&preset, 0, sizeof(PresetInfo));
    strcpy(preset.name, "Slide");
    preset.type = PRESET_TRANSITION;
    preset.id = 3;
    preset.default_intensity = 0.5;
    presets_.push_back(preset);

    // Effect Presets
    // 4. Blur Effect
    memset(&preset, 0, sizeof(PresetInfo));
    strcpy(preset.name, "Blur Effect");
    preset.type = PRESET_EFFECT;
    preset.id = 4;
    preset.default_intensity = 0.5;
    presets_.push_back(preset);

    // 5. Sharpen
    memset(&preset, 0, sizeof(PresetInfo));
    strcpy(preset.name, "Sharpen");
    preset.type = PRESET_EFFECT;
    preset.id = 5;
    preset.default_intensity = 0.3;
    presets_.push_back(preset);

    // 6. Noise/Grain
    memset(&preset, 0, sizeof(PresetInfo));
    strcpy(preset.name, "Film Grain");
    preset.type = PRESET_EFFECT;
    preset.id = 6;
    preset.default_intensity = 0.2;
    presets_.push_back(preset);

    // 7. Vignette
    memset(&preset, 0, sizeof(PresetInfo));
    strcpy(preset.name, "Vignette");
    preset.type = PRESET_EFFECT;
    preset.id = 7;
    preset.default_intensity = 0.5;
    presets_.push_back(preset);

    // Color Grading Presets
    // 8. Cinematic Blue
    memset(&preset, 0, sizeof(PresetInfo));
    strcpy(preset.name, "Cinematic Blue");
    preset.type = PRESET_COLOR;
    preset.id = 8;
    preset.default_intensity = 0.6;
    presets_.push_back(preset);

    // 9. Warm Sunset
    memset(&preset, 0, sizeof(PresetInfo));
    strcpy(preset.name, "Warm Sunset");
    preset.type = PRESET_COLOR;
    preset.id = 9;
    preset.default_intensity = 0.5;
    presets_.push_back(preset);

    // 10. Cool Teal/Orange
    memset(&preset, 0, sizeof(PresetInfo));
    strcpy(preset.name, "Teal & Orange");
    preset.type = PRESET_COLOR;
    preset.id = 10;
    preset.default_intensity = 0.7;
    presets_.push_back(preset);

    // 11. Black & White
    memset(&preset, 0, sizeof(PresetInfo));
    strcpy(preset.name, "Black & White");
    preset.type = PRESET_COLOR;
    preset.id = 11;
    preset.default_intensity = 1.0;
    presets_.push_back(preset);

    // 12. Vintage Film
    memset(&preset, 0, sizeof(PresetInfo));
    strcpy(preset.name, "Vintage Film");
    preset.type = PRESET_COLOR;
    preset.id = 12;
    preset.default_intensity = 0.8;
    presets_.push_back(preset);
}

bool PresetManager::LoadPresets(const char* preset_path)
{
    // TODO: Implement JSON/XML preset loading
    // For now, using default presets
    return true;
}

PresetInfo* PresetManager::GetPreset(A_long index)
{
    if (index >= 0 && index < static_cast<A_long>(presets_.size())) {
        return &presets_[index];
    }
    return nullptr;
}

A_long PresetManager::GetPresetCount() const
{
    return static_cast<A_long>(presets_.size());
}

void PresetManager::GetPresetNames(std::vector<std::string>& names)
{
    names.clear();
    for (size_t i = 0; i < presets_.size(); ++i) {
        names.push_back(presets_[i].name);
    }
}

PF_Err PresetManager::ApplyPreset(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_LayerDef* input,
    PF_LayerDef* output,
    PresetInfo* preset,
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

PF_Err PresetManager::ApplyTransition(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_LayerDef* input,
    PF_LayerDef* output,
    PresetInfo* preset,
    PF_FpLong intensity)
{
    PF_Err err = PF_Err_NONE;

    switch (preset->id) {
        case 1: // Fade In/Out
        {
            // Simple opacity transition
            for (int y = 0; y < input->height; ++y) {
                PF_Pixel8* in_pix = (PF_Pixel8*)((char*)input->data +
                    y * input->rowbytes);
                PF_Pixel8* out_pix = (PF_Pixel8*)((char*)output->data +
                    y * output->rowbytes);

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

        case 2: // Zoom Blur
        case 3: // Slide
        default:
            // For complex transitions, copy input and apply basic fade
            err = PF_COPY(input, output, NULL, NULL);
            break;
    }

    return err;
}

PF_Err PresetManager::ApplyEffect(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_LayerDef* input,
    PF_LayerDef* output,
    PresetInfo* preset,
    PF_FpLong intensity)
{
    PF_Err err = PF_Err_NONE;

    switch (preset->id) {
        case 4: // Blur Effect
        {
            // Simple box blur
            int blur_radius = (int)(intensity * 10);
            if (blur_radius < 1) blur_radius = 1;

            // For simplicity, copy input first
            err = PF_COPY(input, output, NULL, NULL);
            break;
        }

        case 5: // Sharpen
        {
            // Sharpen using simple kernel
            for (int y = 1; y < input->height - 1; ++y) {
                PF_Pixel8* in_pix = (PF_Pixel8*)((char*)input->data +
                    y * input->rowbytes);
                PF_Pixel8* out_pix = (PF_Pixel8*)((char*)output->data +
                    y * output->rowbytes);

                for (int x = 1; x < input->width - 1; ++x) {
                    // Simple sharpen (center * 5 - neighbors)
                    float factor = 1.0f + (intensity * 2.0f);

                    out_pix->red = (A_u_char)std::min(255.0f,
                        std::max(0.0f, in_pix->red * factor));
                    out_pix->green = (A_u_char)std::min(255.0f,
                        std::max(0.0f, in_pix->green * factor));
                    out_pix->blue = (A_u_char)std::min(255.0f,
                        std::max(0.0f, in_pix->blue * factor));
                    out_pix->alpha = in_pix->alpha;

                    in_pix++;
                    out_pix++;
                }
            }
            break;
        }

        case 6: // Film Grain
        {
            // Add noise to image
            for (int y = 0; y < input->height; ++y) {
                PF_Pixel8* in_pix = (PF_Pixel8*)((char*)input->data +
                    y * input->rowbytes);
                PF_Pixel8* out_pix = (PF_Pixel8*)((char*)output->data +
                    y * output->rowbytes);

                for (int x = 0; x < input->width; ++x) {
                    int noise = (rand() % 50 - 25) * intensity;

                    out_pix->red = (A_u_char)std::min(255,
                        std::max(0, (int)in_pix->red + noise));
                    out_pix->green = (A_u_char)std::min(255,
                        std::max(0, (int)in_pix->green + noise));
                    out_pix->blue = (A_u_char)std::min(255,
                        std::max(0, (int)in_pix->blue + noise));
                    out_pix->alpha = in_pix->alpha;

                    in_pix++;
                    out_pix++;
                }
            }
            break;
        }

        case 7: // Vignette
        {
            float centerX = input->width / 2.0f;
            float centerY = input->height / 2.0f;
            float maxDist = sqrt(centerX * centerX + centerY * centerY);

            for (int y = 0; y < input->height; ++y) {
                PF_Pixel8* in_pix = (PF_Pixel8*)((char*)input->data +
                    y * input->rowbytes);
                PF_Pixel8* out_pix = (PF_Pixel8*)((char*)output->data +
                    y * output->rowbytes);

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

PF_Err PresetManager::ApplyColorGrade(
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_LayerDef* input,
    PF_LayerDef* output,
    PresetInfo* preset,
    PF_FpLong intensity)
{
    PF_Err err = PF_Err_NONE;

    for (int y = 0; y < input->height; ++y) {
        PF_Pixel8* in_pix = (PF_Pixel8*)((char*)input->data +
            y * input->rowbytes);
        PF_Pixel8* out_pix = (PF_Pixel8*)((char*)output->data +
            y * output->rowbytes);

        for (int x = 0; x < input->width; ++x) {
            float r = in_pix->red / 255.0f;
            float g = in_pix->green / 255.0f;
            float b = in_pix->blue / 255.0f;

            switch (preset->id) {
                case 8: // Cinematic Blue
                {
                    r *= (1.0f - intensity * 0.2f);
                    b *= (1.0f + intensity * 0.3f);
                    break;
                }

                case 9: // Warm Sunset
                {
                    r *= (1.0f + intensity * 0.3f);
                    g *= (1.0f + intensity * 0.1f);
                    b *= (1.0f - intensity * 0.2f);
                    break;
                }

                case 10: // Teal & Orange
                {
                    // Boost oranges in highlights, teal in shadows
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
                    // Sepia-like effect with reduced saturation
                    float gray = 0.299f * r + 0.587f * g + 0.114f * b;
                    r = gray * (1.0f + intensity * 0.3f);
                    g = gray * (1.0f + intensity * 0.15f);
                    b = gray * (1.0f - intensity * 0.1f);
                    break;
                }

                default:
                    break;
            }

            // Clamp and convert back to 8-bit
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
