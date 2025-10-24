# ImageGenerationParams


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**prompt** | **str** | Text prompt describing the desired image | 
**starting_image** | **str** | Base64 encoded starting image for image-to-image or inpainting | [optional] 
**negative_prompt** | **str** | Negative prompt to avoid unwanted elements | [optional] 
**base_model** | **str** | HuggingFace model identifier to use for generation | [optional] 
**guidance_scale** | **float** | How closely to follow the prompt (higher &#x3D; more faithful) | [optional] [default to 7.5]
**inference_steps** | **int** | Number of denoising steps (higher &#x3D; more detailed but slower) | [optional] [default to 50]
**seed** | **int** | Random seed for reproducible generation | [optional] 
**dimensions** | [**ImageGenerationParamsDimensions**](ImageGenerationParamsDimensions.md) |  | 
**inpaint** | [**InpaintParams**](InpaintParams.md) |  | [optional] 
**image_to_image** | [**ImageToImageParams**](ImageToImageParams.md) |  | [optional] 
**controlnets** | [**List[ControlNetParams]**](ControlNetParams.md) | List of ControlNet configurations | [optional] 
**loras** | [**List[LoraParams]**](LoraParams.md) | List of LoRA adapter configurations | [optional] 
**pipeline_optimizations** | [**ImageGenerationParamsPipelineOptimizations**](ImageGenerationParamsPipelineOptimizations.md) |  | [optional] 

## Example

```python
from ez_diffusion_client.models.image_generation_params import ImageGenerationParams

# TODO update the JSON string below
json = "{}"
# create an instance of ImageGenerationParams from a JSON string
image_generation_params_instance = ImageGenerationParams.from_json(json)
# print the JSON string representation of the object
print(ImageGenerationParams.to_json())

# convert the object into a dict
image_generation_params_dict = image_generation_params_instance.to_dict()
# create an instance of ImageGenerationParams from a dict
image_generation_params_from_dict = ImageGenerationParams.from_dict(image_generation_params_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


