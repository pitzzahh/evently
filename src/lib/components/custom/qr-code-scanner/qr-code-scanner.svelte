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
		debounceInterval
	} = $state<ComponentState>({
		scanner: null,
		scannerState: null,
		lastResult: null,
		errorMessage: null,
		scanning: true,
		scanComplete: false,
		lastScanTimestamp: 0,
		debounceInterval: 1500 // 1.5 seconds
	});

	function handleScanSuccess(decodedText: string, decodedResult: Html5QrcodeResult): void {
		// Prevent duplicate scans
		const now = Date.now();
		if (now - lastScanTimestamp < debounceInterval && lastResult === decodedText) {
			return; // Ignore duplicate scan within debounce interval
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

	// Initialize scanner on mount
	onMount(() => {
		if (!browser) return;

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
			false // non-verbose
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
