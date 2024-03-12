import { Injectable } from '@nestjs/common';
import { ImageAnnotatorClient, protos } from '@google-cloud/vision';

@Injectable()
export class VisionService {
  private visionClient = new ImageAnnotatorClient();

  constructor() {}
  async analyzeImage(imageUrl: string): Promise<any> { 
    const features = [
      { type: 'LABEL_DETECTION' },
      { type: 'IMAGE_PROPERTIES' }, 
    ];
  
    const request = {
      image: { source: { imageUri: imageUrl } },
      features: features,
    };
  
    const [result] = await this.visionClient.annotateImage(request);
    
    
    const colors = result.imagePropertiesAnnotation?.dominantColors?.colors;
  
    
    return {
      labels: result.labelAnnotations?.map(label => label.description) || [],
      colors: colors, 
    };
  }
  
}
