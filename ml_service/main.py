from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import cv2
from threading import Thread, Lock
import time
import numpy as np
import io
from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

try:
    from deepgram import DeepgramClient, PrerecordedOptions, FileSource
    _DEEPGRAM_AVAILABLE = True if DEEPGRAM_API_KEY else False
except ImportError:
    _DEEPGRAM_AVAILABLE = False
    print("[WARN] deepgram-sdk not installed.")

# ── MediaPipe ──────────────────────────────────────────────────────────────────
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision
from mediapipe import solutions as mp_solutions
from mediapipe.framework.formats import landmark_pb2

# ── PIL for frame decoding ─────────────────────────────────────────────────────
from PIL import Image

# ── Audio analysis ─────────────────────────────────────────────────────────────
import warnings
warnings.filterwarnings("ignore")
try:
    import librosa
    import joblib
    _LIBROSA_AVAILABLE = True
except ImportError:
    _LIBROSA_AVAILABLE = False
    print("[WARN] librosa/joblib not installed - /analyze/audio will return defaults.")

try:
    import whisper
    from pydub import AudioSegment
    _WHISPER_AVAILABLE = True
except ImportError:
    _WHISPER_AVAILABLE = False
    print("[WARN] whisper/pydub not installed - /transcribe will be unavailable.")

# ---------------------------------------------------------------------------
# FaceLandmarker setup (MediaPipe Tasks API)
# ---------------------------------------------------------------------------
# We use the "face_landmarker" task which provides 478 3D landmarks + blendshapes
_LANDMARKER_MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/"
    "face_landmarker/float16/1/face_landmarker.task"
)

_face_landmarker: mp_vision.FaceLandmarker | None = None

# ── MediaPipe Pose (body posture) ─────────────────────────────────────────────
_pose_detector = None
_pose_lock = Lock()


def _get_pose():
    """Lazy-load the MediaPipe Pose solution (thread-safe)."""
    global _pose_detector
    with _pose_lock:
        if _pose_detector is None:
            _pose_detector = mp_solutions.pose.Pose(
                static_image_mode=True,
                model_complexity=1,
                enable_segmentation=False,
                min_detection_confidence=0.5,
            )
    return _pose_detector


def _get_landmarker() -> mp_vision.FaceLandmarker:
    """Lazy-load the FaceLandmarker (downloads model on first call)."""
    global _face_landmarker
    if _face_landmarker is None:
        base_options = mp_python.BaseOptions(
            model_asset_path=_download_model()
        )
        options = mp_vision.FaceLandmarkerOptions(
            base_options=base_options,
            output_face_blendshapes=True,
            output_facial_transformation_matrixes=True,
            num_faces=1,
            min_face_detection_confidence=0.4,
            min_face_presence_confidence=0.4,
            min_tracking_confidence=0.4,
        )
        _face_landmarker = mp_vision.FaceLandmarker.create_from_options(options)
    return _face_landmarker


def _download_model(dest: str = "face_landmarker.task") -> str:
    """Download model file if not already cached locally."""
    import os, urllib.request
    if not os.path.exists(dest):
        print(f"Downloading MediaPipe FaceLandmarker model → {dest} …")
        urllib.request.urlretrieve(_LANDMARKER_MODEL_URL, dest)
        print("Model download complete.")
    return dest


# ---------------------------------------------------------------------------
# Landmark index constants (MediaPipe 478-point canonical face model)
# ---------------------------------------------------------------------------
# Iris centres (left/right from camera perspective)
_LEFT_IRIS_CENTER   = 468   # viewer's right eye
_RIGHT_IRIS_CENTER  = 473   # viewer's left eye
# Eye corners
_LEFT_EYE_LEFT  = 33
_LEFT_EYE_RIGHT = 133
_RIGHT_EYE_LEFT = 362
_RIGHT_EYE_RIGHT = 263
# Nose tip + chin + forehead for head-pose heuristic
_NOSE_TIP   = 1
_CHIN       = 152
_FOREHEAD   = 10
# Smile: mouth corners and top/bottom lip centre
_MOUTH_LEFT  = 61
_MOUTH_RIGHT = 291
_LIP_TOP     = 13
_LIP_BOTTOM  = 14

