#!/usr/bin/env python3
"""
PluginAE Preset Manager GUI
Graphical interface for managing After Effects presets
"""

import sys
import json
from pathlib import Path
from typing import Optional

try:
    from PyQt5.QtWidgets import (
        QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
        QListWidget, QListWidgetItem, QPushButton, QLabel, QLineEdit,
        QTextEdit, QComboBox, QDoubleSpinBox, QMessageBox, QFileDialog,
        QGroupBox, QSplitter, QTabWidget, QCheckBox
    )
    from PyQt5.QtCore import Qt, pyqtSignal
    from PyQt5.QtGui import QIcon
    HAS_QT = True
except ImportError:
    print("PyQt5 not installed. Install with: pip install PyQt5")
    HAS_QT = False

from preset_manager import PresetManager, Preset, PresetType


class PresetEditorWidget(QWidget):
    """Widget for editing preset properties"""

    preset_saved = pyqtSignal(Preset)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.current_preset: Optional[Preset] = None
        self.init_ui()

    def init_ui(self):
        layout = QVBoxLayout()

        # Name
        name_layout = QHBoxLayout()
        name_layout.addWidget(QLabel("Name:"))
        self.name_edit = QLineEdit()
        name_layout.addWidget(self.name_edit)
        layout.addLayout(name_layout)

        # Type
        type_layout = QHBoxLayout()
        type_layout.addWidget(QLabel("Type:"))
        self.type_combo = QComboBox()
        self.type_combo.addItems(['transition', 'effect', 'color', 'custom'])
        type_layout.addWidget(self.type_combo)
        layout.addLayout(type_layout)

        # Category
        cat_layout = QHBoxLayout()
        cat_layout.addWidget(QLabel("Category:"))
        self.category_edit = QLineEdit()
        cat_layout.addWidget(self.category_edit)
        layout.addLayout(cat_layout)

        # Intensity
        intensity_layout = QHBoxLayout()
        intensity_layout.addWidget(QLabel("Default Intensity:"))
        self.intensity_spin = QDoubleSpinBox()
        self.intensity_spin.setRange(0.0, 1.0)
        self.intensity_spin.setSingleStep(0.05)
        self.intensity_spin.setValue(0.5)
        intensity_layout.addWidget(self.intensity_spin)
        layout.addLayout(intensity_layout)

        # Description
        layout.addWidget(QLabel("Description:"))
        self.description_edit = QTextEdit()
        self.description_edit.setMaximumHeight(80)
        layout.addWidget(self.description_edit)

        # Tags
        tags_layout = QHBoxLayout()
        tags_layout.addWidget(QLabel("Tags (comma-separated):"))
        self.tags_edit = QLineEdit()
        tags_layout.addWidget(self.tags_edit)
        layout.addLayout(tags_layout)

        # Author
        author_layout = QHBoxLayout()
        author_layout.addWidget(QLabel("Author:"))
        self.author_edit = QLineEdit()
        self.author_edit.setText("Custom")
        author_layout.addWidget(self.author_edit)
        layout.addLayout(author_layout)

        # Buttons
        button_layout = QHBoxLayout()
        self.save_btn = QPushButton("Save Preset")
        self.save_btn.clicked.connect(self.save_preset)
        self.clear_btn = QPushButton("Clear")
        self.clear_btn.clicked.connect(self.clear_form)
        button_layout.addWidget(self.save_btn)
        button_layout.addWidget(self.clear_btn)
        layout.addLayout(button_layout)

        layout.addStretch()
        self.setLayout(layout)

    def load_preset(self, preset: Preset):
        """Load preset into editor"""
        self.current_preset = preset
        self.name_edit.setText(preset.name)
        self.type_combo.setCurrentText(preset.type)
        self.category_edit.setText(preset.category)
        self.intensity_spin.setValue(preset.default_intensity)
        self.description_edit.setPlainText(preset.description)
        self.tags_edit.setText(', '.join(preset.tags))
        self.author_edit.setText(preset.author)

    def save_preset(self):
        """Save current preset"""
        if not self.name_edit.text():
            QMessageBox.warning(self, "Error", "Preset name is required")
            return

        preset = Preset(
            name=self.name_edit.text(),
            type=self.type_combo.currentText(),
            id=self.current_preset.id if self.current_preset else 0,
            default_intensity=self.intensity_spin.value(),
            description=self.description_edit.toPlainText(),
            category=self.category_edit.text(),
            author=self.author_edit.text(),
            tags=[t.strip() for t in self.tags_edit.text().split(',') if t.strip()]
        )

        self.preset_saved.emit(preset)

    def clear_form(self):
        """Clear all fields"""
        self.current_preset = None
        self.name_edit.clear()
        self.type_combo.setCurrentIndex(0)
        self.category_edit.clear()
        self.intensity_spin.setValue(0.5)
        self.description_edit.clear()
        self.tags_edit.clear()
        self.author_edit.setText("Custom")


