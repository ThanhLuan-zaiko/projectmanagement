import cassandra from 'cassandra-driver';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from '@/config';

const APPLY_ONLY = process.argv.includes('--apply-only');
const SCHEMA_PATH = path.resolve(process.cwd(), 'schema.cql');

function assertValidIdentifier(value: string, label: string) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}

function normalizeSchema(schema: string, keyspace: string) {
  return schema.replace(/\bproject_management\b/g, keyspace);
}

function splitStatements(schema: string) {
  const withoutComments = schema
    .split('\n')
    .map((line) => line.replace(/--.*$/, '').trimEnd())
    .join('\n');

  return withoutComments
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function executeStatements(client: cassandra.Client, statements: string[]) {
  for (const statement of statements) {
    await client.execute(statement);
    const preview = statement.replace(/\s+/g, ' ').slice(0, 120);
    console.log(`Applied: ${preview}${statement.length > 120 ? '...' : ''}`);
  }
}

async function main() {
  const { host, port, localDatacenter, keyspace } = config.database;
  assertValidIdentifier(keyspace, 'keyspace');

  const schema = await readFile(SCHEMA_PATH, 'utf8');
  const rewrittenSchema = normalizeSchema(schema, keyspace);
  const statements = splitStatements(rewrittenSchema);

  const client = new cassandra.Client({
    contactPoints: [`${host}:${port}`],
    localDataCenter: localDatacenter,
  });

  try {
    await client.connect();
    console.log(
      `Connected to ScyllaDB at ${host}:${port} (datacenter: ${localDatacenter})`
    );

    if (!APPLY_ONLY) {
      console.log(`Dropping keyspace ${keyspace}...`);
      await client.execute(`DROP KEYSPACE IF EXISTS ${keyspace}`);
    } else {
      console.log(`Applying schema without dropping keyspace ${keyspace}...`);
    }

    await executeStatements(client, statements);

    console.log('\nSchema synchronization completed.');
    console.log(`Mode: ${APPLY_ONLY ? 'apply-only' : 'full reset'}`);
    console.log(`Keyspace: ${keyspace}`);
    console.log('Next steps:');
    console.log('1. Re-seed demo data if needed.');
    console.log('2. Re-run the app and verify create/update/delete flows.');
  } finally {
    await client.shutdown();
  }
}

main().catch((error) => {
  console.error('Schema reset failed:', error);
  process.exitCode = 1;
});