# ---------------------------------------------------------------------------
# Pose landmark index constants (MediaPipe 33-point body model)
# ---------------------------------------------------------------------------
# mp_solutions.pose.PoseLandmark enum values
_POSE_NOSE          = 0
_POSE_LEFT_EAR      = 7
_POSE_RIGHT_EAR     = 8
_POSE_LEFT_SHOULDER = 11
_POSE_RIGHT_SHOULDER= 12
_POSE_LEFT_HIP      = 23
_POSE_RIGHT_HIP     = 24


# ---------------------------------------------------------------------------
# Analysis helpers
# ---------------------------------------------------------------------------

def _iris_position_ratio(lm, eye_left_idx: int, eye_right_idx: int, iris_idx: int) -> float:
    """
    Return 0.0 (left) … 0.5 (centre) … 1.0 (right) position of iris within eye.
    Used to estimate horizontal gaze direction.
    """
    eye_l = lm[eye_left_idx]
    eye_r = lm[eye_right_idx]
    iris  = lm[iris_idx]
    eye_width = eye_r.x - eye_l.x
    if abs(eye_width) < 1e-6:
        return 0.5
    return (iris.x - eye_l.x) / eye_width


def _compute_eye_contact(lm) -> float:
    """
    Returns a 0–1 confidence score for eye contact (both irises centred).
    1.0 = perfect centre gaze, 0.0 = looking fully away.
    """
    # Iris must be in landmarks 468-477 (appended after 468)
    if len(lm) < 478:
        return 0.5  # can't compute without iris landmarks

    left_ratio  = _iris_position_ratio(lm, _LEFT_EYE_LEFT,  _LEFT_EYE_RIGHT,  _LEFT_IRIS_CENTER)
    right_ratio = _iris_position_ratio(lm, _RIGHT_EYE_LEFT, _RIGHT_EYE_RIGHT, _RIGHT_IRIS_CENTER)

    # Both should be near 0.5 for direct eye contact
    left_score  = 1.0 - min(abs(left_ratio  - 0.5) * 4, 1.0)
    right_score = 1.0 - min(abs(right_ratio - 0.5) * 4, 1.0)
    return round((left_score + right_score) / 2, 2)


def _compute_head_pose(lm) -> str:
    """
    Estimate horizontal head yaw from nose-tip x vs midpoint of eyes.
    Returns a human-readable string.
    """
    nose  = lm[_NOSE_TIP]
    l_eye = lm[_LEFT_EYE_LEFT]
    r_eye = lm[_RIGHT_EYE_RIGHT]

    eye_center_x = (l_eye.x + r_eye.x) / 2
    yaw_offset   = nose.x - eye_center_x   # negative = turned left, positive = right

    # Also check vertical tilt (pitch) via nose vs forehead/chin
    forehead = lm[_FOREHEAD]
    chin     = lm[_CHIN]
    face_height = chin.y - forehead.y
    nose_rel    = (nose.y - forehead.y) / face_height if face_height > 0 else 0.5
    # nose_rel ~ 0.4–0.55 = neutral pitch

    # Classify
    yaw_threshold_slight = 0.035
    yaw_threshold_away   = 0.08
    pitch_down_threshold = 0.60
    pitch_up_threshold   = 0.35

    if abs(yaw_offset) > yaw_threshold_away:
        direction = "left" if yaw_offset < 0 else "right"
        return f"looking {direction}"
    elif abs(yaw_offset) > yaw_threshold_slight:
        direction = "left" if yaw_offset < 0 else "right"
        return f"slight {direction}"
    elif nose_rel > pitch_down_threshold:
        return "looking down"
    elif nose_rel < pitch_up_threshold:
        return "looking up"
    else:
        return "straight"


