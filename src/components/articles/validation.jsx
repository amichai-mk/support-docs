// Strip HTML tags for validation
const stripHtml = (html) => {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export const calculateCompleteness = (formData) => {
  let score = 0;
  const weights = {
    title: 10,
    issue: 20,
    environment: 20,
    cause: 20,
    resolution_steps: 20,
    verification: 10
  };

  if (formData.title && formData.title.trim() !== '' && formData.title !== 'Untitled Article') {
    score += weights.title;
  }

  const issueText = stripHtml(formData.issue);
  if (issueText.trim() !== '') {
    score += weights.issue;
  }

  const envText = stripHtml(formData.environment);
  if (envText.trim() !== '') {
    // Check if environment has required labels (in HTML format)
    const env = formData.environment || '';
    const hasRequiredLabels = 
      env.includes('Back-Office:') &&
      env.includes('Table:') &&
      env.includes('Frequency:') &&
      env.includes('Interfaces:');
    
    if (hasRequiredLabels) {
      score += weights.environment;
    } else {
      score += weights.environment * 0.5; // Partial credit
    }
  }

  const causeText = stripHtml(formData.cause);
  if (causeText.trim() !== '') {
    score += weights.cause;
  }

  if (formData.resolution_steps && formData.resolution_steps.length > 0) {
    const hasNonEmptySteps = formData.resolution_steps.some(step => step.trim() !== '');
    if (hasNonEmptySteps) {
      score += weights.resolution_steps;
    }
  }

  if (formData.verification && formData.verification.trim() !== '') {
    score += weights.verification;
  }

  return Math.round(score);
};

export const validateArticle = (formData) => {
  const issues = [];

  // Title validation
  if (!formData.title || formData.title === 'Untitled Article') {
    issues.push({ field: 'title', severity: 'error', message: 'Article title is required' });
  }

  // Issue validation
  const issueText = stripHtml(formData.issue);
  if (issueText.trim() === '') {
    issues.push({ field: 'issue', severity: 'error', message: 'Issue section is required' });
  }

  // Environment validation
  const envText = stripHtml(formData.environment);
  if (envText.trim() === '') {
    issues.push({ field: 'environment', severity: 'error', message: 'Environment section is required' });
  }

  // Cause validation
  const causeText = stripHtml(formData.cause);
  if (causeText.trim() === '') {
    issues.push({ field: 'cause', severity: 'error', message: 'Cause section is required' });
  }

  // Resolution validation
  if (!formData.resolution_steps || formData.resolution_steps.length === 0) {
    issues.push({ field: 'resolution', severity: 'error', message: 'At least one resolution step is required' });
  }

  if (!formData.verification || formData.verification.trim() === '') {
    issues.push({ field: 'verification', severity: 'error', message: 'Verification statement is required' });
  }

  return issues;
};