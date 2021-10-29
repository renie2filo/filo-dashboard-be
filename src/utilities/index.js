const filter_query = '/search/tickets?query='
const createdAt_range = (from, to) => `${filter_query}"created_at:>%27${from}%27%20AND%20created_at:<%27${to}%27`
const createdAt = (date) => `created_at:%27${date}%27`

export {createdAt, createdAt_range, filter_query}