def _compute_expression(lm, blendshapes) -> str:
    """
    Determine dominant expression from blendshapes (if available)
    or fall back to geometric mouth-corner analysis.
    Uses a scored approach so the strongest signal always wins.

    Expression signals:
      smile     -- mouthSmileLeft/Right both elevated
      frown     -- mouthFrownLeft/Right elevated
      surprised -- jawOpen wide OR strong symmetric brow raise
      confused  -- ASYMMETRIC brow raise (one side up, other neutral)
                   This is the classic one-eyebrow-up confused look
      concerned -- symmetric brow DOWN (furrowing), no smile
      neutral   -- none of the above
    """
    if blendshapes:
        bs_map = {b.category_name: b.score for b in blendshapes[0]}

        smile_score   = (bs_map.get("mouthSmileLeft", 0) + bs_map.get("mouthSmileRight", 0)) / 2
        frown_score   = (bs_map.get("mouthFrownLeft", 0) + bs_map.get("mouthFrownRight", 0)) / 2
        jaw_open      = bs_map.get("jawOpen", 0)
        brow_inner_up = bs_map.get("browInnerUp", 0)

        # Per-side outer brow raise
        brow_up_l = bs_map.get("browOuterUpLeft",  0)
        brow_up_r = bs_map.get("browOuterUpRight", 0)
        brow_raise = max(brow_up_l, brow_up_r, brow_inner_up)

        # Brow furrow (pulled downward symmetrically)
        brow_down = max(bs_map.get("browDownLeft", 0), bs_map.get("browDownRight", 0))

        # ── Confused: asymmetric brow raise ────────────────────────────────
        # One eyebrow noticeably higher than the other = confusion / skepticism
        brow_asymmetry = abs(brow_up_l - brow_up_r)
        # Also fired when inner brow rises but face is otherwise relaxed
        confused_score = 0
        if brow_asymmetry > 0.15 and smile_score < 0.20:
            # Stronger weight when inner brow adds to the signal
            confused_score = brow_asymmetry * 1.6 + brow_inner_up * 0.4
        elif brow_inner_up > 0.30 and frown_score < 0.10 and smile_score < 0.15:
            # Both inner brows raised but no smile/frown = puzzled look
            confused_score = brow_inner_up * 0.9

        # ── Surprised: jaw open OR strong symmetric brow raise ─────────────
        surprised_score = max(jaw_open * 1.2, brow_raise * 1.1)

        # Score each candidate — we pick the highest one
        candidates = {
            "surprised": surprised_score if (jaw_open > 0.28 or brow_raise > 0.30) else 0,
            "smile":     smile_score     if smile_score > 0.18 else 0,
            "frown":     frown_score     if frown_score > 0.08 else 0,
            "confused":  confused_score  if confused_score > 0.18 else 0,
            # concerned = symmetric brow furrow, no smile, not confused
            "concerned": brow_down       if (brow_down > 0.18 and smile_score < 0.15 and confused_score < 0.15) else 0,
        }

        best = max(candidates, key=candidates.get)
        if candidates[best] > 0:
            return best
        return "neutral"

    # ── Geometric fallback ────────────────────────────────────────────────
    ml  = lm[_MOUTH_LEFT]
    mr  = lm[_MOUTH_RIGHT]
    lt  = lm[_LIP_TOP]
    lb  = lm[_LIP_BOTTOM]

    mouth_width  = abs(mr.x - ml.x)
    mouth_height = abs(lb.y - lt.y)
    ratio = mouth_height / mouth_width if mouth_width > 0 else 0

    mouth_mid_y   = (ml.y + mr.y) / 2
    corners_above = mouth_mid_y < (lt.y + lb.y) / 2

    if ratio > 0.35:
        return "surprised"
    if corners_above:
        return "smile"
    return "neutral"


# ---------------------------------------------------------------------------
# Posture analysis
# ---------------------------------------------------------------------------

