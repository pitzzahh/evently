<script module lang="ts">
	interface ComponentState {
		scanner: Html5QrcodeScanner | null;
		scannerState: Html5QrcodeScannerState | null;
		lastResult: string | null;
		errorMessage: string | null;
		scanning: boolean;
		scanComplete: boolean;
		lastScanTimestamp: number;
		debounceInterval: number;
		audio: HTMLAudioElement | null;
	}
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';
	import {
		Html5QrcodeScanner,
		type Html5QrcodeResult,
		Html5QrcodeScanType,
		Html5QrcodeSupportedFormats,
		Html5QrcodeScannerState
	} from 'html5-qrcode';

	let {
		width = 350,
		height = 350,
		paused = $bindable(false),
		fps = 30,
		aspectRatio = 1.777778,
		stop_camera,
		onDetect,
		onError,
		singleScanMode = true,
		resetAfter = 5000,
		autoPauseDelay = 500
	}: {
		width?: number;
		height?: number;
		paused?: boolean;
		fps?: number;
		aspectRatio?: number;
		onError?: (message: string) => void;
		onDetect: (message: string) => void;
		singleScanMode?: boolean;
		autoPauseDelay?: number;
		resetAfter?: number;
		stop_camera: boolean;
	} = $props();

	let {
		scanner,
		scannerState,
		lastResult,
		errorMessage,
		scanning,
		scanComplete,
		lastScanTimestamp,
		debounceInterval,
		audio
	} = $state<ComponentState>({
		scanner: null,
		scannerState: null,
		lastResult: null,
		errorMessage: null,
		scanning: true,
		scanComplete: false,
		lastScanTimestamp: 0,
		debounceInterval: 1500, // 1.5 seconds
		audio: null
	});

	function handleScanSuccess(decodedText: string, decodedResult: Html5QrcodeResult): void {
		// Prevent duplicate scans
		const now = Date.now();
		if (now - lastScanTimestamp < debounceInterval && lastResult === decodedText) {
			return; // Ignore duplicate scan within debounce interval
		}

		// Play success sound
		if (audio) {
			audio.currentTime = 0; // Reset to beginning
			audio.play().catch((error) => console.warn('Could not play audio:', error));
		}

		// Update state
		lastResult = decodedText;
		lastScanTimestamp = now;
		scanComplete = true;

		// Call the callback
		onDetect(decodedText);

		// Auto-pause if in single scan mode
		if (singleScanMode && scanning) {
			setTimeout(() => {
				if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
					scanner.pause();
					scanning = false;
					scannerState = Html5QrcodeScannerState.PAUSED;
				}
			}, autoPauseDelay);
		}

		// Auto reset after specified time
		if (resetAfter > 0) {
			setTimeout(() => {
				reset();
			}, resetAfter);
		}
	}

	function handleScanFailure(message: string) {
		// Filter out noisy errors about not finding a QR code
		if (!message.includes('No QR code found')) {
			errorMessage = message;
			onError?.(message);
		}
	}

	// Reset the scanner state
	function reset() {
		lastResult = null;
		scanComplete = false;
		errorMessage = null;

		// Resume scanning if it was paused
		if (scanner && scanner.getState() === Html5QrcodeScannerState.PAUSED) {
			scanner.resume();
			scanning = true;
			scannerState = Html5QrcodeScannerState.SCANNING;
		}
	}

	onMount(() => {
		if (!browser) return;
		audio = new Audio(
			'data:audio/wav;base64,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eyiSknRZyqVpr+yY6KRS6W5UoxpEayv5IkT/0xKhSfcWbxCiiqhjtLIt6eSZo4CFGDCm6ubahQFV1UKVJmFCdYwENnhDXAo2wKC7FSXhAqIKG//+hO+tT63G7qXVFYIMsw+wFQSTVgLfqJFqiaSNoAGr5gLajsb/+GRh7NNB0LD1DqlVv8GmM8Nf6/63TqXS0VMhJRs6QHPKqKkR50QrERYlkhDJMmaVqy2R2dQGT9LihrL4KGiYpNCaJ4W4vSdOU6ctxpOZGasFsJjVIMKvKAjZQ2b/jHzBgK/w1vAIU8RAV0S8Vgq6Ij1Z2VdK87LSyyKSMNQEACwcgZBEDshKHtmrre/LLrb1tYPo68ck1yxhXFfZBRLg7iVyaW//2hr///y1TEFNRTMuOTkuNVVVVVVVVVVVVVVVVVX/+4Bk/AADqD7V+wwb+jHoup8oA/MOPNNF7CRvqTAMpvmECWhVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7QGTuD/JDI8nh5hwQM0L5LTAiogAAAf4AAAAgAAA/wAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZN2P8AAAf4AAAAgAAA/wAAABAAAB/gAAACAAAD/AAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU='
		);
		audio.preload = 'auto';
		audio.volume = 0.5;
		scanner = new Html5QrcodeScanner(
			'qr-scanner',
			{
				fps,
				qrbox: { width, height },
				aspectRatio,
				supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
				formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
				rememberLastUsedCamera: true,
				disableFlip: true
			},
			false
		);
		scanner.render(handleScanSuccess, handleScanFailure);
		scanning = true;
		scannerState = Html5QrcodeScannerState.SCANNING;
	});

	// Cleanup on destroy
	onDestroy(() => {
		if (scanner) {
			try {
				scanner.clear();
			} catch (error) {
				console.error('Error cleaning up scanner:', error);
			}
		}

		// Cleanup audio
		if (audio) {
			audio.pause();
			audio.src = '';
			audio = null;
		}
	});

	$effect(() => {
		if (stop_camera) {
			document.getElementById('html5-qrcode-button-camera-stop')?.click();
		}
	});

	// Effect to handle external pausing/resuming
	$effect(() => {
		if (!scanner) return;

		try {
			if (paused) {
				scanner.pause();
				scanning = false;
				scannerState = Html5QrcodeScannerState.PAUSED;
			} else if (!paused && scanner.getState() === Html5QrcodeScannerState.PAUSED) {
				scanner.resume();
				scanning = true;
				scannerState = Html5QrcodeScannerState.SCANNING;
			}
		} catch (error) {
			console.error('Error toggling scanner state:', error);
		}
	});
