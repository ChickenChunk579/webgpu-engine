// Contents of the file /rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { minify } from 'rollup-plugin-esbuild-minify'

const config = [
    {
        input: 'src/main-web.ts',
        output: {
            file: 'out/bundle.js',
            format: 'esm',
            sourcemap: true,
            compact: true
        },
        external: ['axios', 'os', 'url'],
        plugins: [typescript(), minify()]
    }
];
export default config;