Image cut out routine

File-by-File Role & Architecture

    public/u2netp.onnx

        Role: The AI model weights file (U^2-Net Portrait, ~4.6MB). It contains the trained neural network layers optimized for salient object detection (identifying the main foreground subject vs. the background).

        Interaction: Loaded directly in the worker during init() via ort.InferenceSession.create() to run the model locally.

    public/ort/ort-wasm-simd-threaded.mjs

        Role: The JavaScript glue/loader script for the ONNX Runtime WebAssembly engine.

        Interaction: Fetched dynamically as text by the worker, converted into a local Blob URL (URL.createObjectURL), and registered to ort.env.wasm.wasmPaths.mjs. This bypasses strict browser module-fetching restrictions inside Web Workers.

    public/ort/ort-wasm-simd-threaded.wasm

        Role: The core binary WebAssembly engine compiled with SIMD (Single Instruction, Multiple Data) multi-threading support.

        Interaction: Executed directly by the browser's JavaScript engine to execute heavy matrix math for the AI model at near-native CPU speeds.

Step-by-Step Execution Flow
Phase 1: Initialization (init)

When your app boots up and triggers the worker:

    The main thread sends an init message with your app's base URL and origin.

    The worker fetches the local .mjs script from public/ort/, packages it into an Object URL, and configures the ONNX runtime paths.

    It loads u2netp.onnx from public/models/ and instantiates an ONNX InferenceSession using the 'wasm' execution provider (numThreads = 1).

    Once loaded, it reports back with { type: 'ready' }.

Phase 2: Preprocessing (run)

When a user uploads or selects an image to cut out:

    The worker receives the raw File object and decodes it into an ImageBitmap to read its original dimensions (W and H).

    It draws the image onto a 320x320 OffscreenCanvas (since u2netp expects a fixed 320x320 input size).

    It extracts the raw RGBA pixel data, normalizes each color channel using standard ImageNet constants (MEAN and STD), and packs them into a flat Float32Array structured as a 4D tensor format [1, 3, 320, 320].

Phase 3: Inference & Mask Generation

    The tensor is passed into session.run() where the ONNX WebAssembly runtime executes the neural network locally.

    The model returns a grayscale saliency map (Float32Array).

    The worker normalizes the output values between 0 and 255, draws them onto a 320x320 temporary canvas, and then smoothly scales it back up to the image's original dimensions (W x H) using high-quality image smoothing.

    This creates a high-resolution alpha mask (ImageBitmap).

Phase 4: Zero-Copy Transfer (postMessage)

    Instead of copying heavy memory buffers back to the main thread (which causes lag), the worker uses Transferable Objects:
    JavaScript

    send({ type: 'result', id, bitmap, mask }, [bitmap, mask])

    Memory ownership of both the original image bitmap and the cutout mask is transferred instantly to the main Vue thread with zero overhead.
