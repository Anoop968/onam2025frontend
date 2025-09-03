// Backend API URL
const API_URL = 'http://127.0.0.1:5000/api';

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: '12345'
};

async function loadGames() {
  const gamesDiv = document.getElementById('games');
  const gameSelect = document.getElementById('gameSelect');
  const winnerSelect = document.getElementById('winnerSelect');
  const scoresDiv = document.getElementById('team-scores');

  gamesDiv.innerHTML = '<p>Loading…</p>';
  scoresDiv.innerHTML = 'Loading…';
  gameSelect.innerHTML = '';
  winnerSelect.innerHTML = '';

  try {
    const res = await fetch(`${API_URL}/scoreboard`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Team scores header
    scoresDiv.innerHTML = `
      <div>${data.teamNames.teamA}: ${data.teams['Team A']}</div>
      <div>${data.teamNames.teamB}: ${data.teams['Team B']}</div>
    `;

    // Winner dropdown
    winnerSelect.innerHTML = `
      <option value="Team A">${data.teamNames.teamA}</option>
      <option value="Team B">${data.teamNames.teamB}</option>
    `;

    // Games grid + game dropdown
    gamesDiv.innerHTML = '';
    gameSelect.innerHTML = '';
    data.games.forEach((g, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = g.title;
      gameSelect.appendChild(opt);

      const displayWinner = g.winner
        ? (g.winner === 'Team A' ? data.teamNames.teamA : data.teamNames.teamB)
        : 'Not decided';

      const card = document.createElement('div');
      card.className = 'game';
      card.innerHTML = `
        <h4>${g.title}</h4>
        <p>Winner: ${displayWinner}</p>
        <p>Points: ${g.points}</p>
      `;
      gamesDiv.appendChild(card);
    });

    // Prefill name inputs
    document.getElementById('teamAName').value = data.teamNames.teamA;
    document.getElementById('teamBName').value = data.teamNames.teamB;
  } catch (err) {
    console.error(err);
    gamesDiv.innerHTML = `<p style="color:#d00">Failed to load data. Is the backend running?</p>`;
    scoresDiv.innerHTML = '';
  }
}

// Update Winner
async function updateScore() {
  const gameIndex = document.getElementById('gameSelect').value;
  const winner = document.getElementById('winnerSelect').value;
  const btn = document.getElementById('updateBtn');
  btn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/update-winner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameIndex, winner })
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.message || 'Update failed');
  } catch (e) {
    alert(e.message);
  } finally {
    btn.disabled = false;
    loadGames();
  }
}

// Update Team Names
async function updateTeamNames() {
  const teamAName = document.getElementById('teamAName').value.trim();
  const teamBName = document.getElementById('teamBName').value.trim();
  if (!teamAName || !teamBName) return alert('Enter both team names.');

  try {
    const res = await fetch(`${API_URL}/update-team-names`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamAName, teamBName })
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.message || 'Name update failed');
  } catch (e) {
    alert(e.message);
  } finally {
    loadGames();
  }
}

// Reset All Scores
async function resetScores() {
  if (!confirm("Are you sure you want to reset all scores?")) return;

  try {
    const res = await fetch(`${API_URL}/reset-scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const j = await res.json();
    if (!res.ok) throw new Error(j.message || 'Reset failed');

    alert("Tournament has been reset successfully!");
    loadGames();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

// Admin Login
function adminLogin() {
  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;
  const errorMsg = document.getElementById('login-error');

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    errorMsg.style.display = 'none';
  } else {
    errorMsg.style.display = 'block';
  }
}

// Logout
function logout() {
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('login-section').style.display = 'block';

  document.getElementById('adminUsername').value = '';
  document.getElementById('adminPassword').value = '';
}

window.onload = loadGames;
