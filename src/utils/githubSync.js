/**
 * GitHub & Local Backup Utilities for Microbledle Microdex Studio
 * Supports:
 * 1. Option A: 1-Click JSON file export/download (Zero-config, completely safe)
 * 2. Option B: Direct GitHub REST API commit to DuckCH/microbledle repository
 */

const DEFAULT_REPO_OWNER = 'DuckCH';
const DEFAULT_REPO_NAME = 'microbledle';
const DEFAULT_FILE_PATH = 'src/data/microbes.json';

/**
 * Option A: 1-Click Download JSON Backup
 * Creates and downloads a formatted microbes.json snapshot file.
 * @param {Array} microbesList - Complete list of microbes
 * @param {string} [filename] - Optional filename
 */
export function downloadPathogensJson(microbesList, filename = 'microbes.json') {
  if (typeof window === 'undefined') return;
  const jsonContent = JSON.stringify(microbesList, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Option B: Direct GitHub REST API Commit
 * Pushes updated microbes.json directly to the GitHub repo main branch.
 * @param {Object} params
 * @param {string} params.token - GitHub Personal Access Token (Fine-grained or classic with 'repo' scope)
 * @param {Array} params.microbesList - The full microbes list to commit
 * @param {string} [params.commitMessage] - Custom commit message
 * @param {string} [params.repoOwner] - Defaults to DuckCH
 * @param {string} [params.repoName] - Defaults to microbledle
 * @param {string} [params.branch] - Defaults to main
 * @returns {Promise<{ success: boolean, commitSha?: string, error?: string }>}
 */
export async function commitPathogensToGitHub({
  token,
  microbesList,
  commitMessage = 'chore(data): update textbook citations & pathogen records from Microdex Studio',
  repoOwner = DEFAULT_REPO_OWNER,
  repoName = DEFAULT_REPO_NAME,
  filePath = DEFAULT_FILE_PATH,
  branch = 'main'
}) {
  if (!token) {
    throw new Error('GitHub Personal Access Token is required to sync directly.');
  }

  const cleanToken = token.trim();
  const fileApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${branch}`;

  // 1. Fetch current file SHA from GitHub repository
  let currentFileSha = null;
  const getFileRes = await fetch(fileApiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${cleanToken}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (getFileRes.ok) {
    const fileData = await getFileRes.json();
    currentFileSha = fileData.sha;
  } else if (getFileRes.status === 401 || getFileRes.status === 403) {
    throw new Error('Invalid GitHub token or insufficient repository permissions (requires repo scope).');
  } else if (getFileRes.status !== 404) {
    const errText = await getFileRes.text();
    throw new Error(`Failed to check repository state: ${errText}`);
  }

  // 2. Prepare JSON content with UTF-8 base64 encoding
  const formattedJson = JSON.stringify(microbesList, null, 2);
  const utf8Bytes = new TextEncoder().encode(formattedJson);
  let binaryString = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binaryString += String.fromCharCode(utf8Bytes[i]);
  }
  const base64Content = btoa(binaryString);

  // 3. Commit file via GitHub API PUT
  const putPayload = {
    message: commitMessage,
    content: base64Content,
    branch: branch
  };

  if (currentFileSha) {
    putPayload.sha = currentFileSha;
  }

  const putRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${cleanToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(putPayload)
  });

  if (!putRes.ok) {
    const errJson = await putRes.json().catch(() => ({}));
    throw new Error(errJson.message || `GitHub API error: HTTP ${putRes.status}`);
  }

  const resultData = await putRes.json();
  return {
    success: true,
    commitSha: resultData.commit?.sha || null,
    commitUrl: resultData.commit?.html_url || null
  };
}
