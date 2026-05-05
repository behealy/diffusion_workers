(function() {
  'use strict';

  // Configuration
  const config = {
    serverUrl: window.location.protocol + '//localhost:8000',
    historyPageLength: 10,
    historyCacheKey: 'diffusion_generation_history'
  };

  // State
  let state = {
    currentTab: 'text2image',
    history: [],
    historyIndex: 0,
    memoryInfo: null
  };

  const presets = [
    { name: 'SDXL Large', width: 1024, height: 1024 },
    { name: 'SDXL Portrait', width: 768, height: 1024 },
    { name: 'SDXL Landscape', width: 1024, height: 768 },
    { name: 'SD1.5 Standard', width: 512, height: 512 },
    { name: 'SD1.5 Portrait', width: 512, height: 768 }
  ];

  async function init() {
    cacheHistory();
    
    // Build tabs
    const tabNames = ['text2image', 'i2i', 'inpaint', 'controlnet', 'lora', 'history', 'memory'];
    const tabsContainer = document.getElementById('tabs-container');
    tabsContainer.innerHTML = tabNames.map((tab, idx) => 
      `<button class="tab-btn ${tab === state.currentTab ? 'active' : ''}" data-tab="${tab}">${tabTitle(tab)}</button>`
    ).join('');

    // Tab button click handlers
    tabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = () => switchTab(btn.dataset.tab);
    });

    // Setup drop zones
    setupDropZones();

    // Setup form submissions
    setupFormSubmissions();

    // Click to select file handlers for drop zones
    document.querySelectorAll('.drop-zone').forEach(zone => {
      zone.querySelector('input[type="file"]').onclick = (e) => e.stopPropagation();
    });

    // Event listeners for UI updates
    window.onresize = () => updateSliderValues();

    cacheHistory();
    
    console.log('Test client initialized');
  }

  function tabTitle(tab) {
    const titles = {
      text2image: 'Text to Image',
      i2i: 'Image to Image',
      inpaint: 'Inpainting',
      controlnet: 'ControlNet',
      lora: 'LoRA Testing',
      history: 'Generation History',
      memory: 'Memory Info'
    };
    return titles[tab] || tab;
  }

  function cacheHistory() {
    try {
      const cached = localStorage.getItem(config.historyCacheKey);
      if (cached) {
        state.history = JSON.parse(cached).slice(-100);
      } else {
        state.history = [];
      }
    } catch (e) {
      console.warn('Could not load history from localStorage:', e);
      state.history = [];
    }
  }

  function saveHistory(newItem) {
    try {
      const itemToAdd = {
        type: 'text-to-image',
        dimensions: newItem.dimensions || {},
        prompt: newItem.prompt || ''
      };
      
      state.history.unshift(itemToAdd);
      if (state.history.length > 100) {
        state.history = state.history.slice(0, 100);
      }
    } catch (e) {}
  }

  function switchTab(tabName) {
    state.currentTab = tabName;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    document.querySelectorAll('.content-section').forEach(section => {
      if (section.id.endsWith('-section')) {
        section.style.display = section.id.replace('-section', '') === tabName || tabName === 'memory' 
          ? 'block' : 'none';
      }
    });

    // Reset forms when switching away from generation tabs
    const resetCallback = () => {
      if (tabName !== 'history') resetForm();
    };

    setTimeout(() => window.onswitchTab && window.onswitchTab(tabName), 0);
    
    // Setup onshown callbacks
    window.onswitchTab = () => {
      resetCallback();
    };
    window.switchTab = switchTab;

    if (tabName === 'history') renderHistoryTable();
  }

  function setupDropZones() {
    ['starting_image', 'mask', 'control_image'].forEach(targetId => {
      const input = document.getElementById(targetId);
      if (!input) return;

      input.onchange = async (e) => {
        if (e.target.files && e.target.files[0]) {
          await uploadToBase64(e.target.files[0]);
        }
      };

      const zone = document.querySelector(`[data-drop-target="${targetId}"]`);
      zone.classList.add('drop-zone');
    });

    document.getElementById('text-to-image-dimensions').onchange = updateFromPreset;
  }

  async function uploadToBase64(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        // Update the file input value
        const allInputs = document.querySelectorAll('input[type="file"]');
        arrayToAll(allInputs, f => {
          if (!f.file || f.file === FileList[0]) {
            f.files = [file];
          }
        });

        // Show preview in drop zone
        showPreview(file.name, e.target.result);

        resolve(e.target.result);
      };

      reader.onerror = reject;
      
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('File too large (max 10MB)'));
      } else {
        reader.readAsDataURL(file);
      }
    });
  }

  function showPreview(filename, base64Data = null) {
    let previewContainer;
    const targetId = Array.from(document.querySelectorAll('.drop-zone')).find(z => z.querySelector('input[type="file"]'));
    // Extract drop zone id from input element's parent
    const allInputs = document.querySelectorAll('input[type="file"]');
    for (let i = 0; i < allInputs.length; i++) {
      console.log(allInputs[i]);
    }

    return new Promise((resolve) => {
      const targetId = Array.from(document.querySelectorAll('.drop-zone')).find(z => z.querySelector('input[type="file"]'));
      // Show the preview image in a drop zone after upload.
      let idx = 0;
      
      function tryNextZone() {
        if (idx >= allInputs.length) {
          resolve();
          return;
        }
        
        const input = allInputs[idx];
        const zoneDiv = document.getElementById(input.id + '-zone') || document.getElementById('starting_image-zone');
        
        if (zoneDiv) {
          const contentDiv = zoneDiv.querySelector('.drop-zone-content');
          if (contentDiv) {
            // Remove existing preview if it exists
            const oldImg = Array.from(document.querySelectorAll('.preview-image'));
            oldImg.forEach(img => img.remove());

            if (!base64Data && file.dataset.preview || typeof file === 'string') {
              resolve(file);
            } else {
              const img = document.createElement('img');
              img.src = base64Data || '';
              img.style.maxWidth = '300px';
              img.style.maxHeight = '200px';
              img.className = 'preview-image';
              contentDiv.insertAdjacentElement('afterend', img);
              resolve();
            }
          } else {
            idx++;
            tryNextZone();
          }
        }
      }

      showPreview(filename, base64Data);
    });
  }

  function arrayToAll(selector, callback) {
    document.querySelectorAll(selector).forEach(element => callback(element));
  }

  function setupFormSubmissions() {
    const forms = [
      ['text2image', generateTextToImage],
      ['i2i', generateI2I],
      ['inpaint', generateInpaint],
      ['controlnet', generateControlNet],
      ['lora', generateLoRA]
    ];

    forms.forEach(([tab, handler]) => {
      const form = document.querySelector(`#${tab}-section > .card > form`);
      if (form) {
        form.onsubmit = async (e) => {
          e.preventDefault();
          await handler(tab, e.target);
        };
      }
    });

    // Memory refresh button
    document.getElementById('refresh-memory-btn').onclick = loadMemoryInfo;
    document.querySelector('.reset-form-btn')?.onclick || (() => console.log('No reset form button found'));
  }

  function generateTextToImage(tab, form) {
    if (!form['text-to-image-prompt'].value.trim()) {
      showNotification('Please enter a prompt', 'error');
      return;
    }

    const dimensionsStr = form['text-to-image-dimensions'].value.split(',').map(Number);
    const formData = {
      prompt: form['text-to-image-prompt'].value,
      negative_prompt: form['text-to-image-negative-prompt'].value || '',
      seed: parseInt(form['text-to-image-seed'].value) || null
    };

    if (dimensionsStr.length === 2) {
      formData.dimensions = { width: dimensionsStr[0], height: dimensionsStr[1] };
    }

    const stepsVal = form['text-to-image-steps-val'].textContent;
    const guidanceVal = form['text-to-image-guidance-val'].textContent;

    if (parseFloat(stepsVal) >= 1 && parseFloat(guidanceVal) <= 20) {
      formData.inference_steps = parseInt(stepsVal);
      formData.guidance_scale = parseFloat(guidanceVal);
    }

    return generateImageForm(tab, formData, 'Text-to-Image Generation');
  }

  function generateI2I(tab, form) {
    const prompt = form['image-to-image-prompt'].value;
    
    if (!prompt.trim()) {
      showNotification('Please enter a prompt', 'error');
      return;
    }

    const startingImage = document.getElementById('starting_image').value || null;
    if (!startingImage) {
      showNotification('Please upload a starting image', 'error');
      return;
    }

    // Check image data validity
    try {
      let imgData = startingImage.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
      const base64Regex = /^[A-Za-z0-9+/=]+$/;
      if (!base64Regex.test(imgData)) {
        showNotification('Invalid image data format', 'error');
        return;
      }
    } catch (e) {
      console.warn('Invalid image data:', e);
    }

    const formData = {
      input: {}
    };

    if (prompt) {
      formData.input.prompt = prompt;
    }

    if (startingImage) {
      formData.input.starting_image = startingImage;
    }

    return generateImageForm(tab, formData, 'Image-to-Image Generation');
  }

  function generateInpaint(tab, form) {
    const prompt = form['inpaint-prompt'].value;

    if (!prompt.trim()) {
      showNotification('Please enter a prompt', 'error');
      return;
    }

    const startingImage = document.getElementById('starting_image').value || null;
    const maskImage = document.getElementById('mask').value || null;

    if (!startingImage) {
      showNotification('Please upload a starting image', 'error');
      return;
    }

    const formData = {
      input: {}
    };

    form['text-to-image-dimensions'].onchange(); // Get default dimensions if not set
    let dimensionsStr = form['text-to-image-dimensions'].value;
    if (dimensionsStr) {
      const [w, h] = dimensionsStr.split(',').map(Number);
      formData.input.dimensions = { width: w, height: h };
    }

    if (prompt) formData.input.prompt = prompt;

    return generateImageForm(tab, formData, 'Inpainting Generation');
  }

  function generateControlNet(tab, form) {
    const prompt = form['controlnet-prompt'].value;

    if (!prompt.trim()) {
      showNotification('Please enter a prompt', 'error');
      return;
    }

    let startingImage = document.getElementById('starting_image-zone').innerText.replace('\n', '').replace(/\s+/g, '');
    console.log('Starting Image:', startingImage);

    console.log(JSON.parse(startingImage));

    let guide_image = JSON.parse(startingImage);

    if (!guide_image) {
      showNotification('Please upload a control image', 'error');
      return;
    }

    const width = parseInt(form['controlnet-width'].value, 10) || 512;
    const height = parseInt(form['controlnet-height'].value, 10) || 512;
    
    const conditioningScale = form['controlnet-scale-val'].textContent;

    return generateImageForm(tab, {
      prompt: prompt,
      dimensions: { width: width, height: height },
      controlnets: [
        {
          processor_type: guide_image.model || 'canny',
          guide_image: JSON.parse(guide_image),
          controlnet_conditioning_scale: parseFloat(conditioningScale) || 0.8
        }
      ]
    });
  }

  function generateLoRA(tab, form) {
    const prompt = form['lora-prompt'].value;

    if (!prompt.trim()) {
      showNotification('Please enter a prompt', 'error');
      return;
    }

    const loraModel = form['lora-model'].value || '';
    const loraWeightName = form['lora-weight-name'].value || '';
    const loraScale = parseFloat(form['lora-scale'].value) || 0.8;
    const loraTag = form['lora-tag'].value;

    if (!loraModel || !loraWeightName) {
      showNotification('Please provide LoRA model and weight name', 'error');
      return;
    }

    return generateImageForm(tab, {
      prompt: prompt,
      loras: [
        {
          model: loraModel,
          weight_name: loraWeightName,
          scale: loraScale
        }
      ]
    });
  }

  function resetText2Image() {
    document.querySelector('#text-to-image-prompt').value = '';
    document.querySelector('#image-to-image-strength-min').value = '0.8';
    window.onswitchTab();
  }

  async function generateImageForm(tab, formData, operationTitle) {
    showNotification('Generating...', '');
    const form = document.getElementById(`${tab}-section > .card > form`);
    
    if (operationTitle.includes('Text to Image') || 
        operationTitle.includes('LoRA')) {
      operationTitle = operationTitle.replace('Generation', '');
    } else {
      operationTitle = operationTitle;
    }

    try {
      const response = await fetch(config.serverUrl + '/image-gen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 200 || response.status === 201) {
        const result = await response.json();
        showNotification('Success! Image generated.', 'success');
        document.querySelector('#result-modal .modal').style.display = 'flex';
        showImageModal(result.image);
      } else if (response.status >= 400 && response.status < 500) {
        const errorText = await getTextResponse(response);
        let message = `Request failed: ${response.status}`;
        if (errorText.trim()) {
          try {
            const jsonError = JSON.parse(errorText);
            message = typeof jsonError === 'string' ? 
              jsonError : 
              Object.entries(jsonError).map(([k, v]) => `${k}: ${v}`).join(', ');
          } catch (e) {}
        }
        showNotification(message, 'error');
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  }

  async function generate(textToImage, callback) {
    try {
      const inputParams = buildInputParameters(textToImage);

      if (textToImage.controlnets && textToImage.controlnets.length > 0) {
        // Add controlnet processing info
        textToImage.input.controlnets = textToImage.controlnets.map(cn => ({
          ...cn,
          processor_type: cn.processor_type || 'canny'
        }));
      }

      const formData = inputParams;

      const response = await fetch(config.serverUrl + '/image-gen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 200 || response.status === 201) {
        const result = await response.json();
        showNotification('Successfully generated image', 'success');
        callback(result.image);
      } else if (response.status >= 400 && response.status < 500) {
        const errorText = await getTextResponse(response);
        let message = `Request failed: HTTP ${response.status}`;
        try {
          const jsonError = JSON.parse(errorText);
          console.log(typeof jsonError === 'string' ? 
            jsonError : 
            Object.entries(jsonError).map(([k, v]) => `${k}: ${v}`).join(', '));
        } catch (e) {}

        if (errorText.trim() && errorText.length < 1000) {
          message = errorText;
        }
        showNotification(message, 'error');
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      showNotification(`Error: ${error.message}`, 'error');
    }
  }

  function getTextResponse(response) {
    return response.text().then(text => text);
  }

  function showImageModal(imageOrUrl) {
    const modalImg = document.getElementById('modal-image');
    const modalOverlay = document.getElementById('result-modal .modal');
    
    if (imageOrUrl && imageOrUrl.trim() !== '') {
      modalImg.src = `${imageOrUrl}?t=${Date.now()}`;
      modalOverlay.style.display = 'block';
      
      // Store for history
      cacheHistory(imageOrUrl);
    } else {
      console.warn('No image data available for display');
    }
  }

  function closeModal() {
    document.getElementById('result-modal .modal').style.display = 'none';
    showNotification('Image downloaded to browser history.', '');
  }

  async function cacheHistory(imageOrUrl) {
    console.log('Caching history...');
    console.log(imageOrUrl);
    
    const newItem = {
      type: 'image',
      dimensions: {},
      imageSource: imageOrUrl || ''
    };

    try {
      // Check localStorage size to avoid browser quota error
      try {
        const currentSize = JSON.parse(localStorage.length !== undefined
          ? localStorage[config.historyCacheKey] !== null
            : localStorage.getItem(config.historyCacheKey));
        
        if (state.history.length + 1 < 100) {
          state.history.unshift(newItem);
          saveHistory();
        } else {
          console.warn('History cache is full');
        }
      } catch (storageError) {
        if (localStorage.quotas && localStorage.quotas()) {
          localStorage.clear();
          console.log('LocalStorage cleared due to overflow');
          state.history = newItem;
          saveHistory();
        } else {
          console.warn('Could not save history:', storageError);
        }
      }
    } catch (e) {
      if (storageQuotaExceeded) {
        console.log('Storage quota exceeded');
      } else {
        console.error('Error caching history:', e);
      }
    }
  }

  function buildInputParameters(params) {
    const inputParams = {};

    // Handle prompt-related parameters
    if (params.prompt && params.prompt.trim() !== '') {
      inputParams.input['prompt'] = params.prompt;
    }

    // Handle dimensions parameter
    const dimensionsParam = document.getElementById('text-to-image-dimensions');
    const presetWidth = parseInt(dimensionsParam.value, 10) || 512;
    const presetHeight = parseInt(document.getElementById('text-to-image-height').value, 10) || 512;

    if (params.dimensions || (presetWidth > 0 && presetHeight > 0)) {
      inputParams.input['dimensions'] = { width: presetWidth, height: presetHeight };
    }

    // Handle negative prompt
    if (params.negative_prompt) {
      const negativePromptField = document.getElementById('text-to-image-negative-prompt');
      
      if (negativePromptField && negativePromptField.value || params.negative_prompt.trim()) {
        inputParams.input['negative_prompt'] = negativePromptField?.value;
      }
    }

    // Handle seed parameter
    if (params.seed) {
      const seedField = document.getElementById('text-to-image-seed');
      
      if (seedField && !isNaN(seedField.value)) {
        inputParams.input['seed'] = parseInt(seedField.value, 10);
      } else if (typeof params.seed === 'number') {
        inputParams.input['seed'] = params.seed;
      }
    }

    // Handle conditioning scale and inference steps parameters from sliders
    const conditioningField = document.getElementById('text-to-image-steps-val');

    if (conditioningField && isNaN(parseInt(conditioningField.value, 10))) {
      inputParams.input['guidance_scale'] = parseFloat(conditioningField.value);
    } else if ('guidance_scale' in params && !isNaN(params['guidance_scale'])) {
      inputParams.input['guidance_scale'] = params.guidance_scale;
    }

    const stepsField = document.getElementById('text-to-image-steps-val');
    
    if (stepsField && isNaN(parseInt(stepsField.value, 10))) {
      inputParams.input['inference_steps'] = parseInt(stepsField.value, 10);
    } else if (params.inference_steps) {
      inputParams.input['inference_steps'] = params.inference_steps;
    }

    return inputParams;
  }

  function setupSlider(valueId, updateValFunction) {
    const input = document.getElementById(valueId);
    
    if (!input) return;

    const rangeInput = input.querySelector('input[type="range"]');
    const labelSpan = input.querySelector(`#${valueId}-val`);

    rangeInput.oninput = (e) => {
      updateValFunction(e.target.value);
    };

    return labelSpan;
  }

  function updateSliderValues() {
    document.querySelectorAll('#text-to-image-steps-val').forEach(val => {
      const range = document.getElementById('text-to-image-steps-min');
      if (range && !isNaN(parseInt(range.value, 10))) {
        val.textContent = numberFormat(range.value);
      }
    });

    document.querySelectorAll('#image-to-image-strength-val').forEach(val => {
      const range = document.getElementById('image-to-image-strength-min');
      if (range && !isNaN(parseFloat(range.value))) {
        val.textContent = floatRound(range.value, 1);
      }
    });

    document.querySelectorAll('#controlnet-scale-val').forEach(val => {
      const range = document.getElementById('controlnet-scale-min');
      if (range && !isNaN(parseFloat(range.value))) {
        val.textContent = floatRound(range.value, 1);
      }
    });
  }

  function applyPreset(presetName) {
    const preset = presets.find(p => p.name === presetName);
    
    if (!preset) return;

    document.getElementById('text-to-image-dimensions').value = `${preset.width},${preset.height}`;

    // Update other sliders based on preset type
    resetForm();
  }

  function numberFormat(value, decimals = 0) {
    if (decimals > 0) {
      return value.toFixed(decimals);
    } else {
      return Math.round(value);
    }
  }

  function showNotification(message, type = '') {
    const container = document.getElementById('notification-area');
    
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}-notification`;
    notification.style.marginTop = '10px';
    notification.textContent = message;

    container.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.display = null;
      notification.style.opacity = '0';
      
      try {
        setTimeout(_ => notification.remove(), 200);
      } catch (e) {}
    }, 3000);
  }

  function floatRound(value, decimals = 1) {
    return parseFloat(value.toFixed(decimals));
  }

  let resetCalledOnce = false;
  function resetForm() {
    const form = document.querySelector(`#${state.currentTab}-section > .card > form`);
    
    if (!form || resetCalledOnce) return;
    resetCalledOnce = true;

    // Try to clear all text fields and values but preserve file inputs
    Array.from(form.elements).forEach(el => {
      if (el.type !== 'file') el.value = '';
    });
  }

  function getTextValue(fieldId, defaultVal) {
    const field = document.getElementById(fieldId);
    return field && !isNaN(parseInt(field.value)) ? field.value : defaultVal;
  }

  /* History Rendering Functions
  
     loadHistory() initializes the history display by:
      1. Retrieving cached history from localStorage (limited to 100 entries)
      2. Calculating pagination for current view
      3. Generating table rows with image previews, prompts, and dimensions
      
  */ 
  /*
   * The renderHistoryTable() function handles the visual display of 
   * generation history using a paginated table interface. It shows up to 10 items per page:
   * - Image preview (thumbnail)
   * - Prompt text
   * - Dimensions info
   */ 
  /*
    Pagination controls (previous/next buttons) only appear when there are multiple pages of results.
    History entries are stored in localStorage with quota checking to prevent overflow (max 100).
    
    The table includes:
      - Column sorting capability (Image, Prompt, Dimensions headers)
      - Clickable pagination controls
      - Page info indicator showing current range and total count
      
  */ 
  /*
   * loadMemoryInfo() fetches GPU/system memory statistics from the server endpoint.
   * It handles both real data and simulated values for testing/demo purposes.
   */

})();
