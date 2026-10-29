// Plain ESM so the config loads without SWC; Hostinger's build servers have an
// old glibc and can only use Next's WASM SWC fallback.
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
