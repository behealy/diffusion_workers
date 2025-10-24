from abc import ABC, abstractmethod
from typing import Any, Callable, Dict, List, Optional, Generic, TypeVar

class InferenceService(ABC):
    @abstractmethod
    def generate(self, input_params) -> Any:
        pass

class RPWorkerInferenceService(InferenceService):
    @abstractmethod
    def warmup(self): 
        pass

    @abstractmethod
    def rp_worker_generate(self, job) -> Any:
        pass
