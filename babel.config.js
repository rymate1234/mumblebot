module.exports = {
  'presets': [
    '@babel/preset-env',
    'preact'
  ],
  'plugins': [
    [
      'babel-plugin-styled-components',
      {
        'pure': true,
        'transpileTemplateLiterals': true
      }
    ],
    '@babel/plugin-proposal-class-properties',
    [
      'module-resolver',
      {
        'root': [
          '.'
        ],
        'alias': {
          'react': 'preact-compat',
          'react-dom': 'preact-compat'
        }
      }
    ]
  ]
}
