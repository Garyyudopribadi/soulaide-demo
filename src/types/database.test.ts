import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

describe('Database Naming & Schema Consistency', () => {
  it('enforces every SQL CREATE TABLE statement uses the exact Soulaide_ prefix', () => {
    const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations')
    const migrationFiles = fs.readdirSync(migrationsDir).filter((file: string) => file.endsWith('.sql'))

    expect(migrationFiles.length).toBeGreaterThan(0)

    for (const file of migrationFiles) {
      const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
      const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?public\."([^"]+)"/gi

      let match
      while ((match = createTableRegex.exec(content)) !== null) {
        const tableName = match[1]
        expect(tableName.startsWith('Soulaide_')).toBe(true)
      }
    }
  })

  it('enforces no unquoted custom tables are created in migrations', () => {
    const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations')
    const migrationFiles = fs.readdirSync(migrationsDir).filter((file: string) => file.endsWith('.sql'))

    for (const file of migrationFiles) {
      const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
      // Ensure no `CREATE TABLE public.Soulaide_` without quotes exists
      const unquotedTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?public\.[a-zA-Z]/gi
      const unquotedMatches = content.match(unquotedTableRegex)
      expect(unquotedMatches).toBeNull()
    }
  })

  it('enforces seed.sql only references tables starting with Soulaide_', () => {
    const seedPath = path.resolve(process.cwd(), 'supabase/seed/seed.sql')
    const content = fs.readFileSync(seedPath, 'utf-8')

    const insertIntoRegex = /INSERT\s+INTO\s+public\."([^"]+)"/gi
    let match
    while ((match = insertIntoRegex.exec(content)) !== null) {
      const tableName = match[1]
      expect(tableName.startsWith('Soulaide_')).toBe(true)
    }
  })
})
