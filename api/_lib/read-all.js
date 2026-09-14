// Les lectures agrégées doivent dépasser la limite PostgREST (1000 par défaut).
// Recréer la requête à chaque page évite de réutiliser un builder mutable.
export async function readAll(makeQuery, key = 'id', pageSize = 500, maxRows = 50000) {
  const rows = [];
  for (;;) {
    const { data, error } = await makeQuery().order(key, { ascending: true })
      .range(rows.length, rows.length + pageSize - 1);
    if (error) return { data: null, error };
    if (!Array.isArray(data)) return { data: null, error: { code: 'ULTIMA_INVALID_RESPONSE' } };
    if (!data.length) return { data: rows, error: null };
    rows.push(...data);
    if (rows.length > maxRows) return { data: null, error: { code: 'ULTIMA_ROW_LIMIT' } };
    // Continuer même après une page courte : le projet peut imposer un cap
    // inférieur à pageSize. Seule la page VIDE prouve la fin de la lecture.
  }
}
