# Diffusion Workers Test Client

A web-based UI for testing image and video generation endpoints.

## Quick Start

### Option 1: Using the start script (Linux/Mac)
```bash
cd test_client
./start.sh
```

### Option 2: Manual server start
```bash
cd test_client
python3 -m http.server 8080
# Open http://localhost:8080 in your browser
```

For Windows, use PowerShell or download Python and run:
```powershell
cd test_client
python -m http.server 8080
```

## Features

- **Text-to-Image**: Generate from text prompts with preset dimensions
- **Image-to-Image**: Transform existing images
- **Inpainting**: Edit masked areas of images  
- **ControlNet**: Guided generation (canny, depth, openpose, etc.)
- **LoRA**: Apply style/adapter models
- **History**: View past generations (stored in browser localStorage)
- **Memory Info**: Monitor GPU/system memory from the server

## Requirements

- A running diffusion workers server at `http://localhost:8000`
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Modern JavaScript engine (ES6+)

## Using the Client

1. Set your target server URL in the header if different from localhost:8000
2. Select a generation mode from the tabs
3. Fill in the required fields
4. Drag and drop images into designated zones or click to select files
5. Click "Generate" to create images
6. View results in the modal popup
7. Check history tab to see all generations

## Note on Local Development

In **local_debug** mode, images are saved as local files instead of base64 URLs. Adjust the client to handle this format if needed.
