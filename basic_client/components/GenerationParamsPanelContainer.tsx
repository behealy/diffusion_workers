import React from 'react';
import { useGenerationStore } from '@/hooks/useStores';
import { GenerationParamsPanel } from './GenerationParamsPanel';

export const GenerationParamsPanelContainer: React.FC = () => {
  const {
    stagedParams,
    setPrompt,
    setNegativePrompt,
    setBaseModel,
    setGuidanceScale,
    setInferenceSteps,
    setSeed,
    setDimensions,
    setPipelineOptimizations,
    startGeneration,
  } = useGenerationStore();

  // Dimension change handlers
  const handleWidthChange = (width: number) => {
    setDimensions({ width });
  };

  const handleHeightChange = (height: number) => {
    setDimensions({ height });
  };

  // Pipeline optimization handlers
  const handleUseDeepCacheChange = (useDeepcache: boolean) => {
    setPipelineOptimizations({ useDeepcache });
  };

  const handleDeepCacheIntervalChange = (deepcacheInterval: number) => {
    setPipelineOptimizations({ deepcacheInterval });
  };

  const handleDeepCacheBranchIdChange = (deepcacheBranchId: number) => {
    setPipelineOptimizations({ deepcacheBranchId });
  };

  const handleUseTorchCompileChange = (useTorchCompile: boolean) => {
    setPipelineOptimizations({ useTorchCompile });
  };

  return (
    <GenerationParamsPanel
      prompt={stagedParams.prompt || ''}
      onPromptChange={setPrompt}
      negativePrompt={stagedParams.negativePrompt || ''}
      onNegativePromptChange={setNegativePrompt}
      baseModel={stagedParams.baseModel || ''}
      onBaseModelChange={setBaseModel}
      guidanceScale={stagedParams.guidanceScale}
      onGuidanceScaleChange={setGuidanceScale}
      inferenceSteps={stagedParams.inferenceSteps}
      onInferenceStepsChange={setInferenceSteps}
      seed={stagedParams.seed}
      onSeedChange={setSeed}
      width={stagedParams.dimensions.width}
      height={stagedParams.dimensions.height}
      onWidthChange={handleWidthChange}
      onHeightChange={handleHeightChange}
      useDeepCache={stagedParams.pipelineOptimizations?.useDeepcache || false}
      onUseDeepCacheChange={handleUseDeepCacheChange}
      deepCacheInterval={stagedParams.pipelineOptimizations?.deepcacheInterval || 3}
      onDeepCacheIntervalChange={handleDeepCacheIntervalChange}
      deepCacheBranchId={stagedParams.pipelineOptimizations?.deepcacheBranchId || 0}
      onDeepCacheBranchIdChange={handleDeepCacheBranchIdChange}
      useTorchCompile={stagedParams.pipelineOptimizations?.useTorchCompile || false}
      onUseTorchCompileChange={handleUseTorchCompileChange}
      onStartGeneration={startGeneration}
    />
  );
};