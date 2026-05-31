"""
train_voice_tone.py — Voice Emotion Classifier
================================================
Trains an MLP on combined RAVDESS + CREMA-D audio data.
Saves model → ml_service/voice_tone_model.pkl
Saves label encoder → ml_service/voice_tone_labels.pkl

Usage:
  python train_voice_tone.py            # full training
  python train_voice_tone.py --quick    # first 150 files only (sanity check)
"""

import os
import sys
import zipfile
import tempfile
import argparse
import warnings
import numpy as np
import joblib
import librosa

from pathlib import Path
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR   = Path(__file__).parent.resolve()
DATASETS_DIR = SCRIPT_DIR.parent / "DATASETS"

RAVDESS_ZIP  = DATASETS_DIR / "RAVDESS DATASET" / "Audio_Speech_Actors_01-24.zip"
CREMAD_WAV   = DATASETS_DIR / "CREMA-D" / "AudioWAV"

MODEL_OUT    = SCRIPT_DIR / "voice_tone_model.pkl"
LABELS_OUT   = SCRIPT_DIR / "voice_tone_labels.pkl"

# ---------------------------------------------------------------------------
# Unified label maps
# ---------------------------------------------------------------------------
# RAVDESS: modality-vocal-emotion-intensity-statement-repetition-actor
#   position 2 (0-indexed) in filename = emotion code
RAVDESS_EMOTION_MAP = {
    "01": "neutral",
    "02": "calm",
    "03": "happy",
    "04": "sad",
    "05": "angry",
    "06": "fearful",
    "07": "disgust",
    "08": "surprised",
}

# CREMA-D: ActorID_SentenceID_EmotionTag_IntensityLevel.wav
#   position 2 (0-indexed) in split = emotion tag
CREMAD_EMOTION_MAP = {
    "NEU": "neutral",
    "HAP": "happy",
    "SAD": "sad",
    "ANG": "angry",
    "FEA": "fearful",
    "DIS": "disgust",
}

# Keep only these 6 classes (drop "calm" and "surprised")
KEEP_LABELS = {"neutral", "happy", "sad", "angry", "fearful", "disgust"}


# ---------------------------------------------------------------------------
# Feature extraction
# ---------------------------------------------------------------------------
def extract_features(file_path: str, sample_rate: int = 22050) -> np.ndarray | None:
    """
    Extract 364 audio features from a WAV file using librosa.

    Features:
      40 MFCCs  × (mean + std) = 80
      12 Chroma × (mean + std) = 24
     128 mel    × (mean + std) = 256
       1 ZCR    × (mean + std) = 2
       1 RMS    × (mean + std) = 2
    Total: 364
    """
    try:
        y, sr = librosa.load(file_path, sr=sample_rate, mono=True, duration=5.0)

        if len(y) < sr * 0.2:           # skip clips shorter than 200 ms
            return None

        # MFCCs
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        mfcc_feat = np.concatenate([mfccs.mean(axis=1), mfccs.std(axis=1)])

        # Chroma
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        chroma_feat = np.concatenate([chroma.mean(axis=1), chroma.std(axis=1)])

        # Mel-spectrogram
        mel = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
        mel_feat = np.concatenate([mel.mean(axis=1), mel.std(axis=1)])

        # Zero-crossing rate
        zcr = librosa.feature.zero_crossing_rate(y)
        zcr_feat = np.array([zcr.mean(), zcr.std()])

        # RMS energy
        rms = librosa.feature.rms(y=y)
        rms_feat = np.array([rms.mean(), rms.std()])

        return np.concatenate([mfcc_feat, chroma_feat, mel_feat, zcr_feat, rms_feat])

    except Exception as e:
        print(f"  [WARN] Could not process {file_path}: {e}")
        return None


