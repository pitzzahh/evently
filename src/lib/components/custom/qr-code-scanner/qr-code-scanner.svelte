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
		width = 400,
		height = 400,
		paused = $bindable(false),
		fps = 60,
		aspectRatio = 1,
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

		try {
			scanner = new Html5QrcodeScanner(
				'qr-scanner',
				{
					fps,
					qrbox: { width, height },
					aspectRatio,
					supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
					formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
					rememberLastUsedCamera: true
				},
				false // non-verbose
			);

			scanner.render(handleScanSuccess, handleScanFailure);
			scanning = true;
			scannerState = Html5QrcodeScannerState.SCANNING;
		} catch (error) {
			console.error('Failed to initialize QR scanner:', error);
			errorMessage = error instanceof Error ? error.message : String(error);
		}
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

<div class="qr-scanner-container">
	<div id="qr-scanner" class="size-full"></div>

	{#if scanComplete && lastResult && singleScanMode}
		<div class="scan-success-overlay">
			<div class="success-content">
				<div class="success-icon">✓</div>
				<p>Scan Complete</p>
				<button class="reset-button" onclick={reset}> Scan Again </button>
			</div>
		</div>
	{/if}

	{#if errorMessage}
		<div class="error-message">
			{errorMessage}
		</div>
	{/if}
</div>

<style>
	.qr-scanner-container {
		position: relative;
	}

	/* Hide unwanted icons */
	#qr-scanner :global(img[alt='Info icon']),
	#qr-scanner :global(img[alt='Camera based scan']) {
		display: none;
	}

	/* Change camera permission button text */
	#qr-scanner :global(#html5-qrcode-button-camera-permission) {
		visibility: hidden;
		position: relative;
	}

	#qr-scanner :global(#html5-qrcode-button-camera-permission::after) {
		position: absolute;
		inset: auto 0 0;
		display: block;
		content: 'Allow camera access';
		visibility: visible;
		padding: 10px 0;
	}

	.error-message {
		color: #ff3e00;
		margin-top: 8px;
		font-size: 14px;
		text-align: center;
	}

	.scan-success-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(45, 160, 80, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		border-radius: 8px;
	}

	.success-content {
		text-align: center;
		color: white;
	}

	.success-icon {
		font-size: 48px;
		margin-bottom: 16px;
	}

	.reset-button {
		background-color: white;
		color: #2da050;
		border: none;
		padding: 8px 16px;
		border-radius: 4px;
		margin-top: 16px;
		font-weight: bold;
		cursor: pointer;
	}

	.reset-button:hover {
		background-color: #f0f0f0;
	}
</style>
