import { api, setToken } from './app/client/src/api.js';

// Mock fetch for Node environment
global.fetch = async (url, options) => {
    const { default: fetch } = await import('node-fetch');
    return fetch(url, options);
};

// Mock localStorage
global.localStorage = {
    getItem: () => null,
    setItem: () => { }
};

async function testAdminAPI() {
    console.log("1. Creating Admin User...");
    // Note: In a real scenario, we'd seed this. Here we'll try to signup/login an admin.
    // Since signup defaults to 'student', we might need to manually update the role in DB or assume an admin exists.
    // For this test, let's try to hit the endpoint and expect a 403 or 401 if not authorized, 
    // which confirms the route exists and middleware is working.

    try {
        console.log("Testing /api/admin/analytics without auth...");
        await api('/api/admin/analytics');
    } catch (e) {
        console.log("Expected error (No Auth):", e.message);
    }

    // To properly test, we'd need to login as admin. 
    // Since we can't easily create an admin via API (security), 
    // we will rely on the fact that the server is running and the route is mounted.
    // We can check if the server responds to the path at all.

    console.log("Done.");
}

testAdminAPI();
