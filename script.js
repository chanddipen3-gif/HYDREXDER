document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const connectBtn = document.getElementById('connectBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');
    const statusEl = document.getElementById('status');
    const sendBtn = document.getElementById('sendBtn');
    const feedbackMsg = document.getElementById('feedbackMsg');

    // Weight Input Elements
    const presetBtns = document.querySelectorAll('.preset-btn');
    const customWeightInput = document.getElementById('customWeightInput');
    const weightUnitSelect = document.getElementById('weightUnit');
    const selectedWeightValue = document.getElementById('selectedWeightValue');

    // Bluetooth State
    let bluetoothDevice = null;
    let writeCharacteristic = null;
    let currentWeightKg = null;

    // Common BLE UART Service UUIDs (Nordic UART)
    const UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
    const UART_RX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // RX characteristic is what we write to

    // Weight Selection Logic
    function updateSelectedWeight(weightKg) {
        currentWeightKg = parseFloat(weightKg);
        selectedWeightValue.textContent = `${currentWeightKg.toFixed(3)} kg`;

        // Update UI state
        presetBtns.forEach(btn => {
            if (parseFloat(btn.dataset.weight) === currentWeightKg) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Enable send button if connected
        if (writeCharacteristic) {
            sendBtn.disabled = false;
        }
    }

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const weight = parseFloat(btn.dataset.weight);
            updateSelectedWeight(weight);
            customWeightInput.value = ''; // Clear custom input
        });
    });

    customWeightInput.addEventListener('input', () => {
        const val = parseFloat(customWeightInput.value);
        if (!isNaN(val) && val >= 0) {
            const unit = weightUnitSelect.value;
            const weightKg = unit === 'g' ? val / 1000 : val;
            updateSelectedWeight(weightKg);
        } else {
            currentWeightKg = null;
            selectedWeightValue.textContent = '--';
            presetBtns.forEach(b => b.classList.remove('active'));
            sendBtn.disabled = true;
        }
    });

    weightUnitSelect.addEventListener('change', () => {
        // Trigger input event to recalculate
        const event = new Event('input');
        customWeightInput.dispatchEvent(event);
    });


    // UI State Management
    function setConnectionStatus(status) {
        statusEl.className = 'status ' + status;

        if (status === 'connected') {
            statusEl.textContent = 'Connected';
            connectBtn.classList.add('hidden');
            disconnectBtn.classList.remove('hidden');
            if (currentWeightKg !== null) {
                sendBtn.disabled = false;
            }
        } else if (status === 'disconnected') {
            statusEl.textContent = 'Disconnected';
            connectBtn.classList.remove('hidden');
            disconnectBtn.classList.add('hidden');
            sendBtn.disabled = true;
            writeCharacteristic = null;
        } else if (status === 'connecting') {
            statusEl.textContent = 'Connecting...';
            connectBtn.disabled = true;
        }
    }

    function showFeedback(msg, isError = false) {
        feedbackMsg.textContent = msg;
        feedbackMsg.className = 'feedback-msg ' + (isError ? 'error' : 'success');

        // Clear message after 3 seconds
        setTimeout(() => {
            if (feedbackMsg.textContent === msg) {
                feedbackMsg.textContent = '';
                feedbackMsg.className = 'feedback-msg';
            }
        }, 3000);
    }

    // Bluetooth Logic
    async function connectBluetooth() {
        if (!navigator.bluetooth) {
            showFeedback("Web Bluetooth is not supported in this browser.", true);
            return;
        }

        try {
            setConnectionStatus('connecting');

            // Request device with UART service
            bluetoothDevice = await navigator.bluetooth.requestDevice({
                filters: [{ services: [UART_SERVICE_UUID] }],
                optionalServices: [UART_SERVICE_UUID]
            });

            bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);

            const server = await bluetoothDevice.gatt.connect();
            const service = await server.getPrimaryService(UART_SERVICE_UUID);

            // Get the RX characteristic (we write to the device's RX)
            writeCharacteristic = await service.getCharacteristic(UART_RX_CHARACTERISTIC_UUID);

            setConnectionStatus('connected');
            showFeedback("Connected successfully!");

        } catch (error) {
            console.error(error);
            setConnectionStatus('disconnected');
            connectBtn.disabled = false; // Re-enable if failed
            if (error.name === 'NotFoundError') {
                showFeedback("Connection cancelled.", true);
            } else {
                showFeedback("Connection failed: " + error.message, true);
            }
        }
    }

    function onDisconnected() {
        setConnectionStatus('disconnected');
        showFeedback("Device disconnected.", true);
        connectBtn.disabled = false;
    }

    async function disconnectBluetooth() {
        if (bluetoothDevice && bluetoothDevice.gatt.connected) {
            bluetoothDevice.gatt.disconnect();
        }
    }

    async function sendWeightData() {
        if (!writeCharacteristic) {
            showFeedback("Not connected to a device.", true);
            return;
        }

        if (currentWeightKg === null) {
            showFeedback("Please select a weight first.", true);
            return;
        }

        try {
            sendBtn.disabled = true;
            sendBtn.textContent = 'Sending...';

            // Format payload: e.g., "WEIGHT:7.600KG\n"
            const payloadString = `WEIGHT:${currentWeightKg.toFixed(3)}KG\n`;

            // Convert string to ArrayBuffer
            const encoder = new TextEncoder();
            const payloadArrayBuffer = encoder.encode(payloadString);

            await writeCharacteristic.writeValue(payloadArrayBuffer);

            showFeedback(`Sent: ${currentWeightKg.toFixed(3)} kg successfully!`);

        } catch (error) {
            console.error("Send error:", error);
            showFeedback("Failed to send data: " + error.message, true);
        } finally {
            sendBtn.textContent = 'Send Weight';
            sendBtn.disabled = false;
        }
    }

    // Event Listeners
    connectBtn.addEventListener('click', connectBluetooth);
    disconnectBtn.addEventListener('click', disconnectBluetooth);
    sendBtn.addEventListener('click', sendWeightData);
});
