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
 * Generic helper to trigger a browser JSON download
 */
export function downloadJsonBlob(data, filename) {
  if (typeof window === 'undefined') return;
  const jsonContent = JSON.stringify(data, null, 2);
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
 * Option A: 1-Click Download Pathogens JSON Backup
 * Creates and downloads a formatted microbes.json snapshot file.
 * @param {Array} microbesList - Complete list of microbes
 * @param {string} [filename] - Optional filename
 */
export function downloadPathogensJson(microbesList, filename = `microbes-backup-${new Date().toISOString().split('T')[0]}.json`) {
  downloadJsonBlob(microbesList, filename);
}

/**
 * 1-Click Download Chapter Summaries Backup
 */
export function downloadChapterSummariesJson(summariesMap, filename = `chapter-summaries-backup-${new Date().toISOString().split('T')[0]}.json`) {
  downloadJsonBlob(summariesMap || {}, filename);
}

/**
 * 1-Click Download Full Unified Ecosystem Backup (Microbes + Chapter Summaries)
 */
export function downloadFullEcosystemBackup({ microbesList = [], chapterSummaries = {} }, filename = `microbledle-ecosystem-backup-${new Date().toISOString().split('T')[0]}.json`) {
  const payload = {
    app: 'Microbledle & WikiMicrobe',
    version: '2.0',
    exportDate: new Date().toISOString(),
    stats: {
      totalMicrobes: microbesList.length,
      totalChapterSummaries: Object.keys(chapterSummaries || {}).length
    },
    microbes: microbesList,
    chapterSummaries: chapterSummaries
  };
  downloadJsonBlob(payload, filename);
}

/**
 * Parses and validates an uploaded backup JSON string
 */
export function parseBackupJson(rawJsonString) {
  try {
    const parsed = JSON.parse(rawJsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'File content is not a valid JSON object or array.' };
    }

    // Type 1: Unified Ecosystem Backup
    if (parsed.app && (parsed.microbes || parsed.chapterSummaries)) {
      return {
        valid: true,
        type: 'full',
        microbes: Array.isArray(parsed.microbes) ? parsed.microbes : null,
        chapterSummaries: parsed.chapterSummaries && typeof parsed.chapterSummaries === 'object' ? parsed.chapterSummaries : null,
        stats: {
          microbesCount: Array.isArray(parsed.microbes) ? parsed.microbes.length : 0,
          summariesCount: parsed.chapterSummaries ? Object.keys(parsed.chapterSummaries).length : 0
        }
      };
    }

    // Type 2: Array of microbes (e.g. microbes.json)
    if (Array.isArray(parsed)) {
      const isMicrobesList = parsed.length > 0 && parsed[0].id && parsed[0].name && parsed[0].morphology;
      if (!isMicrobesList) {
        return { valid: false, error: 'JSON array does not contain valid Microbledle pathogen records.' };
      }
      return {
        valid: true,
        type: 'microbes',
        microbes: parsed,
        chapterSummaries: null,
        stats: {
          microbesCount: parsed.length,
          summariesCount: 0
        }
      };
    }

    // Type 3: Map of chapter summaries (e.g. { murray_10ed_ch1: { ... } })
    const keys = Object.keys(parsed);
    const isSummariesMap = keys.length > 0 && keys.every(k => k.includes('_ch') || (parsed[k] && parsed[k].chapterNumber !== undefined));
    if (isSummariesMap) {
      return {
        valid: true,
        type: 'summaries',
        microbes: null,
        chapterSummaries: parsed,
        stats: {
          microbesCount: 0,
          summariesCount: keys.length
        }
      };
    }

    return { valid: false, error: 'Unrecognized backup structure. Expected microbes array, chapter summaries map, or full ecosystem backup.' };
  } catch (err) {
    return { valid: false, error: `Invalid JSON syntax: ${err.message}` };
  }
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

/**
 * Option B2: Direct GitHub REST API Commit for Chapter Summaries
 * Pushes updated bundledChapterSummaries.json directly to GitHub repo.
 */
export async function commitChapterSummariesToGitHub({
  token,
  chapterSummaries,
  commitMessage = 'chore(data): update textbook chapter summaries from WikiMicrobe Studio',
  repoOwner = DEFAULT_REPO_OWNER,
  repoName = DEFAULT_REPO_NAME,
  filePath = 'src/data/bundledChapterSummaries.json',
  branch = 'main'
}) {
  if (!token) {
    throw new Error('GitHub Personal Access Token is required to sync directly.');
  }

  const cleanToken = token.trim();
  const fileApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${branch}`;

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

  const formattedJson = JSON.stringify(chapterSummaries || {}, null, 2);
  const utf8Bytes = new TextEncoder().encode(formattedJson);
  let binaryString = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binaryString += String.fromCharCode(utf8Bytes[i]);
  }
  const base64Content = btoa(binaryString);

  const putPayload = {
    message: commitMessage,
    content: base64Content,
    branch: branch
  };

  if (currentFileSha) {
    putPayload.sha = currentFileSha;
  }

  const putRes = await fetch(fileApiUrl, {
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
