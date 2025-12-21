// MCP Servers Diagnostic Script
import { spawn } from 'child_process';
import pkg from 'pg';
const { Client } = pkg;

console.log('🔍 MCP SERVERS DIAGNOSTIC TEST\n');
console.log('=' .repeat(60));

// Test 1: PostgreSQL MCP Server
async function testPostgreSQL() {
  console.log('\n📊 TEST 1: PostgreSQL Database Connection');
  console.log('-'.repeat(60));
  
  const client = new Client({
    connectionString: 'postgresql://cloud_admin:yaZM4jvs2TOk@144.91.78.222:5432/neondb',
  });

  try {
    await client.connect();
    const result = await client.query('SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = \'public\'');
    console.log('✅ PostgreSQL: CONNECTED');
    console.log(`   Tables found: ${result.rows[0].table_count}`);
    await client.end();
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Test 2: Check if Docker is installed
function testDocker() {
  console.log('\n🐳 TEST 2: Docker Installation');
  console.log('-'.repeat(60));
  
  return new Promise((resolve) => {
    const docker = spawn('docker', ['--version']);
    let output = '';
    
    docker.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    docker.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Docker: INSTALLED');
        console.log(`   ${output.trim()}`);
        resolve(true);
      } else {
        console.log('❌ Docker: NOT FOUND');
        console.log('   Docker is required for GitHub MCP server');
        resolve(false);
      }
    });
    
    docker.on('error', (err) => {
      console.log('❌ Docker: NOT FOUND');
      console.log('   Docker is required for GitHub MCP server');
      resolve(false);
    });
  });
}

// Test 3: Check if npx is available
function testNpx() {
  console.log('\n📦 TEST 3: NPX Availability');
  console.log('-'.repeat(60));
  
  return new Promise((resolve) => {
    const npx = spawn('npx', ['--version']);
    let output = '';
    
    npx.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    npx.on('close', (code) => {
      if (code === 0) {
        console.log('✅ NPX: AVAILABLE');
        console.log(`   Version: ${output.trim()}`);
        resolve(true);
      } else {
        console.log('❌ NPX: NOT FOUND');
        resolve(false);
      }
    });
    
    npx.on('error', (err) => {
      console.log('❌ NPX: NOT FOUND');
      resolve(false);
    });
  });
}

// Test 4: Check Node version
function testNode() {
  console.log('\n🟢 TEST 4: Node.js Version');
  console.log('-'.repeat(60));
  console.log(`✅ Node.js: ${process.version}`);
  return true;
}

// Test 5: Check if Puppeteer dependencies might work
async function testPuppeteer() {
  console.log('\n🎭 TEST 5: Puppeteer MCP Server Check');
  console.log('-'.repeat(60));
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log('⚠️  Puppeteer: TIMEOUT (may still work in MCP context)');
      proc.kill();
      resolve(false);
    }, 3000);
    
    const proc = spawn('npx', ['-y', '@modelcontextprotocol/server-puppeteer', '--version'], {
      timeout: 3000
    });
    
    let output = '';
    let errorOutput = '';
    
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    proc.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0 || output.length > 0) {
        console.log('✅ Puppeteer MCP: AVAILABLE');
        resolve(true);
      } else {
        console.log('⚠️  Puppeteer MCP: UNCERTAIN');
        console.log('   May work when called by MCP client');
        resolve(false);
      }
    });
    
    proc.on('error', (err) => {
      clearTimeout(timeout);
      console.log('❌ Puppeteer MCP: ERROR');
      console.log(`   ${err.message}`);
      resolve(false);
    });
  });
}

// Run all tests
async function runAllTests() {
  const results = {
    postgres: false,
    docker: false,
    npx: false,
    node: false,
    puppeteer: false
  };
  
  results.node = testNode();
  results.npx = await testNpx();
  results.postgres = await testPostgreSQL();
  results.docker = await testDocker();
  results.puppeteer = await testPuppeteer();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY');
  console.log('='.repeat(60));
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(v => v === true).length;
  
  console.log(`\nTests Passed: ${passedTests}/${totalTests}`);
  console.log('\nMCP Server Status:');
  console.log(`  ${results.postgres ? '✅' : '❌'} PostgreSQL MCP: ${results.postgres ? 'READY' : 'NOT READY'}`);
  console.log(`  ${results.puppeteer ? '✅' : '⚠️ '} Puppeteer MCP: ${results.puppeteer ? 'READY' : 'UNCERTAIN'}`);
  console.log(`  ${results.docker ? '✅' : '❌'} GitHub MCP: ${results.docker ? 'READY' : 'REQUIRES DOCKER'}`);
  
  if (!results.docker) {
    console.log('\n💡 RECOMMENDATION:');
    console.log('   Install Docker Desktop to enable GitHub MCP server:');
    console.log('   https://www.docker.com/products/docker-desktop');
  }
  
  console.log('\n' + '='.repeat(60));
}

runAllTests().catch(console.error);
