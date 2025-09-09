#!/usr/bin/env tsx

/**
 * Standalone migration runner for Prisma/Supabase
 *
 * Usage:
 *   npx tsx scripts/db-migrate.ts --deploy        # apply pending migrations to DATABASE_URL
 *   npx tsx scripts/db-migrate.ts --dev           # create & apply a new dev migration
 *   npx tsx scripts/db-migrate.ts --push          # push current schema without migrations
 *   npx tsx scripts/db-migrate.ts --status        # show migration status
 *
 * Requires DATABASE_URL to be set (.env or environment).
 */

import { execSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

function log(message: string): void {
	console.log(`➡️  ${message}`)
}

function run(cmd: string): void {
	log(`$ ${cmd}`)
	execSync(cmd, { stdio: 'inherit' })
}

function loadEnvFile(filePath: string): void {
	if (existsSync(filePath)) {
		const content = readFileSync(filePath, 'utf8')
		const lines = content.split('\n')
		for (const line of lines) {
			const trimmed = line.trim()
			if (trimmed && !trimmed.startsWith('#')) {
				const [key, ...valueParts] = trimmed.split('=')
				if (key && valueParts.length > 0) {
					const value = valueParts.join('=').replace(/^["']|["']$/g, '')
					process.env[key] = value
				}
			}
		}
	}
}

function ensureDbUrl(): void {
	// Load .env files
	loadEnvFile(join(process.cwd(), '.env'))
	loadEnvFile(join(process.cwd(), '.env.local'))
	
	if (!process.env.DATABASE_URL) {
		console.error('❌ DATABASE_URL not found in .env or .env.local files')
		process.exit(1)
	}
	
	log(`Using DATABASE_URL: ${process.env.DATABASE_URL.replace(/\/\/.*@/, '//***@')}`)
}

async function main() {
	const args = process.argv.slice(2)
	ensureDbUrl()

	if (args.includes('--deploy')) {
		run('npx prisma migrate deploy')
		return
	}

	if (args.includes('--dev')) {
		run('npx prisma migrate dev')
		return
	}

	if (args.includes('--push')) {
		run('npx prisma db push')
		return
	}

	if (args.includes('--status')) {
		run('npx prisma migrate status')
		return
	}

	console.log('Usage: --deploy | --dev | --push | --status')
}

void main()


