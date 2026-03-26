import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function getSessionId(): string {
  let sessionId = localStorage.getItem('super_app_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('super_app_session_id', sessionId);
  }
  return sessionId;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'x-session-id': getSessionId(),
    },
  },
});

export async function ensureSession(): Promise<string> {
  const sessionId = getSessionId();
  const { data } = await supabase
    .from('user_sessions')
    .select('session_id')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (!data) {
    await supabase.from('user_sessions').insert({ session_id: sessionId });
  } else {
    await supabase
      .from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('session_id', sessionId);
  }

  return sessionId;
}
