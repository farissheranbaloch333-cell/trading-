// Run quant engine tests using tsx or node
import { runQuantEngineTests } from '../src/lib/engine/engine.test.ts';

const { passed, testResults } = runQuantEngineTests();

console.log('\n========================================');
console.log('       SIGNALPRO QUANT ENGINE TESTS     ');
console.log('========================================\n');

testResults.forEach((t, i) => {
  const icon = t.success ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [Test ${i + 1}] ${t.name}: ${t.details}`);
});

console.log('\n----------------------------------------');
if (passed) {
  console.log('🎉 ALL QUANT ENGINE TESTS PASSED SUCCESSFULLY!');
} else {
  console.error('⚠️ SOME TESTS FAILED');
  process.exit(1);
}
