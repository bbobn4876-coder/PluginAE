/**
 * Example JSX Script for AEP Preview Plugin
 * This script creates a simple composition with a text layer
 */

// Create a new composition
var comp = app.project.items.addComp("Example Composition", 1920, 1080, 1, 5, 30);

// Add a text layer
var textLayer = comp.layers.addText("Hello from AEP Preview!");
var textProp = textLayer.property("Source Text");
var textDocument = textProp.value;

// Style the text
textDocument.fontSize = 72;
textDocument.fillColor = [1, 1, 1]; // White color

textProp.setValue(textDocument);

// Center the text
textLayer.property("Position").setValue([comp.width / 2, comp.height / 2]);

// Return success message
"Composition created successfully!";