def _compute_posture(pose_landmarks) -> str:
    """
    Classify body posture from MediaPipe Pose landmarks.

    Returns one of:
      "upright"        -- shoulders level, ears above shoulders → good posture
      "slouching"      -- shoulders raised past ears or ears far forward of shoulders
      "leaning_left"   -- left shoulder significantly lower than right
      "leaning_right"  -- right shoulder significantly lower than left
      "head_forward"   -- nose x well ahead of shoulder midpoint (forward head posture)
      "unknown"        -- landmarks not visible / confidence too low
    """
    lm = pose_landmarks.landmark

    def vis(idx: int) -> bool:
        return lm[idx].visibility > 0.5

    # Require at least shoulders to be visible
    if not (vis(_POSE_LEFT_SHOULDER) and vis(_POSE_RIGHT_SHOULDER)):
        return "unknown"

    ls = lm[_POSE_LEFT_SHOULDER]
    rs = lm[_POSE_RIGHT_SHOULDER]

    # ── Shoulder level (lateral lean) ────────────────────────────────────────
    # In normalised coords y increases downward; a lower shoulder has a higher y
    shoulder_y_diff = ls.y - rs.y          # +ve → left shoulder lower
    lean_threshold  = 0.06                 # ~6% of frame height

    if shoulder_y_diff > lean_threshold:
        return "leaning_left"
    if shoulder_y_diff < -lean_threshold:
        return "leaning_right"

    # ── Slouch: ear-to-shoulder vertical gap ────────────────────────────────
    # When sitting upright ears are clearly ABOVE (lower y) shoulders.
    # When slouching, the gap shrinks or ears drop level with/below shoulders.
    ears_visible = vis(_POSE_LEFT_EAR) or vis(_POSE_RIGHT_EAR)
    if ears_visible:
        ear_y = 0.0
        ear_count = 0
        if vis(_POSE_LEFT_EAR):
            ear_y    += lm[_POSE_LEFT_EAR].y
            ear_count += 1
        if vis(_POSE_RIGHT_EAR):
            ear_y    += lm[_POSE_RIGHT_EAR].y
            ear_count += 1
        ear_y /= ear_count

        shoulder_y = (ls.y + rs.y) / 2
        # Positive gap means ears are above shoulders (good)
        ear_above_shoulder = shoulder_y - ear_y   # positive = upright

        if ear_above_shoulder < 0.02:             # ears near or below shoulder level
            return "slouching"

    # ── Forward head: nose x vs shoulder midpoint x ──────────────────────────
    # Works when person faces the camera (nose should be roughly centred
    # between shoulder x midpoint). We check depth (z) if available.
    if vis(_POSE_NOSE):
        nose      = lm[_POSE_NOSE]
        shoulder_z = (ls.z + rs.z) / 2
        # z < 0 means closer to camera in MediaPipe normalised coords
        if (shoulder_z - nose.z) > 0.15:          # nose clearly in front of shoulder plane
            return "head_forward"

    return "upright"


# ---------------------------------------------------------------------------
# Per-frame analysis entry point
# ---------------------------------------------------------------------------

def analyze_face_frame(image_bytes: bytes) -> dict:
    """
    Run MediaPipe FaceLandmarker + Pose on raw JPEG/PNG bytes.
    Returns a dict with eye_contact, head_pose, expression, posture, face_detected.
    """
    try:
        pil_img  = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        np_frame = np.array(pil_img, dtype=np.uint8)

        # ── Face analysis ────────────────────────────────────────────────────
        mp_image  = mp.Image(image_format=mp.ImageFormat.SRGB, data=np_frame)
        landmarker = _get_landmarker()
        face_result = landmarker.detect(mp_image)

        if not face_result.face_landmarks:
            # Still run posture even if face not detected
            posture = _run_pose(np_frame)
            return {
                "face_detected": False,
                "eye_contact":   None,
                "head_pose":     None,
                "expression":    None,
                "posture":       posture,
            }

        lm          = face_result.face_landmarks[0]
        blendshapes = face_result.face_blendshapes if face_result.face_blendshapes else None

        eye_contact = _compute_eye_contact(lm)
        head_pose   = _compute_head_pose(lm)
        expression  = _compute_expression(lm, blendshapes)

        # ── Posture analysis ─────────────────────────────────────────────────
        posture = _run_pose(np_frame)

        return {
            "face_detected": True,
            "eye_contact":   eye_contact,
            "head_pose":     head_pose,
            "expression":    expression,
            "posture":       posture,
        }

    except Exception as e:
        print(f"[analyze_face_frame] Error: {e}")
        return {
            "face_detected": False,
            "eye_contact":   None,
            "head_pose":     None,
            "expression":    None,
            "posture":       "unknown",
            "error":         str(e),
        }


