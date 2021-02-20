var moduleAlias = require('module-alias')

moduleAlias.addAliases({
  react: 'preact/compat/dist/compat',
  'react-dom': 'preact/compat/dist/compat',
})
