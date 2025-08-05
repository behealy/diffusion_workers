from enum import Enum
from dataclasses import dataclass
from typing import Any

class OpStatus(Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"

@dataclass
class OpResult:
    operation: str
    status: OpStatus
    message: str | None = None
    result: Any | None = None
