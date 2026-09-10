import babelParser from '@babel/eslint-parser';
import {dirname, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const normalized = (filename) => relative(root, filename).split(sep).join('/');
const moduleLayer = (filename) => /^src\/modules\/([^/]+)\/(domain|application|adapters)(?:\/|$)/.exec(filename);

// Resolve relative paths before checking layers: ../../ cannot bypass the boundary.
const boundaries = {
    meta: {
        type: 'problem', schema: [],
        messages: {forbidden: 'Dependency violates the architecture boundary: {{dependency}}.'},
    },
    create(context) {
        const filename = context.filename;
        const source = moduleLayer(normalized(filename))
            ?? (/^src\/shared\/domain\//.test(normalized(filename)) ? ['', 'shared-domain', 'domain'] : null);
        const pure = source && ['domain', 'application'].includes(source[2]);
        function check(node, value) {
            const dependency = typeof value === 'string' ? value : '<dynamic import>';
            let forbidden = /^@(shared|framework|logger|infrastructure)\//.test(dependency);
            if (pure) {
                if (!dependency.startsWith('.')) forbidden = true;
                else {
                    const target = normalized(resolve(dirname(filename), dependency));
                    const layer = moduleLayer(target);
                    const sharedDomain = /^src\/shared\/domain\/(entity\.base|entity-audit\.base)(?:\.js|\.ts)?$/.test(target);
                    const shared = /^src\/shared\/(errors\/application\.error(?:\.js|\.ts)?$|types\/)/.test(target)
                        && !/\/persistence\.type(?:\.js|\.ts)?$/.test(target);
                    const ownDomain = layer?.[1] === source[1] && layer[2] === 'domain';
                    const application = source[2] === 'application' && layer?.[2] === 'application'
                        && (layer[1] === source[1] || /^src\/modules\/[^/]+\/application\/ports\//.test(target));
                    forbidden ||= !(sharedDomain || shared || ownDomain || application);
                }
            } else if (source?.[2] === 'adapters' && dependency.startsWith('.')) {
                const target = normalized(resolve(dirname(filename), dependency));
                const otherHttp = /^src\/modules\/([^/]+)\/adapters\/http(?:\/|$)/.exec(target);
                forbidden ||= Boolean(otherHttp && otherHttp[1] !== source[1]);
            }
            if (forbidden) context.report({node, messageId: 'forbidden', data: {dependency}});
        }
        return {
            ImportDeclaration: (node) => check(node, node.source.value),
            ExportNamedDeclaration: (node) => { if (node.source) check(node, node.source.value); },
            ExportAllDeclaration: (node) => check(node, node.source.value),
            ImportExpression: (node) => check(node, node.source.value),
            CallExpression: (node) => {
                if (node.callee.name === 'require' || node.callee.type === 'Import') {
                    check(node, node.arguments[0]?.value);
                }
            },
            TSImportType: (node) => check(node, (node.argument ?? node.parameter)?.value),
            TSExternalModuleReference: (node) => check(node, node.expression?.value),
        };
    },
};

export default [
    {ignores: ['node_modules/**', 'dist/**', 'tmp/**', 'out-tsc/**', 'LOGS/**']},
    {
        files: ['**/*.{ts,js,mjs,cjs}'],
        languageOptions: {ecmaVersion: 'latest', sourceType: 'module'},
        plugins: {architecture: {rules: {boundaries}}},
        rules: {
            'architecture/boundaries': 'error',
            'constructor-super': 'error',
            'no-debugger': 'error',
            'no-duplicate-case': 'error',
            'no-unsafe-finally': 'error',
            'no-constant-condition': ['error', {checkLoops: false}],
            'no-var': 'error',
            'prefer-const': 'error',
            eqeqeq: ['error', 'always'],
        },
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                babelOptions: {
                    babelrc: false, configFile: false,
                    parserOpts: {plugins: ['typescript', 'decorators-legacy']},
                },
            },
        },
    },
    {
        files: ['src/modules/*/{domain,application}/**/*.ts', 'src/shared/domain/**/*.ts'],
        rules: {
            'no-restricted-globals': ['error', 'process', 'global', 'globalThis', 'Buffer', 'fetch', '__dirname', '__filename'],
        },
    },
];
