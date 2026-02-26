import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' });

  // récupérer les utilisateurs et leurs crédits
  const { data: users } = await supabase
    .from('users')
    .select('username, remaining_mb')
    .order('remaining_mb', { ascending: false });

  // récupérer les logs récents (juste pour dessiner la courbe d'activité récente)
  const { data: recentLogs } = await supabase
    .from('logs')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1000);

  // récupérer les stats exactes groupées depuis la Vue SQL
  const { data: articleStats } = await supabase
    .from('user_article_views')
    .select('*');

  // calcul des vrais totaux absolus basés sur les vues validées
  const allTimeViews = articleStats ? articleStats.reduce((acc, row) => acc + Number(row.total_views), 0) : 0;
  const allTimeMb = articleStats ? articleStats.reduce((acc, row) => acc + Number(row.total_mb), 0) : 0;

  return res.status(200).json({
    users: users ||[],
    recentLogs: recentLogs || [],
    articleStats: articleStats ||[],
    global: {
      allTimeViews,
      allTimeMb
    }
  });
}