module.exports = {
  entry: './index.tsx',
  output: {
    filename: 'index.js',
    library: {
      type: 'umd',
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx$/i,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  mode: 'development',
  watch: true,
};
