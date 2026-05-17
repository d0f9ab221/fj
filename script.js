document.getElementById('channel-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = document.getElementById('channel-url').value.trim();
    const resultDiv = document.getElementById('result');
    const loadingState = () => {
        document.querySelector('button').innerHTML = 'Processing...';
        document.querySelector('button').disabled = true;
    };
    const resetLoadingState = () => {
        document.querySelector('button').innerHTML = 'Generate Profile';
        document.querySelector('button').disabled = false;
    };
    
    if (!url) return;
    
    loadingState();
    
    try {
        const response = await fetch('/api/extract-channel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('channel-logo').src = data.logoUrl;
            document.getElementById('channel-name').textContent = data.name;
            document.getElementById('subscribe-button').href = data.subscribeUrl;
            resultDiv.classList.remove('hidden');
        } else {
            throw new Error(data.error || 'Failed to extract channel info');
        }
    } catch (error) {
        alert('Error: ' + error.message);
        resultDiv.classList.add('hidden');
    } finally {
        resetLoadingState();
    }
});