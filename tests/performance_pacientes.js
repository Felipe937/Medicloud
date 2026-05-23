const http = require('http');

const BASE_URL = process.env.MEDICLOUD_URL || 'http://localhost:3001';
const TEST_EMAIL = process.env.TEST_EMAIL || 'admin@medicloud.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || '123456';
const REQUESTS = 100;
const MAX_RESPONSE_TIME_MS = 2000;

function request(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function getToken() {
    const res = await request('POST', '/api/auth/login', {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
    });
    if (res.status !== 200 || !res.data.success) {
        throw new Error(
            `Login failed (${res.status}): ${res.data?.message || 'unknown'}`
        );
    }
    return res.data.data.token;
}

async function run() {
    console.log(`Performance test: GET /api/pacientes (${REQUESTS} requests)`);
    console.log(`Target: < ${MAX_RESPONSE_TIME_MS}ms per request\n`);

    let token;
    try {
        token = await getToken();
        console.log('Authentication successful\n');
    } catch (err) {
        console.error(`Failed to authenticate: ${err.message}`);
        process.exit(1);
    }

    const times = [];
    let passed = 0;
    let failed = 0;

    for (let i = 1; i <= REQUESTS; i++) {
        const start = Date.now();
        try {
            const res = await request('GET', '/api/pacientes', null, token);
            const elapsed = Date.now() - start;
            times.push(elapsed);

            if (res.status === 200 && res.data.success) {
                passed++;
            } else {
                failed++;
                console.log(
                    `  #${i} FAIL (status ${res.status}): ${elapsed}ms`
                );
            }
        } catch (err) {
            failed++;
            times.push(Date.now() - start);
            console.log(`  #${i} ERROR: ${err.message}`);
        }
    }

    times.sort((a, b) => a - b);
    const total = times.length;
    const sum = times.reduce((a, b) => a + b, 0);
    const avg = (sum / total).toFixed(2);
    const min = times[0];
    const max = times[total - 1];
    const median = total % 2 === 0
        ? (times[total / 2 - 1] + times[total / 2]) / 2
        : times[Math.floor(total / 2)];
    const p95 = times[Math.floor(total * 0.95)];
    const p99 = times[Math.floor(total * 0.99)];

    console.log('\n--- RESULTS ---');
    console.log(`  Requests:    ${total}`);
    console.log(`  Passed:      ${passed}`);
    console.log(`  Failed:      ${failed}`);
    console.log(`  Min (ms):    ${min}`);
    console.log(`  Max (ms):    ${max}`);
    console.log(`  Avg (ms):    ${avg}`);
    console.log(`  Median (ms): ${median}`);
    console.log(`  P95 (ms):    ${p95}`);
    console.log(`  P99 (ms):    ${p99}`);

    const maxObserved = Math.max(...times);
    const ok = maxObserved < MAX_RESPONSE_TIME_MS && failed === 0;
    console.log(`\n  Result:      ${ok ? 'PASS' : 'FAIL'}`);
    if (!ok) {
        if (maxObserved >= MAX_RESPONSE_TIME_MS) {
            console.log(
                `    - Max response time (${maxObserved}ms) exceeds limit (${MAX_RESPONSE_TIME_MS}ms)`
            );
        }
        if (failed > 0) {
            console.log(`    - ${failed} request(s) returned non-success`);
        }
        process.exit(1);
    }
}

run().catch((err) => {
    console.error(`Unexpected error: ${err.message}`);
    process.exit(1);
});
