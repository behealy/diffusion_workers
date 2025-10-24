from .opresult import *

# 0 -- openpose
# 1 -- depth
# 2 -- hed/pidi/scribble/ted
# 3 -- canny/lineart/anime_lineart/mlsd
# 4 -- normal
# 5 -- segment
# 6 -- tile
# 7 -- repaint
class CNUnionControlMode(Enum):
    OPENPOSE = 0
    DEPTH = 1
    HED_PIDI_SCRIBBLE_TED = 2
    CANNY_LINEART_ANIME_LINEART_MLSD = 3
    NORMAL = 4
    SEGMENT = 5
    TILE = 6
    INPAINT = 7

class PipeType(Enum):
    TEXT2IMAGE = "t2i"
    IMAGE2IMAGE = "i2i"
    INPAINT = "inpaint"
    TEXT2VID = "t2v"
    IMG2VID = "i2v"
    FF2LFVID = "ff2lfv"