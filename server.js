const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// YouTube Data API configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'YOUR_YOUTUBE_DATA_API_KEY_HERE';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/channels';

// Function to extract channel ID from various YouTube URL formats
function extractChannelId(url) {
    let path = url.replace(/^(https?:\/\/)?(www\.)?youtube\.com\//, '');
    
    const patterns = [
        /^c\/([^/?]+)/,
        /^@([^/?]+)/,
        /^channel\/([^/?]+)/,
        /^user\/([^/?]+)/
    ];
    
    for (const pattern of patterns) {
        const match = path.match(pattern);
        if (match) {
            return match[1];
        }
    }
    
    return path.split('/')[0];
}

// API endpoint to extract channel info
app.post('/api/extract-channel', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    
    try {
        const channelId = extractChannelId(url);
        const apiUrl = `${YOUTUBE_API_URL}?part=snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (response.ok && data.items && data.items.length > 0) {
            const channel = data.items[0];
            const snippet = channel.snippet;
            const logoUrl = snippet.thumbnails.default.url;
            const name = snippet.title;
            const subscribeUrl = `https://www.youtube.com/c/${channelId}/videos` || `https://www.youtube.com/channel/${channelId}`;
            
            res.json({
                success: true,
                logoUrl,
                name,
                subscribeUrl
            });
        } else {
            throw new Error('Channel not found');
        }
    } catch (error) {
        console.error('Error extracting channel info:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});