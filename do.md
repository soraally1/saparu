Act as a Principal Backend & Machine Learning Systems Engineer. I am building the backend ecosystem for "RespiSound", an AI-powered acoustic biomarker triage platform for pediatric respiratory care (detecting pneumonia and asthma/wheezing from breath & cough sounds).

Currently, I want to develop the complete backend services before moving to the mobile frontend (React Native).

### System Architecture Overview
The backend consists of two microservices integrated with Firebase:
1. **Core API Gateway & Business Service (Go / Golang):**
   - Framework: Gin or Fiber (clean architecture: handler, service, repository).
   - Database & Storage: **Firebase Ecosystem** using official `firebase.google.com/go/v4` (Firebase Admin SDK):
     - **Firebase Authentication:** ID Token verification middleware.
     - **Cloud Firestore:** NoSQL database for managing users, patient profiles, and screening logs.
     - **Firebase Cloud Storage:** Uploading and managing raw `.wav` audio files.
   - Responsibilities: Verify user auth tokens, stream audio to the Python AI service, execute the WHO/Kemenkes MTBS pediatric triage rule engine, upload audio to Firebase Storage, persist records to Firestore, and return structured responses.
2. **AI Inference & DSP Microservice (Python):**
   - Framework: FastAPI.
   - Core Libraries: PyTorch / ONNX Runtime, Librosa / TorchAudio, NumPy, SciPy.
   - Responsibilities: Ingest raw audio (16 kHz mono WAV/PCM), apply Butterworth Bandpass Filter (100 Hz - 2000 Hz), extract Log-Mel Spectrograms / MFCCs, run ONNX/PyTorch acoustic classification (`.onnx`), and return output probabilities `[Normal, Wheeze, Crackles, Stridor]`.

---

### Cloud Firestore Data Schema (Collections & Documents)

1. **`users` Collection**
   - Document ID: `firebase_uid`
   - Fields: `name` (string), `email` (string), `role` (enum: "parent" | "cadre" | "doctor"), `created_at` (timestamp).

2. **`patients` Collection**
   - Document ID: `patient_id` (auto-generated UUID/string)
   - Fields: `user_id` (string - ref to users), `full_name` (string), `date_of_birth` (timestamp), `gender` (enum: "male" | "female"), `medical_history` (array of strings), `created_at` (timestamp).

3. **`screening_records` Collection**
   - Document ID: `screening_id` (auto-generated UUID/string)
   - Fields:
     - `patient_id` (string)
     - `child_age_months` (number)
     - `respiratory_rate` (number)
     - `additional_symptoms` (map / array: `fever`, `chest_indrawing`, `stridor_at_rest`, etc.)
     - `audio_storage_url` (string - Firebase Storage download URL)
     - `acoustic_result`:
       - `primary_class` (string: "Normal" | "Wheeze" | "Crackles" | "Stridor")
       - `confidence` (float)
       - `probabilities` (map: normal, wheeze, crackles, stridor)
     - `mtbs_triage`:
       - `status_level` (enum: "RED" | "YELLOW" | "GREEN")
       - `diagnosis_label` (string: "Pneumonia Berat", "Pneumonia / Suspek Asma", "Bukan Pneumonia")
       - `clinical_actions` (array of strings)
     - `created_at` (timestamp)

---

### Service Interaction Flow
1. React Native sends `POST /api/v1/screenings` with `Authorization: Bearer <Firebase_ID_Token>` containing:
   - Form fields: `patient_id`, `child_age_months`, `respiratory_rate`, `additional_symptoms` (JSON string).
   - File: `audio_file` (Multipart WAV).
2. Go middleware verifies Firebase ID Token via Firebase Auth Admin SDK.
3. Go service streams audio buffer in-memory to the Python FastAPI service (`POST /inference/acoustic`).
4. Python executes DSP filtering & ONNX inference, returning acoustic probabilities.
5. Go uploads the audio file to Firebase Cloud Storage bucket asynchronously/concurrently to get the public/signed URL.
6. Go evaluates the WHO MTBS Clinical Rule Engine:
   - **RED (Bahaya Umum / Pneumonia Berat):** If `chest_indrawing == true` OR `stridor_at_rest == true` OR extreme tachypnea.
   - **YELLOW (Pneumonia / Suspek Asma):** If age-based tachypnea threshold is met OR `primary_class` in ['Wheeze', 'Crackles'].
   - **GREEN (Batuk Bukan Pneumonia):** If respiratory rate is normal and acoustic is normal.
7. Go writes the complete record into Cloud Firestore (`screening_records` collection) and returns the JSON payload to the client.

---

### Implementation Requirements (Step-by-Step)s

#### Step 1: Firebase Admin SDK Setup & Firestore Repository in Go
- Initialize Firebase App in Go using service account credentials (`serviceAccountKey.json`).
- Create Firestore repository interfaces and structs for `patients` and `screening_records`.
- Implement audio upload helper for Firestore.
- Just implemented the script user will set the key and the firebase by himself

#### Step 2: Python AI Inference Service (FastAPI)
- Build the FastAPI project structure.
- Implement the audio processing pipeline:
  - Resampling to 16 kHz Mono.
  - Butterworth Bandpass Filter (100–2000 Hz).
  - Mel-Spectrogram extraction (n_mels=128, n_fft=2048, hop_length=512).
- Load an https://github.com/SJTU-YONGFU-RESEARCH-GRP/SPRSound data set and combine with https://www.kaggle.com/datasets/nasrulhakim86/coughvid-wav
- Expose endpoint `POST /inference/acoustic` with Pydantic validation.

#### Step 3: Go Core Logic & MTBS Engine
- Implement Clean Architecture in Go (`cmd/`, `internal/handler`, `internal/service`, `internal/repository`).
- Build MTBS age threshold logic:
  - Age < 2 months: $\ge 60$ bpm
  - Age 2–11 months: $\ge 50$ bpm
  - Age 12–59 months: $\ge 40$ bpm
- Implement the HTTP client calling the Python service.
- Implement the `POST /api/v1/screenings` handler.

---

Let's begin with **Step 1 and Step 2**. Provide the Firebase Go configuration, Firestore repository models, and the Python FastAPI inference pipeline first.