def _run_pose(np_frame: np.ndarray) -> str:
    """Run MediaPipe Pose on an RGB numpy frame and return posture label."""
    try:
        pose    = _get_pose()
        # Pose expects BGR for cv2, but works fine with RGB in static mode
        p_result = pose.process(np_frame)
        if p_result.pose_landmarks:
            return _compute_posture(p_result.pose_landmarks)
        return "unknown"
    except Exception as e:
        print(f"[_run_pose] Error: {e}")
        return "unknown"


# ---------------------------------------------------------------------------
# Webcam streaming (unchanged)
# ---------------------------------------------------------------------------

class WebcamVideoStream:
    """Threaded webcam/RTSP video stream."""

    def __init__(self, src=0):
        url = src
        if isinstance(src, str) and src.lower().startswith("rtsp://") and ("rtsp_transport=" not in src):
            url = src + ("&" if "?" in src else "?") + "rtsp_transport=tcp"

        self.stream = cv2.VideoCapture(
            int(src) if isinstance(src, str) and src.isdigit() else url,
            cv2.CAP_FFMPEG
        )
        (self.grabbed, self.frame) = self.stream.read()
        self.stopped = False
        self.lock = Lock()
        self.src = src

    def start(self):
        t = Thread(target=self.update, daemon=True)
        t.start()
        return self

    def update(self):
        while not self.stopped:
            (grabbed, frame) = self.stream.read()
            with self.lock:
                self.grabbed = grabbed
                if grabbed and frame is not None:
                    self.frame = cv2.resize(frame, (1080, 720))
                else:
                    url = self.src
                    if isinstance(self.src, str) and self.src.lower().startswith("rtsp://") and ("rtsp_transport=" not in self.src):
                        url = self.src + ("&" if "?" in self.src else "?") + "rtsp_transport=tcp"
                    self.stream = cv2.VideoCapture(
                        int(self.src) if isinstance(self.src, str) and self.src.isdigit() else url,
                        cv2.CAP_FFMPEG
                    )
            time.sleep(0.01)

    def read(self):
        with self.lock:
            return self.frame.copy() if self.grabbed and self.frame is not None else None

    def stop(self):
        self.stopped = True
        self.stream.release()


app = FastAPI()

# Allow requests from the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

video_stream = None


def get_video_stream():
    global video_stream
    if video_stream is None:
        video_stream = WebcamVideoStream(src=0).start()
    return video_stream


def gen_frames():
    stream = get_video_stream()
    while True:
        frame = stream.read()
        if frame is not None:
            ret, buffer = cv2.imencode('.jpg', frame)
            if ret:
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        else:
            time.sleep(0.1)


# ---------------------------------------------------------------------------
# Voice-tone model (loaded lazily after training)
# ---------------------------------------------------------------------------
_voice_model       = None
_voice_label_enc   = None
_voice_model_lock  = Lock()

_VOICE_MODEL_PATH  = Path(__file__).parent / "voice_tone_model.pkl"
_VOICE_LABELS_PATH = Path(__file__).parent / "voice_tone_labels.pkl"

_whisper_model = None
_whisper_lock = Lock()

def _load_whisper_model():
    """Lazy-load the Whisper model."""
    global _whisper_model
    with _whisper_lock:
        if _whisper_model is None and _WHISPER_AVAILABLE:
            print("Loading Whisper 'base' model...")
            _whisper_model = whisper.load_model("base")
            print("Whisper model loaded.")
    return _whisper_model


def _load_voice_model():
    """Lazy-load the trained MLP + LabelEncoder (thread-safe)."""
    global _voice_model, _voice_label_enc
    with _voice_model_lock:
        if _voice_model is None:
            if _VOICE_MODEL_PATH.exists() and _VOICE_LABELS_PATH.exists():
                _voice_model     = joblib.load(_VOICE_MODEL_PATH)
                _voice_label_enc = joblib.load(_VOICE_LABELS_PATH)
                print(f"[VoiceTone] Model loaded from {_VOICE_MODEL_PATH}")
            else:
                print("[VoiceTone] Model not found - run train_voice_tone.py first.")
    return _voice_model, _voice_label_enc


