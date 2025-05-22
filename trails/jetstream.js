let ws = null;
const output = document.getElementById('output');
const input = document.getElementById('input');
const jsonError = document.getElementById('jsonError');

function log(message) {
    const timestamp = new Date().toISOString();
    output.value += `[${timestamp}] ${message}\n`;
    output.scrollTop = output.scrollHeight;
}

function connect() {
    if (ws) {
        log('Already connected!');
        return;
    }

    try {
        const id = "kv2xgohgb734tcuyqqtkqawy"; // now.robertl.in

        ws = new WebSocket(`wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post&wantedDids=did:plc:${id}`);
        
        ws.onopen = () => {
            log('Connected to Bluesky WebSocket');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                log(`Received: ${JSON.stringify(data, null, 2)}`);
                if (data.commit.record.text.includes('donut') || data.commit.record.text.includes('🍩')) {
                  window.triggerShowDonut(); // Trigger the donut
                }
            } catch (e) {
                log(`Raw message: ${event.data}`);
            }
        };

        ws.onerror = (error) => {
            log(`WebSocket Error: ${error.message}`);
        };

        ws.onclose = () => {
            log('Disconnected from Bluesky WebSocket');
            ws = null;
        };

    } catch (error) {
        log(`Connection Error: ${error.message}`);
        ws = null;
    }
}

function disconnect() {
    if (ws) {
        ws.close();
        ws = null;
        log('Disconnected by user');
    } else {
        log('Not connected');
    }
}

// Event Listeners
document.getElementById('connect').addEventListener('click', connect);
document.getElementById('disconnect').addEventListener('click', disconnect);
document.getElementById('clear').addEventListener('click', () => {
    output.value = '';
});

connect(); // Automatically connect on page load