class PresetManagerGUI(QMainWindow):
    """Main GUI window for preset management"""

    def __init__(self):
        super().__init__()
        self.manager = PresetManager()
        self.current_category = None
        self.init_ui()
        self.load_presets()

    def init_ui(self):
        self.setWindowTitle("PluginAE Preset Manager")
        self.setGeometry(100, 100, 1200, 800)

        # Central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        main_layout = QHBoxLayout()

        # Left panel - Categories and search
        left_panel = QWidget()
        left_layout = QVBoxLayout()

        # Search bar
        search_group = QGroupBox("Search")
        search_layout = QVBoxLayout()
        self.search_edit = QLineEdit()
        self.search_edit.setPlaceholderText("Search presets...")
        self.search_edit.textChanged.connect(self.search_presets)
        search_layout.addWidget(self.search_edit)
        search_group.setLayout(search_layout)
        left_layout.addWidget(search_group)

        # Categories list
        cat_group = QGroupBox("Categories")
        cat_layout = QVBoxLayout()
        self.category_list = QListWidget()
        self.category_list.itemClicked.connect(self.on_category_selected)
        cat_layout.addWidget(self.category_list)

        # Category buttons
        cat_btn_layout = QHBoxLayout()
        self.add_cat_btn = QPushButton("Add Category")
        self.add_cat_btn.clicked.connect(self.add_category)
        cat_btn_layout.addWidget(self.add_cat_btn)
        cat_layout.addLayout(cat_btn_layout)

        cat_group.setLayout(cat_layout)
        left_layout.addWidget(cat_group)

        left_panel.setLayout(left_layout)
        left_panel.setMaximumWidth(300)

        # Center panel - Preset list
        center_panel = QWidget()
        center_layout = QVBoxLayout()

        # Preset list
        preset_group = QGroupBox("Presets")
        preset_layout = QVBoxLayout()
        self.preset_list = QListWidget()
        self.preset_list.itemClicked.connect(self.on_preset_selected)
        preset_layout.addWidget(self.preset_list)

        # Preset controls
        preset_btn_layout = QHBoxLayout()
        self.new_preset_btn = QPushButton("New Preset")
        self.new_preset_btn.clicked.connect(self.new_preset)
        self.delete_preset_btn = QPushButton("Delete")
        self.delete_preset_btn.clicked.connect(self.delete_preset)
        preset_btn_layout.addWidget(self.new_preset_btn)
        preset_btn_layout.addWidget(self.delete_preset_btn)
        preset_layout.addLayout(preset_btn_layout)

        preset_group.setLayout(preset_layout)
        center_layout.addWidget(preset_group)

        center_panel.setLayout(center_layout)

        # Right panel - Editor
        right_panel = QWidget()
        right_layout = QVBoxLayout()

        editor_group = QGroupBox("Preset Editor")
        editor_layout = QVBoxLayout()
        self.editor = PresetEditorWidget()
        self.editor.preset_saved.connect(self.on_preset_saved)
        editor_layout.addWidget(self.editor)
        editor_group.setLayout(editor_layout)
        right_layout.addWidget(editor_group)

        right_panel.setLayout(right_layout)
        right_panel.setMaximumWidth(400)

        # Add panels to splitter
        splitter = QSplitter(Qt.Horizontal)
        splitter.addWidget(left_panel)
        splitter.addWidget(center_panel)
        splitter.addWidget(right_panel)
        splitter.setStretchFactor(1, 1)

        main_layout.addWidget(splitter)
        central_widget.setLayout(main_layout)

        # Menu bar
        menubar = self.menuBar()

        # File menu
        file_menu = menubar.addMenu("File")
        import_action = file_menu.addAction("Import Presets")
        import_action.triggered.connect(self.import_presets)
        export_action = file_menu.addAction("Export Presets")
        export_action.triggered.connect(self.export_presets)
        file_menu.addSeparator()
        exit_action = file_menu.addAction("Exit")
        exit_action.triggered.connect(self.close)

        # View menu
        view_menu = menubar.addMenu("View")
        refresh_action = view_menu.addAction("Refresh")
        refresh_action.triggered.connect(self.load_presets)

        # Status bar
        self.statusBar().showMessage("Ready")

    def load_presets(self):
        """Load all presets"""
        self.manager.load_presets()
        self.update_category_list()
        self.update_preset_list()
        self.statusBar().showMessage(f"Loaded {len(self.manager.presets)} presets")

    def update_category_list(self):
        """Update categories list"""
        self.category_list.clear()

        # Add "All" category
        all_item = QListWidgetItem("All Presets")
        all_item.setData(Qt.UserRole, None)
        self.category_list.addItem(all_item)

        # Add categories
        for category in self.manager.get_categories():
            count = len(self.manager.get_presets_by_category(category))
            item = QListWidgetItem(f"{category} ({count})")
            item.setData(Qt.UserRole, category)
            self.category_list.addItem(item)

    def update_preset_list(self, presets=None):
        """Update presets list"""
        self.preset_list.clear()

        if presets is None:
            if self.current_category:
                presets = self.manager.get_presets_by_category(self.current_category)
            else:
                presets = self.manager.presets

        for preset in presets:
            item = QListWidgetItem(f"{preset.name} ({preset.type})")
            item.setData(Qt.UserRole, preset)
            self.preset_list.addItem(item)

    def on_category_selected(self, item):
        """Handle category selection"""
        self.current_category = item.data(Qt.UserRole)
        self.update_preset_list()

    def on_preset_selected(self, item):
        """Handle preset selection"""
        preset = item.data(Qt.UserRole)
        if preset:
            self.editor.load_preset(preset)

    def search_presets(self, query):
        """Search presets"""
        if not query:
            self.update_preset_list()
            return

        results = self.manager.search_presets(
            query,
            category=self.current_category
        )
        self.update_preset_list(results)

    def new_preset(self):
        """Create new preset"""
        self.editor.clear_form()
        if self.current_category:
            self.editor.category_edit.setText(self.current_category)

    def on_preset_saved(self, preset):
        """Handle preset saved"""
        # Assign ID if new
        if preset.id == 0:
            max_id = max([p.id for p in self.manager.presets] + [0])
            preset.id = max_id + 1

        # Save to file
        if self.manager.save_preset(preset):
            QMessageBox.information(self, "Success", f"Preset '{preset.name}' saved!")
            self.load_presets()
        else:
            QMessageBox.warning(self, "Error", "Failed to save preset")

    def delete_preset(self):
        """Delete selected preset"""
        current_item = self.preset_list.currentItem()
        if not current_item:
            return

        preset = current_item.data(Qt.UserRole)
        reply = QMessageBox.question(
            self,
            "Confirm Delete",
            f"Delete preset '{preset.name}'?",
            QMessageBox.Yes | QMessageBox.No
        )

        if reply == QMessageBox.Yes:
            self.manager.delete_preset(preset.id)
            self.load_presets()

    def add_category(self):
        """Add new category"""
        from PyQt5.QtWidgets import QInputDialog
        name, ok = QInputDialog.getText(self, "New Category", "Category name:")
        if ok and name:
            cat_dir = Path(self.manager.presets_dir) / name.lower().replace(' ', '_')
            cat_dir.mkdir(parents=True, exist_ok=True)
            self.load_presets()

    def import_presets(self):
        """Import presets from file"""
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Import Presets",
            "",
            "JSON Files (*.json)"
        )

        if file_path:
            if self.manager.import_presets(Path(file_path)):
                QMessageBox.information(self, "Success", "Presets imported!")
                self.load_presets()
            else:
                QMessageBox.warning(self, "Error", "Failed to import presets")

    def export_presets(self):
        """Export all presets to file"""
        file_path, _ = QFileDialog.getSaveFileName(
            self,
            "Export Presets",
            "presets_export.json",
            "JSON Files (*.json)"
        )

        if file_path:
            if self.manager.export_all_presets(Path(file_path)):
                QMessageBox.information(self, "Success", "Presets exported!")
            else:
                QMessageBox.warning(self, "Error", "Failed to export presets")


def main():
    """Run GUI application"""
    if not HAS_QT:
        print("PyQt5 is required for the GUI.")
        print("Install with: pip install PyQt5")
        return 1

    app = QApplication(sys.argv)
    app.setApplicationName("PluginAE Preset Manager")

    window = PresetManagerGUI()
    window.show()

    return app.exec_()


if __name__ == '__main__':
    sys.exit(main())
