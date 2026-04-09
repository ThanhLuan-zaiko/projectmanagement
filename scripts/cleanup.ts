// Scheduled cleanup script
// Run this with: bun scripts/cleanup.ts

import { runCleanupTasks } from '@/utils/cleanup';

async function main() {
  console.log('🧹 Starting cleanup tasks...');
  
  const results = await runCleanupTasks();
  
  console.log(`✅ Cleanup completed:`);
  console.log(`   - Sessions deleted: ${results.sessions}`);
  console.log(`   - Reset tokens deleted: ${results.resetTokens}`);
  console.log(`   - Rate limit records cleaned: ${results.rateLimits}`);
}

main().catch(console.error);
