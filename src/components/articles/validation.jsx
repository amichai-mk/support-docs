export const calculateCompleteness = (formData) => {
  let score = 0;
  const weights = {
    title: 10,
    database: 5,
    issue: 20,
    environment: 15,
    cause: 20,
    resolutions: 30  // Combined steps + verification
  };

  if (formData.title && formData.title.trim() !== '' && formData.title !== 'Untitled Article') {
    score += weights.title;
  }

  if (formData.database && formData.database.trim() !== '') {
    score += weights.database;
  }

  if (formData.issue && formData.issue.trim() !== '') {
    score += weights.issue;
  }

  if (formData.environment && formData.environment.trim() !== '') {
    const hasRequiredLabels = 
      (formData.environment.includes('Web:') || formData.environment.includes('Back-Office:')) &&
      formData.environment.includes('Table:') &&
      formData.environment.includes('Frequency:') &&
      formData.environment.includes('Interfaces:');
    
    if (hasRequiredLabels) {
      score += weights.environment;
    } else {
      score += weights.environment * 0.5;
    }
  }

  if (formData.cause && formData.cause.trim() !== '') {
    score += weights.cause;
  }

  // Check resolutions (new format)
  if (formData.resolutions && formData.resolutions.length > 0) {
    const hasValidResolution = formData.resolutions.some(res => {
      const hasSteps = res.steps && res.steps.length > 0 && res.steps.some(step => {
        const text = typeof step === 'string' ? step : step?.text || '';
        return text.trim() !== '';
      });
      const hasVerification = res.verification && res.verification.trim() !== '';
      return hasSteps && hasVerification;
    });
    
    if (hasValidResolution) {
      score += weights.resolutions;
    } else {
      // Partial credit if has steps but no verification
      const hasAnySteps = formData.resolutions.some(res => 
        res.steps && res.steps.length > 0 && res.steps.some(step => {
          const text = typeof step === 'string' ? step : step?.text || '';
          return text.trim() !== '';
        })
      );
      if (hasAnySteps) {
        score += weights.resolutions * 0.67;
      }
    }
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
  if (!formData.issue || formData.issue.trim() === '') {
    issues.push({ field: 'issue', severity: 'error', message: 'Issue section is required' });
  }

  // Database validation
  if (!formData.database || formData.database.trim() === '') {
    issues.push({ field: 'database', severity: 'error', message: 'Database acronym is required' });
  }

  // Environment validation
  if (!formData.environment || formData.environment.trim() === '') {
    issues.push({ field: 'environment', severity: 'error', message: 'Environment section is required' });
  }

  // Cause validation
  if (!formData.cause || formData.cause.trim() === '') {
    issues.push({ field: 'cause', severity: 'error', message: 'Cause section is required' });
  }

  // Resolution validation (new format)
  if (!formData.resolutions || formData.resolutions.length === 0) {
    issues.push({ field: 'resolution', severity: 'error', message: 'At least one resolution is required' });
  } else {
    const hasValidResolution = formData.resolutions.some(res => 
      res.steps && res.steps.length > 0 && res.steps.some(step => {
        const text = typeof step === 'string' ? step : step?.text || '';
        return text.trim() !== '';
      })
    );
    if (!hasValidResolution) {
      issues.push({ field: 'resolution', severity: 'error', message: 'At least one resolution step is required' });
    }
    
    const allHaveVerification = formData.resolutions.every(res => 
      res.verification && res.verification.trim() !== ''
    );
    if (!allHaveVerification) {
      issues.push({ field: 'verification', severity: 'error', message: 'All resolutions require verification statements' });
    }
  }

  return issues;
};