</script>

<div class="grid place-items-center gap-2">
	<div class="relative w-full">
		<div id="qr-scanner" class="h-full w-full !border-none"></div>

		{#if scanComplete && lastResult && singleScanMode}
			<div
				class="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-green-600/85"
			>
				<div class="text-center text-white">
					<div class="mb-4 text-4xl">✓</div>
					<p>Scan Complete</p>
					<button
						class="mt-4 rounded bg-white px-4 py-2 font-bold text-green-600 hover:bg-gray-100"
						onclick={reset}
					>
						Scan Again
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Override styles for the "Allow Camera" button */
	#qr-scanner :global(#html5-qrcode-button-camera-permission) {
		background-color: #4caf50; /* Green background */
		color: white; /* White text */
		font-size: 16px; /* Adjust font size */
		padding: 10px 20px; /* Add padding */
		border-radius: 8px; /* Rounded corners */
		border: none; /* Remove border */
		cursor: pointer; /* Pointer cursor */
		transition: background-color 0.3s ease; /* Smooth hover effect */
	}

	#qr-scanner :global(#html5-qrcode-button-camera-permission:hover) {
		background-color: #45a049; /* Darker green on hover */
	}

	/* Override styles for the "Start Camera" button */
	#qr-scanner :global(#html5-qrcode-button-camera-start) {
		background-color: #025792; /* Blue background */
		color: white; /* White text */
		font-size: 16px; /* Adjust font size */
		padding: 10px 20px; /* Add padding */
		border-radius: 8px; /* Rounded corners */
		border: none; /* Remove border */
		cursor: pointer; /* Pointer cursor */
		transition: background-color 0.3s ease; /* Smooth hover effect */
	}

	#qr-scanner :global(#html5-qrcode-button-camera-start:hover) {
		background-color: #025792; /* Darker blue on hover */
	}

	/* Override styles for the "Stop Camera" button */
	#qr-scanner :global(#html5-qrcode-button-camera-stop) {
		background-color: #f44336; /* Red background */
		color: white; /* White text */
		font-size: 16px; /* Adjust font size */
		padding: 10px 20px; /* Add padding */
		border-radius: 8px; /* Rounded corners */
		border: none; /* Remove border */
		cursor: pointer; /* Pointer cursor */
		transition: background-color 0.3s ease; /* Smooth hover effect */
	}

	#qr-scanner :global(#html5-qrcode-button-camera-stop:hover) {
		background-color: #d32f2f; /* Darker red on hover */
	}

	/* Hide the "Scan Type Change" link */
	#qr-scanner :global(#html5-qrcode-anchor-scan-type-change) {
		display: none;
	}

	/* Hide unwanted icons */
	#qr-scanner :global(img[alt='Info icon']),
	#qr-scanner :global(img[alt='Camera based scan']) {
		display: none !important; /* Completely hide the icons */
	}

	/* Hide the "Scan Type Change" link */
	#qr-scanner :global(#html5-qrcode-anchor-scan-type-change) {
		display: none !important;
	}

	/* Customize the video element */
	#qr-scanner :global(video) {
		border-radius: 12px; /* Add rounded corners to the video */
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* Add shadow */
		object-fit: cover; /* Ensure the video fits nicely */
	}

	/* Add height constraint to the scanner container */
	#qr-scanner {
		overflow: hidden;
		border-radius: 12px; /* Add rounded corners to the container */
	}
</style>
