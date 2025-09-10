import { create, StateCreator } from 'zustand';
import {
    ImageGenerationParams,
    OpStatus,
} from '../lib/ezdiffusion';
import { HistoryState } from './HistoryState';
import { PendingImageGenParamsState } from './PendingImageGenParamsState';

const TEMP_JOB_ID = "temp_pending_job"

export const createHistoryState: StateCreator<HistoryState & PendingImageGenParamsState, [], [], HistoryState> = (set, get, store) => ({
    generationHistory: [],
    addPendingItemToHistory: (stagedParams: ImageGenerationParams, opStatus: OpStatus) => {
        set((state) => {
            const history = state.generationHistory.filter(it => it.jobId == TEMP_JOB_ID)
            return {
                generationHistory: [
                    {
                        jobId: TEMP_JOB_ID,
                        input: stagedParams,
                        generationState: opStatus,
                        progress: 0
                    },
                    ...history
                ]
            }
        })
    }
})