def _extract_audio_features(audio_bytes: bytes, sample_rate: int = 22050):
    """
    Extract the same 364 librosa features used during training.
    Returns numpy array or None on failure.
    """
    if not _LIBROSA_AVAILABLE:
        return None
    try:
        import soundfile as sf
        buf = io.BytesIO(audio_bytes)
        y, sr = librosa.load(buf, sr=sample_rate, mono=True, duration=5.0)

        if len(y) < sr * 0.2:
            return None

        mfccs      = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        mfcc_feat  = np.concatenate([mfccs.mean(axis=1), mfccs.std(axis=1)])

        chroma     = librosa.feature.chroma_stft(y=y, sr=sr)
        chroma_feat = np.concatenate([chroma.mean(axis=1), chroma.std(axis=1)])

        mel        = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
        mel_feat   = np.concatenate([mel.mean(axis=1), mel.std(axis=1)])

        zcr        = librosa.feature.zero_crossing_rate(y)
        zcr_feat   = np.array([zcr.mean(), zcr.std()])

        rms        = librosa.feature.rms(y=y)
        rms_feat   = np.array([rms.mean(), rms.std()])

        return np.concatenate([mfcc_feat, chroma_feat, mel_feat, zcr_feat, rms_feat])
    except Exception as e:
        print(f"[_extract_audio_features] Error: {e}")
        return None


def _speech_heuristics(audio_bytes: bytes, sample_rate: int = 22050) -> dict:
    """
    Compute simple speech-rate and energy-level heuristics.
    speech_rate  : "slow" | "normal" | "fast"
    energy_level : "low" | "medium" | "high"
    clarity      : 0.0 - 1.0  (proxy: ratio of voiced to total frames)
    """
    defaults = {"speech_rate": "normal", "energy_level": "medium", "clarity": 0.75}
    if not _LIBROSA_AVAILABLE:
        return defaults
    try:
        buf = io.BytesIO(audio_bytes)
        y, sr = librosa.load(buf, sr=sample_rate, mono=True, duration=5.0)

        duration = len(y) / sr

        # Speech rate: zero-crossings per second (more ZCR = faster articulation)
        zcr_rate = float(librosa.feature.zero_crossing_rate(y).mean()) * sr
        if zcr_rate < 2000:
            speech_rate = "slow"
        elif zcr_rate < 5000:
            speech_rate = "normal"
        else:
            speech_rate = "fast"

        # Energy level: mean RMS
        rms_mean = float(librosa.feature.rms(y=y).mean())
        if rms_mean < 0.02:
            energy_level = "low"
        elif rms_mean < 0.08:
            energy_level = "medium"
        else:
            energy_level = "high"

        # Clarity: fraction of frames with voiced activity (non-silent)
        intervals = librosa.effects.split(y, top_db=25)
        voiced_samples = sum(e - s for s, e in intervals)
        clarity = round(min(voiced_samples / max(len(y), 1), 1.0), 2)

        return {
            "speech_rate":  speech_rate,
            "energy_level": energy_level,
            "clarity":      clarity,
        }
    except Exception as e:
        print(f"[_speech_heuristics] Error: {e}")
        return defaults


