import path from 'node:path';
import webpack from 'webpack';

const __dirname = import.meta.dirname;

const config: webpack.Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: { transpileOnly: true },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.mjs'],
  },
  experiments: {
    outputModule: true,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: 'index.mjs',
    module: true,
    chunkFormat: 'module',
  },
  stats: 'errors-only',
};

export default config;
