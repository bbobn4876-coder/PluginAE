#!/usr/bin/env python3
"""
PluginAE Preset Manager
Python utility for managing After Effects presets
"""

import json
import os
import sys
from pathlib import Path
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from enum import Enum


class PresetType(Enum):
    """Preset type enumeration"""
    TRANSITION = "transition"
    EFFECT = "effect"
    COLOR = "color"
    CUSTOM = "custom"


@dataclass
class ColorTint:
    """RGB color tint"""
    r: float = 1.0
    g: float = 1.0
    b: float = 1.0


@dataclass
class PresetParameters:
    """Preset parameters"""
    color_tint: Optional[ColorTint] = None
    contrast: float = 0.0
    saturation: float = 1.0
    blur_radius: float = 0.0
    grain_intensity: float = 0.0
    vignette_strength: float = 0.0


@dataclass
class Preset:
    """Preset data structure"""
    name: str
    type: str
    id: int
    default_intensity: float = 0.5
    description: str = ""
    category: str = ""
    author: str = "Custom"
    version: str = "1.0"
    tags: List[str] = None
    parameters: Dict = None

    def __post_init__(self):
        if self.tags is None:
            self.tags = []
        if self.parameters is None:
            self.parameters = {}


class PresetManager:
    """Manages PluginAE presets"""

    def __init__(self, presets_dir: str = "presets"):
        self.presets_dir = Path(presets_dir)
        self.presets: List[Preset] = []
        self.categories: Dict[str, List[Preset]] = {}

    def load_presets(self) -> bool:
        """Load all presets from directory"""
        if not self.presets_dir.exists():
            print(f"Error: Presets directory not found: {self.presets_dir}")
            return False

        self.presets.clear()
        self.categories.clear()

        # Scan all subdirectories
        for category_dir in self.presets_dir.iterdir():
            if category_dir.is_dir():
                category_name = category_dir.name.replace('_', ' ').title()
                self.categories[category_name] = []

                # Load JSON files in category
                for preset_file in category_dir.glob("*.json"):
                    if preset_file.name == "preset_schema.json":
                        continue

                    preset = self.load_preset_file(preset_file)
                    if preset:
                        if not preset.category:
                            preset.category = category_name
                        self.presets.append(preset)
                        self.categories[category_name].append(preset)

        print(f"Loaded {len(self.presets)} presets in {len(self.categories)} categories")
        return True

    def load_preset_file(self, file_path: Path) -> Optional[Preset]:
        """Load preset from JSON file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            preset = Preset(
                name=data.get('name', 'Unnamed'),
                type=data.get('type', 'custom'),
                id=data.get('id', 0),
                default_intensity=data.get('default_intensity', 0.5),
                description=data.get('description', ''),
                category=data.get('category', ''),
                author=data.get('author', 'Custom'),
                version=data.get('version', '1.0'),
                tags=data.get('tags', []),
                parameters=data.get('parameters', {})
            )

            return preset

        except Exception as e:
            print(f"Error loading preset {file_path}: {e}")
            return None

    def save_preset(self, preset: Preset, output_path: Optional[Path] = None) -> bool:
        """Save preset to JSON file"""
        if output_path is None:
            # Auto-generate path based on category and name
            category_dir = self.presets_dir / preset.category.lower().replace(' ', '_')
            category_dir.mkdir(parents=True, exist_ok=True)
            filename = preset.name.lower().replace(' ', '_') + '.json'
            output_path = category_dir / filename

        try:
            data = {
                'name': preset.name,
                'type': preset.type,
                'id': preset.id,
                'default_intensity': preset.default_intensity,
                'description': preset.description,
                'category': preset.category,
                'author': preset.author,
                'version': preset.version,
                'tags': preset.tags,
                'parameters': preset.parameters
            }

            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            print(f"Saved preset to: {output_path}")
            return True

        except Exception as e:
            print(f"Error saving preset: {e}")
            return False

    def create_preset(self, name: str, preset_type: str, category: str,
                     intensity: float = 0.5, **kwargs) -> Preset:
        """Create new preset"""
        # Generate unique ID
        max_id = max([p.id for p in self.presets] + [0])
        new_id = max_id + 1

        preset = Preset(
            name=name,
            type=preset_type,
            id=new_id,
            default_intensity=intensity,
            category=category,
            description=kwargs.get('description', ''),
            author=kwargs.get('author', 'Custom'),
            version=kwargs.get('version', '1.0'),
            tags=kwargs.get('tags', []),
            parameters=kwargs.get('parameters', {})
        )

        return preset

    def search_presets(self, query: str, category: Optional[str] = None,
                      preset_type: Optional[str] = None) -> List[Preset]:
        """Search presets by name, tags, or description"""
        query_lower = query.lower()
        results = []

        for preset in self.presets:
            # Filter by category
            if category and preset.category != category:
                continue

            # Filter by type
            if preset_type and preset.type != preset_type:
                continue

            # Search in name, description, tags
            if (query_lower in preset.name.lower() or
                query_lower in preset.description.lower() or
                any(query_lower in tag.lower() for tag in preset.tags)):
                results.append(preset)

        return results

    def get_categories(self) -> List[str]:
        """Get list of all categories"""
        return list(self.categories.keys())

    def get_presets_by_category(self, category: str) -> List[Preset]:
        """Get all presets in a category"""
        return self.categories.get(category, [])

    def delete_preset(self, preset_id: int) -> bool:
        """Delete preset by ID"""
        preset = next((p for p in self.presets if p.id == preset_id), None)
        if preset:
            self.presets.remove(preset)
            # Remove from category
            if preset.category in self.categories:
                self.categories[preset.category].remove(preset)
            return True
        return False

    def export_all_presets(self, output_file: Path) -> bool:
        """Export all presets to single JSON file"""
        try:
            data = {
                'version': '1.0',
                'preset_count': len(self.presets),
                'categories': list(self.categories.keys()),
                'presets': [asdict(p) for p in self.presets]
            }

            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            print(f"Exported {len(self.presets)} presets to: {output_file}")
            return True

        except Exception as e:
            print(f"Error exporting presets: {e}")
            return False

    def import_presets(self, input_file: Path) -> bool:
        """Import presets from JSON file"""
        try:
            with open(input_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            imported_count = 0
            for preset_data in data.get('presets', []):
                preset = Preset(**preset_data)

                # Check for ID conflicts
                if any(p.id == preset.id for p in self.presets):
                    max_id = max([p.id for p in self.presets])
                    preset.id = max_id + 1

                self.presets.append(preset)

                # Add to category
                if preset.category not in self.categories:
                    self.categories[preset.category] = []
                self.categories[preset.category].append(preset)

                imported_count += 1

            print(f"Imported {imported_count} presets")
            return True

        except Exception as e:
            print(f"Error importing presets: {e}")
            return False

    def list_presets(self, category: Optional[str] = None):
        """Print list of presets"""
        presets_to_show = (self.categories.get(category, []) if category
                          else self.presets)

        print(f"\n{'='*80}")
        if category:
            print(f"Presets in category: {category}")
        else:
            print(f"All Presets ({len(presets_to_show)} total)")
        print(f"{'='*80}\n")

        for preset in presets_to_show:
            print(f"ID: {preset.id:4d} | {preset.name:30s} | {preset.category:20s}")
            print(f"       Type: {preset.type:12s} | Intensity: {preset.default_intensity:.2f}")
            if preset.description:
                print(f"       {preset.description}")
            if preset.tags:
                print(f"       Tags: {', '.join(preset.tags)}")
            print()


def main():
    """Command-line interface"""
    import argparse

    parser = argparse.ArgumentParser(description='PluginAE Preset Manager')
    parser.add_argument('--presets-dir', default='presets',
                       help='Presets directory path')

    subparsers = parser.add_subparsers(dest='command', help='Commands')

    # List command
    list_parser = subparsers.add_parser('list', help='List presets')
    list_parser.add_argument('--category', help='Filter by category')

    # Search command
    search_parser = subparsers.add_parser('search', help='Search presets')
    search_parser.add_argument('query', help='Search query')
    search_parser.add_argument('--category', help='Filter by category')
    search_parser.add_argument('--type', help='Filter by type')

    # Create command
    create_parser = subparsers.add_parser('create', help='Create new preset')
    create_parser.add_argument('name', help='Preset name')
    create_parser.add_argument('type', choices=['transition', 'effect', 'color', 'custom'],
                              help='Preset type')
    create_parser.add_argument('category', help='Category name')
    create_parser.add_argument('--intensity', type=float, default=0.5,
                              help='Default intensity (0.0-1.0)')
    create_parser.add_argument('--description', default='', help='Description')
    create_parser.add_argument('--tags', nargs='+', default=[], help='Tags')

    # Export command
    export_parser = subparsers.add_parser('export', help='Export all presets')
    export_parser.add_argument('output', help='Output JSON file')

    # Import command
    import_parser = subparsers.add_parser('import', help='Import presets')
    import_parser.add_argument('input', help='Input JSON file')

    # Categories command
    cat_parser = subparsers.add_parser('categories', help='List categories')

    args = parser.parse_args()

    # Initialize manager
    manager = PresetManager(args.presets_dir)

    if args.command in ['list', 'search', 'export', 'categories']:
        manager.load_presets()

    # Execute command
    if args.command == 'list':
        manager.list_presets(args.category)

    elif args.command == 'search':
        results = manager.search_presets(args.query, args.category, args.type)
        print(f"\nFound {len(results)} presets:\n")
        for preset in results:
            print(f"{preset.id:4d} | {preset.name:30s} | {preset.category}")

    elif args.command == 'create':
        preset = manager.create_preset(
            name=args.name,
            preset_type=args.type,
            category=args.category,
            intensity=args.intensity,
            description=args.description,
            tags=args.tags
        )
        manager.save_preset(preset)
        print(f"Created preset: {preset.name} (ID: {preset.id})")

    elif args.command == 'export':
        manager.export_all_presets(Path(args.output))

    elif args.command == 'import':
        manager.import_presets(Path(args.input))

    elif args.command == 'categories':
        categories = manager.get_categories()
        print(f"\nCategories ({len(categories)}):\n")
        for cat in categories:
            count = len(manager.get_presets_by_category(cat))
            print(f"  {cat:30s} ({count} presets)")

    else:
        parser.print_help()


if __name__ == '__main__':
    main()