# ---------------------------------------------------------------------------
# Dataset loaders
# ---------------------------------------------------------------------------
def load_ravdess(zip_path: Path, extract_dir: Path, quick: bool) -> list[tuple[str, str]]:
    """Extract RAVDESS zip (if needed) and return (filepath, label) pairs."""
    if not zip_path.exists():
        print(f"[RAVDESS] ZIP not found: {zip_path}")
        return []

    ravdess_root = extract_dir / "ravdess"
    if not ravdess_root.exists():
        print(f"[RAVDESS] Extracting {zip_path.name} …")
        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(ravdess_root)
        print("[RAVDESS] Extraction complete.")
    else:
        print("[RAVDESS] Already extracted, reusing.")

    pairs = []
    for wav in sorted(ravdess_root.rglob("*.wav")):
        parts = wav.stem.split("-")
        if len(parts) < 3:
            continue
        emotion_code = parts[2]
        label = RAVDESS_EMOTION_MAP.get(emotion_code)
        if label and label in KEEP_LABELS:
            pairs.append((str(wav), label))
        if quick and len(pairs) >= 75:
            break

    print(f"[RAVDESS] Loaded {len(pairs)} clips.")
    return pairs


def load_cremad(wav_dir: Path, quick: bool) -> list[tuple[str, str]]:
    """Return (filepath, label) pairs from CREMA-D AudioWAV directory."""
    if not wav_dir.exists():
        print(f"[CREMA-D] Directory not found: {wav_dir}")
        return []

    pairs = []
    for wav in sorted(wav_dir.glob("*.wav")):
        parts = wav.stem.split("_")
        if len(parts) < 3:
            continue
        emotion_tag = parts[2].upper()
        label = CREMAD_EMOTION_MAP.get(emotion_tag)
        if label and label in KEEP_LABELS:
            pairs.append((str(wav), label))
        if quick and len(pairs) >= 75:
            break

    print(f"[CREMA-D] Loaded {len(pairs)} clips.")
    return pairs


# ---------------------------------------------------------------------------
# Main training routine
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Train voice tone classifier")
    parser.add_argument("--quick", action="store_true",
                        help="Use first 150 clips only (sanity-check run)")
    args = parser.parse_args()

    print("=" * 60)
    print("Voice Tone Classifier — Training")
    print("=" * 60)

    # Use a persistent temp dir inside DATASETS so extraction is reused
    extract_dir = DATASETS_DIR / ".extracted"
    extract_dir.mkdir(exist_ok=True)

    # Collect data
    pairs = []
    pairs += load_ravdess(RAVDESS_ZIP, extract_dir, args.quick)
    pairs += load_cremad(CREMAD_WAV, args.quick)

    if not pairs:
        print("\n[ERROR] No audio files found. Check dataset paths.")
        sys.exit(1)

    print(f"\nTotal clips to process: {len(pairs)}")
    print("Extracting features (this may take a while) …\n")

    X, y = [], []
    for i, (path, label) in enumerate(pairs, 1):
        if i % 100 == 0 or i == len(pairs):
            print(f"  [{i}/{len(pairs)}] Processing …", end="\r")
        feat = extract_features(path)
        if feat is not None:
            X.append(feat)
            y.append(label)

    print(f"\nFeature extraction complete. Valid clips: {len(X)}")

    if len(X) < 20:
        print("[ERROR] Too few valid clips to train. Check audio files.")
        sys.exit(1)

    X = np.array(X, dtype=np.float32)
    y = np.array(y)

    # Encode labels
    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    print(f"\nClasses: {list(le.classes_)}")
    print(f"Class distribution:")
    for cls, cnt in zip(*np.unique(y, return_counts=True)):
        print(f"  {cls}: {cnt}")

    # Train / test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.15, random_state=42, stratify=y_enc
    )

    print(f"\nTrain: {len(X_train)}  Test: {len(X_test)}")
    print("Training MLP …")

    clf = MLPClassifier(
        hidden_layer_sizes=(256, 128, 64),
        activation="relu",
        solver="adam",
        max_iter=300,
        early_stopping=True,
        validation_fraction=0.1,
        n_iter_no_change=15,
        random_state=42,
        verbose=True,
    )
    clf.fit(X_train, y_train)

    # Evaluate
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n{'=' * 60}")
    print(f"Test Accuracy: {acc * 100:.2f}%")
    print(f"{'=' * 60}")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    # Save
    joblib.dump(clf, MODEL_OUT)
    joblib.dump(le,  LABELS_OUT)
    print(f"\nModel saved   → {MODEL_OUT}")
    print(f"Labels saved  → {LABELS_OUT}")
    print("Training complete!")


if __name__ == "__main__":
    main()
