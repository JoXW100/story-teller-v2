
/**
 * @typedef RenderElement
 * @property {string} type
 * @property {string} defaultKey
 * @property {[string]} validOptions
 * @property {(params: { options: Object.<string, string> }) => JSX.Element} toComponent
 * @property {(options: Object.<string, string>) => void} validateOptions
 */