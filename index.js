const loaderUtils = require("loader-utils");
const assign = require("object-assign");
const SSI = require("./lib/ssi");

function getLoaderConfig(context) {
	const query = loaderUtils.parseQuery(context.query);
	const configKey = query.config || 'ssiLoader';
	const config = context.options &&
              context.options.hasOwnProperty(configKey) ?
              context.options[configKey] :
              {};

	delete query.config;

	return assign(query, config);
}

module.exports = function (source) {
  const config = getLoaderConfig(this);
	const ssi = new SSI(config);

	this.cacheable && this.cacheable();

	return ssi.compile(source);
};
