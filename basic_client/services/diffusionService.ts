import { Configuration, ImageGenerationApi, SystemApi } from '@/lib/ezdiffusion';
import type {
  GetImageGenHistory200Response,
  GetImageGenHistoryRequest,
  ImageGenerateRequest,
  ImageGenerationHistoryResponse,
  ImageGenerationResponse,
  MemoryInfoResponse,
} from '@/lib/ezdiffusion';
import { API_ENDPOINTS } from '@/constants/api';

class DiffusionService {
  private imageGenApi: ImageGenerationApi;
  private systemApi: SystemApi;
  private configuration: Configuration;

  constructor(baseUrl?: string) {
    this.configuration = new Configuration({
      basePath: baseUrl || this.getApiEndpoint(),
      fetchApi: fetch,
    });

    this.imageGenApi = new ImageGenerationApi(this.configuration);
    this.systemApi = new SystemApi(this.configuration);
  }

  private getApiEndpoint(): string {
    // In React Native/Expo, you can use environment variables or hardcode for now
    // Later this can be configured through app settings
    if (__DEV__) {
      return API_ENDPOINTS.DEVELOPMENT;
    }
    return API_ENDPOINTS.PRODUCTION;
  }

  async generateImage(request: ImageGenerateRequest): Promise<ImageGenerationResponse> {
    try {
      let response
      if (request.input.imageToImage) {
        response = this.imageToImage(request);
      } else if (request.input.inpaint) {
        response = this.inpaint(request);
      } else {
        response = this.textToImage(request);
      }
      return response;
    } catch (error) {
      console.error('Error generating image:', error);
      throw this.handleError(error);
    }
  }

  async getHistory(request: GetImageGenHistoryRequest): Promise<ImageGenerationHistoryResponse> {
    try {
      const response = await this.imageGenApi.getImageGenHistory(request);
      return response;
    } catch (error) {
      console.error('Error in text-to-image generation:', error);
      throw this.handleError(error);
    }
  }

  async textToImage(request: ImageGenerateRequest): Promise<ImageGenerationResponse> {
    try {
      const response = await this.imageGenApi.textToImage({
        imageGenerateRequest: request,
      });
      return response;
    } catch (error) {
      console.error('Error in text-to-image generation:', error);
      throw this.handleError(error);
    }
  }

  async imageToImage(request: ImageGenerateRequest): Promise<ImageGenerationResponse> {
    try {
      const response = await this.imageGenApi.imageToImage({
        imageGenerateRequest: request,
      });
      return response;
    } catch (error) {
      console.error('Error in image-to-image generation:', error);
      throw this.handleError(error);
    }
  }

  async inpaint(request: ImageGenerateRequest): Promise<ImageGenerationResponse> {
    try {
      const response = await this.imageGenApi.inpaint({
        imageGenerateRequest: request,
      });
      return response;
    } catch (error) {
      console.error('Error in inpainting:', error);
      throw this.handleError(error);
    }
  }

  async getMemoryInfo(): Promise<MemoryInfoResponse> {
    try {
      const response = await this.systemApi.getMemoryInfo();
      return response;
    } catch (error) {
      console.error('Error getting memory info:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    if (typeof error === 'string') {
      return new Error(error);
    }
    return new Error('An unknown error occurred');
  }

  updateBaseUrl(baseUrl: string): void {
    this.configuration = new Configuration({
      basePath: baseUrl,
    });
    this.imageGenApi = new ImageGenerationApi(this.configuration);
    this.systemApi = new SystemApi(this.configuration);
  }
}

// Export a singleton instance
export default new DiffusionService();

// Export the class for custom instances if needed
export { DiffusionService };
