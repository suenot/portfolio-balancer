const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true
  },
  // Отключаем статическую генерацию для корневых страниц
  // и вместо этого используем SSR
  output: 'standalone',
  
  // Увеличиваем таймаут для страниц, которые все еще используют статическую генерацию
  staticPageGenerationTimeout: 300,
  
  // Отключаем trailingSlash, так как он может вызывать проблемы с роутингом при i18n
  trailingSlash: false,
  
  webpack: (config) => {
    return config;
  }
};

module.exports = withNextIntl(nextConfig);
