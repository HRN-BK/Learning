import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// TODO: Replace with your Supabase project credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL'
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function signUp(email, password) {
  const { error } = await supabase.auth.signUp({ email, password })
  return { error }
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error }
}

export async function requestPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  return { error }
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  return { error }
}

export async function insertVocabulary(word, definition) {
  const { error } = await supabase.from('vocabulary').insert([{ word, definition }])
  return { error }
}

export async function fetchVocabulary() {
  const { data, error } = await supabase.from('vocabulary').select('*').order('id', { ascending: true })
  return { data, error }
}

export async function insertSymbol(symbol, value) {
  const { error } = await supabase.from('symbols').insert([{ symbol, value }])
  return { error }
}

export async function fetchSymbols() {
  const { data, error } = await supabase.from('symbols').select('*').order('id', { ascending: true })
  return { data, error }
}

export async function insertFormula(formula, description) {
  const { error } = await supabase.from('formulas').insert([{ formula, description }])
  return { error }
}

export async function fetchFormulas() {
  const { data, error } = await supabase.from('formulas').select('*').order('id', { ascending: true })
  return { data, error }
}