def analyze_voice_tone(audio_bytes: bytes) -> dict:
    """
    Full voice-tone analysis pipeline.
    Returns emotion, confidence, speech_rate, energy_level, clarity.
    Falls back to defaults when model is not trained yet.
    """
    heuristics = _speech_heuristics(audio_bytes)

    if not _LIBROSA_AVAILABLE:
        return {"emotion": "neutral", "confidence": 0.0, "model_ready": False, **heuristics}

    model, le = _load_voice_model()

    if model is None:
        return {"emotion": "neutral", "confidence": 0.0, "model_ready": False, **heuristics}

    features = _extract_audio_features(audio_bytes)
    if features is None:
        return {"emotion": "neutral", "confidence": 0.0, "model_ready": True, **heuristics}

    features = features.reshape(1, -1)
    proba    = model.predict_proba(features)[0]
    pred_idx = int(np.argmax(proba))
    emotion  = le.classes_[pred_idx]
    confidence = round(float(proba[pred_idx]), 3)

    return {
        "emotion":      emotion,
        "confidence":   confidence,
        "model_ready":  True,
        **heuristics,
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
def read_root():
    return {"message": "ML Service is running"}


@app.get("/video_feed")
def video_feed():
    return StreamingResponse(gen_frames(), media_type="multipart/x-mixed-replace; boundary=frame")


@app.post("/analyze/audio")
async def analyze_audio(file: UploadFile = File(...)):
    """
    Analyze voice emotion from an uploaded audio file (WAV/MP3/OGG/WebM).

    Returns JSON:
      {
        "emotion":      str,    // neutral | happy | sad | angry | fearful | disgust
        "confidence":   float,  // 0.0 - 1.0
        "speech_rate":  str,    // slow | normal | fast
        "energy_level": str,    // low | medium | high
        "clarity":      float,  // 0.0 - 1.0 (fraction of voiced audio)
        "model_ready":  bool    // false until train_voice_tone.py has been run
      }
    """
    audio_bytes = await file.read()
    return analyze_voice_tone(audio_bytes)


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe uploaded audio (WebM/WAV/MP3) to text using Deepgram (primary) or Whisper (fallback).
    """
    try:
        audio_bytes = await file.read()

        # 1. Try Deepgram
        if _DEEPGRAM_AVAILABLE:
            try:
                print(f"[Transcribe] Sending {len(audio_bytes)} bytes to Deepgram...")
                client = DeepgramClient(DEEPGRAM_API_KEY)
                options = PrerecordedOptions(
                    model="nova-2", # Nova-2 is often more stable than Nova-3 if not available
                    smart_format=True,
                    language="en",
                )
                
                payload = {"buffer": audio_bytes}
                # Using the standard v3 SDK pattern
                response = client.listen.prerecorded.v("1").transcribe_file(payload, options)
                
                print(f"[Transcribe] Deepgram Response received.")
                if response and response.results and response.results.channels:
                    transcript = response.results.channels[0].alternatives[0].transcript
                    if transcript:
                        print(f"[Transcribe] Deepgram Success: '{transcript[:50]}...'")
                        return {"text": transcript.strip(), "source": "deepgram"}
                    else:
                        print("[Transcribe] Deepgram returned empty transcript.")
                else:
                    print(f"[Transcribe] Deepgram response structure unexpected: {response}")
            except Exception as de:
                print(f"[Transcribe] Deepgram Exception: {type(de).__name__}: {de}")

        # 2. Fallback to Whisper
        if _WHISPER_AVAILABLE:
            try:
                print("[Transcribe] Falling back to Whisper...")
                import tempfile
                with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
                    tmp.write(audio_bytes)
                    tmp_path = tmp.name

                model = _load_whisper_model()
                if model:
                    result = model.transcribe(tmp_path)
                    import os
                    os.unlink(tmp_path)
                    return {"text": result["text"].strip(), "source": "whisper"}
            except Exception as we:
                print(f"[Transcribe] Whisper Error: {we}")

        return {"error": "All transcription services failed.", "text": ""}
    except Exception as e:
        print(f"[Transcribe] Fatal Error: {e}")
        return {"error": str(e), "text": ""}


@app.post("/analyze/video")
async def analyze_video(file: UploadFile = File(...)):
    """Legacy endpoint - delegates to frame analyser."""
    image_bytes = await file.read()
    result = analyze_face_frame(image_bytes)
    # Map to original response shape + new fields
    return {
        "posture": "good",
        "eye_contact": result.get("eye_contact", 0.8),
        "body_language": "confident",
        **result,
    }


@app.post("/analyze/frame")
async def analyze_frame(file: UploadFile = File(...)):
    """
    Real-time per-frame face analysis.

    Accepts a JPEG/PNG frame uploaded as multipart form field 'file'.
    Returns JSON:
      {
        "face_detected": bool,
        "eye_contact":   float | null,   // 0.0 – 1.0
        "head_pose":     str | null,     // "straight" | "slight left/right" | "looking left/right/up/down"
        "expression":    str | null      // "neutral" | "smile" | "frown" | "surprised"
      }
    """
    image_bytes = await file.read()
    return analyze_face_frame(image_bytes)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
