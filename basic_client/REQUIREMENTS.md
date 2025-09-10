# Functional requirements
## Some Definitions
API - also known as the EZ Diffusion api, this is an api server that runs generative inference jobs using diffuser models. It is capable of text-to-image, image-to-image, and image-inpainting generation. The definitions of this api are in an openapi schema located at in 'openapi/ez_diffusion_api.yaml'.
FRONTEND - This application. This application is a UI frontend that interfaces with an EZ Diffusion Api (hereafter referred to as the API). (The api is defined by an openapi schema ).
GENERATION REQUEST - any request made by the application to any of the generation endpoints of the API. For this application, these include /image-to-image, /text-to-image, and /inpaint. 
MAIN SCREEN - this is the main screen of the application that houses all the UI submodules.
CONTEXTUAL MODAL - this is a modal that can show a diverse range of contents depending on how and why it was opened and shown. 

Some of the openapi schema objects are referenced directly in this document, please take note of their fields and structures:
- LoraParams
- ImageToImageParams
- ControlNetParams
- InpaintParams

The application will have a single MAIN SCREEN that is divided into several UI submodules: 
- Input image panel (for image-to-image generation), 
- Output image panel (showing the product of the last generation), 
- Modifier items list panel - a panel with a list of "modifier" items (explained below in [Modifier items list panel](##modifier-items-list-panel)), 
- Generation control panel: a control panel for the generation parameters (some examples: prompt, guidance scale, etc.), and a top menu bar that can feature any number of textual menu items that open dropdowns to handle certain settings.

In addition to the contents of the MAIN SCREEN, a CONTEXTUAL MODAL that shows over the MAIN SCREEN will appear when the user takes certain actions. The contents of the CONTEXTUAL MODAL will change depending on the action taken from different parts of the UI, and those details will be described later in this document.

## UI submodules
### Input image panel
The input image panel should allow users to select an image from the file system or a local directory, and display it here. If no image is selected, no starting image will be used in image generation and the GENERATION REQUEST will be made with the `/text-to-image` call.

IF an input image is selected, it MUST be sent with the GENERATION REQUEST in the `ImageToImageParams` as a base64 string with the `/image-to-image` call.

IF an imput image is selected, AND a mask is drawn, the GENERATION REQUEST MUST be made with the `/inpaint` call and the image is to be sent as a base64 string in the `InpaintParams`.

#### Input image panel feature: Mask drawing
If an input image has been selected, the user should be able to draw a mask onto the image. There should be a size slider control below the image that allows the user to adjust the size of the brush being used to draw the mask onto the image. When the user draws a mask, the mask should show over the top of the input image in the places it was drawn, in black.

### Output image panel
The output image panel MUST display the image that resulted from the last image generation call. Below the actual image, there MUST be a button that allows the user to then move that output image to be used as the next image input, and show up in the input image panel.

### Generation control panel
The generation control panel will show a list of controls for the next image generation operation. 
The input fields within this panel will be displayed from top to bottom. The input fields will correspond to the parameters at the ROOT of the `ImageGenerationParams` schema object.

### Modifier items list panel
The modifier items list panel will currently support two types of modifier items: controlnets and Loras. 

Each list item should match the width of the parent list. The height of each item will be whatever height is necessary to fully show their contents, as in each item wraps it's contents. 

At the bottom right of the list, floating over the contents of the list will be a "+" button, that when clicked will open a CONTEXTUAL MODAL, showing a list of options for modifier items to create to add to the modifier item list. There will be two options in this list: Lora modifier item, or Controlnet modifier item. 

Then, when the user selects an option for a creating a:
- Lora modifier item, the CONTEXTUAL MODAL will change it's contents to either show the form with params for the lora model to be added as detailed in [Lora modifier item CONTEXTUAL MODAL](#####lora-modifier-item-contextual-modal)
- Controlnet modifier item, the CONTEXTUAL MODAL will change it's contents to either show the form with params for the controlnet model to be added as detailed in [Controlnet modifier item CONTEXTUAL MODAL](#####controlnet-modifier-item-contextual-modal). 

#### Lora modifier items
These items will show the hugging face path of the lora model (text), the weight file name (text), and the scale (float). These values MUST NOT be editable directly from this list item, instead, the user MUST be able to click on the item and show the contextual modal over the main screen.

##### Lora modifier item CONTEXTUAL MODAL
The modal that opens when the user clicks on a lora modifier item will have a form that has input fields for specifiying the lora model, weight file name, and scale. 
Upon clicking the CLOSE BUTTON (see [Contextual modal container](###contextual-modal-container)), the values in the fields will update the state of the lora arguments to be sent in the next generation request.

#### Controlnet modifier items
Each controlnet modifier item will display text for the current values present in the `ControlNetParams` object. The values will be situated in a column on the left side of the modifier item, except for the preview of the selected guide_image, which will be displayed on the right side of the control item in a small square thumbnail. These values MUST NOT be editable directly from this list item, instead, the user MUST be able to click on the item and show the contextual modal over the main screen.

##### Controlnet modifier item CONTEXTUAL MODAL
The CONTEXTUAL MODAL for controlnet settings will display input fields with the proper types as dictated by the `ControlNetParams` schema object. 
The `guide_image` field should be handled as another image input where the image that is chosen will be sent with `ControlNetParams` as a base64 string. There should be a small preview thumbnail of the image that is selected after it is selected.

## Basic shared UI components
### Numerical sliders
All sliders should have a text input next to them that shows the currently selected value. The user should also be able to directly input a number value in the text input using their physical or software keyboard, and the slider will update accordingly.

### Contextual modal container
This is the base component of the contextual modal, and will hold the various contents that are specific to the user action being taken. This container will feature a CLOSE BUTTON on the top right corner, that will close the modal and cancel any changes or actions made by the user to the contextual modal. At the bottom center, below the contextual content, will be a save button that performs the final action of the modal and closes it. The action must be a function that can be passed into the container since it will have to be flexible.

# Non-functional requirements
None of the language in these non-functional requirements should be construed to suggest the use of a specific framework or library for building this frontend. 

- The client MUST be implmented with a technology stack that allows cross-platform deployment via desktop web and iOS and android mobile applications. The devices that this can be used on for mobile applications should include
tablets and phones. 
- All UI components should be modular and stateless. Stateful wrappers will be used to pass down data to pure/stateless components. 
- Stateful wrappers should be performant and modular, if needed. 
- This FRONTEND should be responsive and adaptable for different screen sizes and orientations.
- This FRONTEND should be as performant as possible, with minimal overhead and no unnecessary computations or rerenders. 
- This FRONTEND should have a consistent design and layout that is easy to use and maintain.
- This FRONTEND should make use of the generated client for the openapi schema mentioned earlier in this document to invoke the API calls that are discussed in this document.
- This FRONTEND should be implemented using the best development practices that are applicable to the frameworks and libraries that are chosen for building this FRONTEND.
- This FRONTEND should be implemented using software engineering best practices, including Clean Architecture, Clean Code, and DRY (Do not repeat yourself).


Using the technical plan in basic_client/TECHNICAL_PLAN.md, carry out ONLY Task 6 and Task 7 in the technical plan. Make sure to create a new branch, and commit with descriptive commit messages as you work your way through the tasks. Review the basic_client/REQUIREMENTS.md doc if you need to.
Use sequential thinking, and use context7 if you need to understand more deeply how do do something by looking at any relevant documentation. Update the technical plan document checkboxes at the end. Finally, use the gh commandline tool to create a PR. Use git log and git diff with the main branch to create a PR message and title when calling gh pr create.
