import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' });

  // récupérer les utilisateurs
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('username, remaining_mb')
    .order('remaining_mb', { ascending: false });

  // récupérer les 1000 derniers logs (pour le graph et les stats)
  const { data: logs, error: logsError } = await supabase
    .from('logs')
    .select('created_at, username, used_mb, article_url, status')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (usersError || logsError) {
    return res.status(500).json({ error: 'Erreur DB' });
  }

  // calculs rapides côté backend
  const totalUsedMb = logs.reduce((acc, log) => acc + (log.used_mb || 0), 0);
  const totalRuns = logs.length;
  const successfulRuns = logs.filter(l => l.status === 'success').length;

  return res.status(200).json({
    users,
    logs,
    global: {
      totalUsedMb,
      totalRuns,
      successfulRuns,
      successRate: totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 0
    }
  });
}