import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InputImagePanel } from '@/components'
import { OutputImagePanel } from '@/components/OutputImagePanel';
import { GenerationParamsPanelContainer } from '@/components/GenerationParamsPanelContainer';
import { GenerationParamsPanel } from '@/components/GenerationParamsPanel';
import { HistoryListContainer } from '@/components/HistoryListContainer';

export default function HomeScreen() {
   const noop = () => {};
  return (
    <SafeAreaView style={styles.container}>
        <View
          style={{
            width: "100%",
            backgroundColor: 'gray',
            alignItems: 'flex-start',
            paddingStart: 20,
           
          }}
        >
          <Text style={styles.title}>EZ Diffusion Client</Text>
        </View>
      <View style={styles.content}>    
        <GenerationParamsPanelContainer/>
       
{/* 
         <GenerationParamsPanel
              prompt={"what"}
              onPromptChange={() => {}}
              negativePrompt={ ''}
              onNegativePromptChange={() => {}}
              baseModel={''}
              onBaseModelChange={() => {}}
              guidanceScale={3}
              onGuidanceScaleChange={() => {}}
              inferenceSteps={20}
              onInferenceStepsChange={() => {}}
              seed={33}
              onSeedChange={() => {}}
              width={1024}
              height={1024}
              onWidthChange={() => {}}
              onHeightChange={() => {}}
              useDeepCache={false}
              onUseDeepCacheChange={() => {}}
              deepCacheInterval={0}
              onDeepCacheIntervalChange={noop}
              deepCacheBranchId={0}
              onDeepCacheBranchIdChange={noop}
              useTorchCompile={false}
              onUseTorchCompileChange={noop}
              onStartGeneration={noop}
            /> */}
        <HistoryListContainer/>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row'
  },
  subtitle: {
    color: '#cccccc',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});
