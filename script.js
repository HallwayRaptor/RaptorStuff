// script.js
async function fetchLastUpdate(repo) {
    const cacheKey = `last-update-${repo}`;
    const cached = localStorage.getItem(cacheKey);
    const oneDay = 24 * 60 * 60 * 1000;
  
    if (cached) {
      const { timestamp, date } = JSON.parse(cached);
      if (Date.now() - timestamp < oneDay) return date;
    }
  
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
        headers: window.GITHUB_TOKEN ? { 'Authorization': `token ${window.GITHUB_TOKEN}` } : {}
      });
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      const lastUpdate = data.published_at;
  
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        date: lastUpdate
      }));
      
      return lastUpdate;
    } catch (error) {
      console.error(`Error fetching release for ${repo}:`, error);
      return null;
    }
  }
  
  function getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
  
  document.addEventListener('DOMContentLoaded', async () => {
    const cards = document.querySelectorAll('.card');
    
    for (const card of cards) {
      const repo = card.dataset.repo;
      const updateSpan = card.querySelector('.last-update');
      
      if (!repo) {
        updateSpan.textContent = 'Last Update: N/A';
        continue;
      }
  
      const lastUpdate = await fetchLastUpdate(repo);
      updateSpan.textContent = lastUpdate 
        ? `Last Update: ${getRelativeTime(lastUpdate)}`
        : 'Last Update: N/A';
    }
  });