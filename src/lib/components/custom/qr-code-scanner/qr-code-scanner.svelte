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
	} = $props();

	// State using runes
	let scanner = $state<Html5QrcodeScanner | null>(null);
	let scannerState = $state<Html5QrcodeScannerState | null>(null);
	let lastResult = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);
	let scanning = $state(true);
	let scanComplete = $state(false);

	// Flag to prevent duplicate scans of the same QR code
	let lastScanTimestamp = 0;
	const DEBOUNCE_INTERVAL = 1500; // 1.5 seconds between same QR code scan

	function handleScanSuccess(decodedText: string, decodedResult: Html5QrcodeResult): void {
		// Prevent duplicate scans
		const now = Date.now();
		if (now - lastScanTimestamp < DEBOUNCE_INTERVAL && lastResult === decodedText) {
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

	// Effect to handle external pausing/resuming
	$effect(() => {
		if (!scanner) return;

		try {
			if (paused && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
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

	// Make methods accessible from outside
	function pause() {
		if (scanner?.getState() === Html5QrcodeScannerState.SCANNING) {
			scanner.pause();
			scanning = false;
			scannerState = Html5QrcodeScannerState.PAUSED;
		}
	}

	function resume() {
		if (scanner?.getState() === Html5QrcodeScannerState.PAUSED) {
			scanner.resume();
			scanning = true;
			scannerState = Html5QrcodeScannerState.SCANNING;
		}
	}
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
	/* Customize the "Allow Camera Access" button */
	#qr-scanner :global(#html5-qrcode-button-camera-permission) {
		background-color: #196ea6; /* Change background color */
		color: white; /* Change text color */
		font-size: 16px; /* Adjust font size */
		padding: 10px 20px; /* Add padding */
		border-radius: 8px; /* Add rounded corners */
		border: none; /* Remove border */
		cursor: pointer; /* Add pointer cursor */
		transition: background-color 0.3s ease; /* Add hover transition */
	}

	#qr-scanner :global(#html5-qrcode-button-camera-permission:hover) {
		background-color: #145a8a; /* Darker shade on hover */
	}

	/* Customize the "Stop Camera" button */
	#qr-scanner :global(#html5-qrcode-button-camera-stop) {
		background-color: #e63946; /* Change background color */
		color: white; /* Change text color */
		font-size: 16px; /* Adjust font size */
		padding: 10px 20px; /* Add padding */
		border-radius: 8px; /* Add rounded corners */
		border: none; /* Remove border */
		cursor: pointer; /* Add pointer cursor */
		transition: background-color 0.3s ease; /* Add hover transition */
	}

	#qr-scanner :global(#html5-qrcode-button-camera-stop:hover) {
		background-color: #d62839; /* Darker shade on hover */
	}

	/* Hide the "Scan Type Change" link */
	#qr-scanner :global(#html5-qrcode-anchor-scan-type-change) {
		display: none;
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


	  /* Customize the "Start Scanning" button */
	  #qr-scanner :global(#html5-qrcode-button-camera-start) {
        background-color: #28a745; /* Change background color */
        color: white; /* Change text color */
        font-size: 16px; /* Adjust font size */
        padding: 10px 20px; /* Add padding */
        border-radius: 8px; /* Add rounded corners */
        border: none; /* Remove border */
        cursor: pointer; /* Add pointer cursor */
        transition: background-color 0.3s ease; /* Add hover transition */
    }

    #qr-scanner :global(#html5-qrcode-button-camera-start:hover) {
        background-color: #218838; /* Darker shade on hover */
    }

    /* Optionally, add focus styles */
    #qr-scanner :global(#html5-qrcode-button-camera-start:focus) {
        outline: 2px solid #218838; /* Add focus outline */
        outline-offset: 2px;
    }
</style>
