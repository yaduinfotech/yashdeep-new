/**
 * Diagnostic CLI script to test live connectivity and Bearer token authentication
 * with the external Hotel Management System (HMS) API.
 *
 * Usage:
 *   npx tsx scripts/test-live-hms.ts
 *   or: npm run test:hms
 */

import * as fs from 'fs';
import * as path from 'path';

// Helper to load .env variables if not already set
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.trim().match(/^([^=]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
      }
    }
  }
}

async function main() {
  loadEnv();

  const baseUrl = process.env.HMS_BASE_URL || 'https://hms.yashdeeppalace.com';
  const token = process.env.HMS_BEARER_TOKEN;
  const targetUrl = `${baseUrl.replace(/\/+$/, '')}/api/bookings/new`;

  console.log('='.repeat(65));
  console.log('🏨 Yashdeep Palace - HMS API Live Connectivity Test');
  console.log('='.repeat(65));
  console.log(`Endpoint URL : ${targetUrl}`);
  console.log(`Bearer Token : ${token ? `[CONFIGURED: ${token.slice(0, 4)}...${token.slice(-4)}]` : '[NOT SET in .env]'}`);
  console.log('-'.repeat(65));

  if (!token) {
    console.warn('⚠️ WARNING: HMS_BEARER_TOKEN is not set in your .env file.');
    console.warn('Please add: HMS_BEARER_TOKEN="your_actual_token" to test authenticated calls.');
    console.log('\nProbing endpoint with OPTIONS to check host availability...');
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(targetUrl, {
      method: token ? 'POST' : 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Source': 'yashdeep-web-diagnostic',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: token
        ? JSON.stringify({
            testProbe: true,
            source: 'yashdeep-web-diagnostic',
            timestamp: new Date().toISOString(),
          })
        : undefined,
      signal: controller.signal,
    });

    const elapsed = Date.now() - startTime;
    const bodyText = await res.text().catch(() => '');

    console.log(`HTTP Status  : ${res.status} ${res.statusText}`);
    console.log(`Latency      : ${elapsed}ms`);
    console.log(`Content-Type : ${res.headers.get('content-type') || 'unknown'}`);
    console.log('-'.repeat(65));
    console.log('Response Body Preview:');
    try {
      const parsed = JSON.parse(bodyText);
      console.log(JSON.stringify(parsed, null, 2));
    } catch {
      console.log(bodyText ? bodyText.slice(0, 500) : '(empty response)');
    }

    console.log('-'.repeat(65));
    if (res.ok) {
      console.log('✅ SUCCESS: HMS API responded successfully!');
    } else if (res.status === 401 || res.status === 403) {
      console.log('🔒 AUTH REQUIRED: Endpoint reachable, but token rejected or missing.');
    } else {
      console.log(`ℹ️ Response received with HTTP code ${res.status}.`);
    }
  } catch (err: unknown) {
    const error = err as Error;
    const elapsed = Date.now() - startTime;
    console.error(`❌ FAILED (${elapsed}ms):`, error.message);
  } finally {
    clearTimeout(timer);
    console.log('='.repeat(65));
  }
}

main().catch(console.error);
