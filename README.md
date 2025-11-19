# PluginAE - Custom Presets Plugin for Adobe After Effects

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey.svg)
![AE Version](https://img.shields.io/badge/After%20Effects-CC%202019%2B-purple.svg)

Мощный плагин для Adobe After Effects, который позволяет загружать и применять пользовательские пресеты для переходов, эффектов и цветокоррекции.

## Возможности

### Основные функции

- **Система пресетов**: Загрузка и применение пользовательских пресетов из JSON файлов
- **Категории эффектов**:
  - Переходы (Transitions)
  - Эффекты (Effects)
  - Цветокоррекция (Color Grading)
- **Регулировка интенсивности**: Точный контроль силы применения эффекта (0-100%)
- **Режимы наложения**: Различные режимы смешивания эффектов
- **Расширяемость**: Простое добавление собственных пресетов

### Встроенные пресеты

#### Переходы
- **Fade In/Out** - Плавное затухание/появление
- **Zoom Blur** - Радиальное размытие при увеличении
- **Slide** - Скольжение кадра

#### Эффекты
- **Blur Effect** - Размытие изображения
- **Sharpen** - Повышение резкости
- **Film Grain** - Эффект кинопленки
- **Vignette** - Виньетирование краев

#### Цветокоррекция
- **Cinematic Blue** - Холодная синяя тонировка
- **Warm Sunset** - Теплые закатные тона
- **Teal & Orange** - Популярный голливудский стиль
- **Black & White** - Черно-белое изображение
- **Vintage Film** - Винтажный кинематографический стиль

## Системные требования

- **Adobe After Effects**: CC 2019 или новее
- **Операционная система**:
  - Windows 10/11 (64-bit)
  - macOS 10.13 или новее
- **Для сборки из исходников**:
  - CMake 3.15+
  - Visual Studio 2019+ (Windows) или Xcode 12+ (macOS)
  - Adobe After Effects SDK

## Быстрый старт

### Установка (готовый плагин)

#### Windows
1. Скачайте `PluginAE.aex` из releases
2. Скопируйте в:
   ```
   C:\Program Files\Adobe\Adobe After Effects [VERSION]\Support Files\Plug-ins\
   ```
3. Скопируйте папку `presets/` в ту же директорию
4. Перезапустите After Effects

#### macOS
1. Скачайте `PluginAE.plugin` из releases
2. Скопируйте в:
   ```
   /Applications/Adobe After Effects [VERSION]/Plug-ins/
   ```
3. Скопируйте папку `presets/` в ту же директорию
4. Перезапустите After Effects

### Использование

1. Откройте After Effects
2. Создайте новую композицию или откройте существующую
3. Выберите слой для применения эффекта
4. Перейдите в меню: **Effect > Custom > PluginAE Presets**
5. В панели эффектов:
   - Выберите нужный пресет из выпадающего списка **Preset**
   - Отрегулируйте **Intensity** (0-100%)
   - Выберите **Blend Mode** при необходимости

## Сборка из исходников

Подробные инструкции по сборке см. в [BUILD_INSTRUCTIONS.md](docs/BUILD_INSTRUCTIONS.md)

### Краткая инструкция

```bash
# 1. Клонировать репозиторий
git clone <repository-url>
cd PluginAE

# 2. Создать директорию сборки
mkdir build && cd build

# 3. Настроить CMake
cmake -DAE_SDK_PATH="/path/to/AfterEffectsSDK" ..

# 4. Собрать проект
cmake --build . --config Release
```

## Создание пользовательских пресетов

Подробное руководство см. в [PRESET_CREATION.md](docs/PRESET_CREATION.md)

### Пример создания пресета

Создайте файл `presets/color/my_preset.json`:

```json
{
  "name": "My Custom Look",
  "type": "color",
  "id": 500,
  "default_intensity": 0.7,
  "description": "My custom color grade",
  "parameters": {
    "color_tint": {
      "r": 1.1,
      "g": 1.0,
      "b": 0.95
    },
    "contrast": 0.15,
    "saturation": 1.1
  }
}
```

## Структура проекта

```
PluginAE/
├── src/                    # Исходный код
│   ├── PluginAE.cpp       # Основной файл плагина
│   ├── PresetManager.cpp  # Менеджер пресетов
│   └── PluginAE_PiPL.r    # Ресурсный файл
├── include/               # Заголовочные файлы
│   ├── PluginAE.h
│   ├── PresetManager.h
│   └── entry.h
├── presets/              # Пресеты
│   ├── transitions/      # Переходы
│   ├── effects/          # Эффекты
│   └── color/            # Цветокоррекция
├── docs/                 # Документация
│   ├── BUILD_INSTRUCTIONS.md
│   └── PRESET_CREATION.md
├── build/                # Директория сборки (создается)
├── CMakeLists.txt        # Конфигурация CMake
└── README.md             # Этот файл
```

## API и расширение

### Типы пресетов

```cpp
enum PresetType {
    PRESET_TRANSITION = 0,  // Переходы
    PRESET_EFFECT,          // Эффекты
    PRESET_COLOR,           // Цветокоррекция
    PRESET_CUSTOM           // Пользовательские
};
```

### Структура пресета

```cpp
typedef struct {
    char name[256];              // Название
    PresetType type;             // Тип
    A_long id;                   // Уникальный ID
    PF_FpLong default_intensity; // Интенсивность по умолчанию
    void* data;                  // Дополнительные данные
} PresetInfo;
```

## Решение проблем

### Плагин не появляется в меню

- Проверьте правильность установки в папку plugins
- Убедитесь, что расширение файла корректное (.aex или .plugin)
- Перезапустите After Effects
- Проверьте совместимость версии AE

### Пресеты не загружаются

- Проверьте синтаксис JSON файлов
- Убедитесь, что ID пресетов уникальны
- Проверьте структуру папки presets/
- Посмотрите логи After Effects

### Эффект работает некорректно

- Попробуйте уменьшить значение Intensity
- Проверьте параметры в JSON файле
- Убедитесь, что значения в допустимых диапазонах
- Пересоберите плагин в Debug режиме для отладки

## Участие в разработке

Мы приветствуем вклад в проект! Если вы хотите помочь:

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/AmazingFeature`)
3. Закоммитьте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Запушьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

### Что можно улучшить

- Добавление новых типов эффектов
- Улучшение производительности обработки
- Поддержка GPU ускорения
- Расширенный UI для настройки пресетов
- Импорт/экспорт пресетов
- Поддержка анимации параметров

## Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для деталей.

## Благодарности

- Adobe After Effects SDK
- Сообщество разработчиков плагинов AE
- Все контрибьюторы проекта

## Контакты и поддержка

- **Issues**: Сообщайте о проблемах через GitHub Issues
- **Документация**: См. папку `docs/`
- **Примеры**: См. папку `presets/`

## Дополнительные ресурсы

- [Adobe After Effects SDK Documentation](https://www.adobe.io/apis/creativecloud/aftereffects.html)
- [Plugin Development Guide](https://www.adobe.io/apis/creativecloud/aftereffects/docs.html)
- [CMake Documentation](https://cmake.org/documentation/)

---

**Версия**: 1.0.0
**Последнее обновление**: 2025
**Статус**: В разработке
