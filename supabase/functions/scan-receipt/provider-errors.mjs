// Return only allowlisted diagnostics. Never expose provider messages or keys.
const quotaCodes = new Set(['insufficient_quota','credit_balance_exhausted','billing_hard_limit_reached','organization_spend_limit_exceeded','project_spend_limit_exceeded','organization_usage_limit_exceeded','usage_limit_exceeded']);
const knownCodes = new Set([...quotaCodes,'rate_limit_exceeded','slow_down','server_is_overloaded','server_overloaded','invalid_api_key','model_not_found','invalid_image','invalid_image_format','invalid_image_url','invalid_request_error','permission_denied']);
export function classifyProviderFailure(status, payload, headers = new Headers()) {
  const error = payload?.error;
  const rawCode = typeof error?.code === 'string' ? error.code : null;
  const code = knownCodes.has(rawCode) ? rawCode : 'unknown';
  const requestId = headers.get('x-request-id');
  const diagnostic = { provider:'openai', http_status:status, code,
    ...(requestId && /^[a-zA-Z0-9_-]{1,120}$/.test(requestId) ? {request_id:requestId} : {}),
  };
  const organization = headers.get('openai-organization');
  const project = headers.get('openai-project');
  if (organization && /^org-[a-zA-Z0-9_-]{1,100}$/.test(organization)) diagnostic.organization_id=organization;
  if (project && /^proj_[a-zA-Z0-9_-]{1,100}$/.test(project)) diagnostic.project_id=project;
  const base = { diagnostic, retryable:false, retry_after:null };
  // Billing failures can also have the broader insufficient_quota type.
  if (quotaCodes.has(rawCode) || error?.type === 'insufficient_quota') {
    if (code === 'unknown') diagnostic.code = 'insufficient_quota';
    const message = rawCode === 'credit_balance_exhausted'
      ? 'OpenAI API credits are exhausted. Add credits in OpenAI API billing, then try again. The sample receipt still works.'
      : ['project_spend_limit_exceeded','organization_spend_limit_exceeded'].includes(rawCode)
      ? 'The OpenAI API spending limit has been reached. Check the API project or organization limits. The sample receipt still works.'
      : 'OpenAI reports no available API quota. Check API billing, credit balance, and usage limits before retrying. The sample receipt still works.';
    return {...base,status:503,code:'ai_quota_exceeded',message};
  }
  if (status === 401) return {...base,status:503,code:'ai_auth_failed',message:'OpenAI rejected the API key. Update the OPENAI_API_KEY server secret. The sample receipt still works.'};
  if (status === 403 || status === 404 || rawCode === 'model_not_found') return {...base,status:503,code:'ai_model_unavailable',message:'The OpenAI API project cannot access the configured model. Check model access and server configuration, or use the sample receipt.'};
  const retryValue = headers.get('retry-after');
  const seconds = retryValue === null ? 60 : /^\d+(\.\d+)?$/.test(retryValue) ? Number(retryValue) : (Date.parse(retryValue)-Date.now())/1000;
  const retryAfter = Number.isFinite(seconds) ? Math.max(1,Math.min(3600,Math.ceil(seconds))) : 60;
  if (status === 429) return {...base,status:429,code:'ai_rate_limited',retryable:true,retry_after:retryAfter,message:`OpenAI temporarily rate-limited this request. Wait ${retryAfter} seconds before trying again, or use the sample receipt.`};
  if (status === 503) return {...base,status:503,code:'ai_overloaded',retryable:true,retry_after:retryAfter,message:`OpenAI is temporarily overloaded. Wait ${retryAfter} seconds before trying again, or use the sample receipt.`};
  return {...base,status:502,code:'ai_request_failed',retryable:status>=500,message:'The AI service could not read this receipt. Retry or use the sample receipt.'};
}
