
figma.showUI(__html__, { width: 360, height: 320 });

const existingCollections = figma.variables.getLocalVariableCollections();


if (existingCollections.length > 0) {
  const collectionSets = existingCollections.map((localCollection) => ({
    name: localCollection.name,
    id: localCollection.id,
    modes: localCollection.modes
  }));


  figma.ui.postMessage({
    type: "render-collections",
    collectionSets
  })
} else {
  figma.ui.postMessage({
    type: "render-collection-input"
  })
}



function updateButtonState() {
  const selectionLength = figma.currentPage.selection.length;
  figma.ui.postMessage({
    type: "show-tip",
    selectionLength
  })

}

updateButtonState()

figma.on('selectionchange', () => {
  updateButtonState()
});


figma.ui.onmessage = msg => {

  if (msg.type === 'create-variables') {
    let collection: any;
    let modeId: string;

    if (msg.collectionId) {
      collection = figma.variables.getVariableCollectionById(msg.collectionId);

    }

    if (!collection) {
      collection = figma.variables.createVariableCollection(msg.collectionId);
      modeId = collection.modes[0].modeId;
    }

    if (msg.currentMode) {
      modeId = msg.currentMode;
    } else {
      modeId = collection.modes[0].modeId;
    }


    if (collection) {
      figma.currentPage.selection.forEach((selectedObject: any) => {

        const prohibitedCharacters = ['{', '}', '.', '$'];
        const containsCharacters = prohibitedCharacters.some(char => selectedObject.name.includes(char));
        if (containsCharacters) {
          figma.closePlugin("Variable name cannot include the following symbols: { } . $");
        } else {
          // if (selectedObject.type === "RECTANGLE" || selectedObject.type === "ELLIPSE" || selectedObject.type === "FRAME" || selectedObject.type === "TEXT") {
          if (selectedObject.fills[0].type === "IMAGE") {
            figma.closePlugin("Variables cannot contain images :(");
          }

          const existingColorVariableId = collection.variableIds.find((variableId: any) => figma.variables.getVariableById(variableId)?.name === selectedObject.name);
          const existingColorVariable = figma.variables.getVariableById(existingColorVariableId);


          if (existingColorVariable) {
            existingColorVariable.setValueForMode(modeId, { r: selectedObject.fills[0].color.r, g: selectedObject.fills[0].color.g, b: selectedObject.fills[0].color.b, a: selectedObject.fills[0].opacity });
          } else {

            const colorVariable = figma.variables.createVariable(selectedObject.name, collection.id, "COLOR");
            colorVariable.setValueForMode(modeId, { r: selectedObject.fills[0].color.r, g: selectedObject.fills[0].color.g, b: selectedObject.fills[0].color.b, a: selectedObject.fills[0].opacity });
          }
          // }
        }


      });

    }

  }
  figma.closePlugin("Created variables ✅");
};
