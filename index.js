const loaderUtils = require("loader-utils");
const assign = require("object-assign");
const request = require("sync-request");

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

class SSI {

  constructor(options) {
    this.options = options;

    this.options.matchers = {
      BLOCK: /<!--\s?#\s?block\s+name="(\w+)"\s+-->(.*?)<!--\s?#\s+endblock\s+-->/,
      INCLUDE: /<!--\s?#\s?include\s+(?:virtual|file)="([^"]+)"(?:\s+stub="(\w+)")?\s+-->/
    }
  }

  compile(content){
    let output       = [];
    const blocks       = {};
    const splitContent = content.split("\n");

    for(let line of splitContent) {
      const part            = line.trim();
      const [name, content] = this.processBlock( part );

      if(name){
        blocks[name] = content;
      }
      else {
        output += this.processInclude(part, blocks);
      }
    }

    return output;
  }

  processBlock(part) {
    const matches = part.match(this.options.matchers.BLOCK);
    if(!matches) return "";
    return [matches[1], matches[2]];
  }

  processInclude(part, blocks) {
    const matches = part.match(this.options.matchers.INCLUDE);
    if(!matches) return part;

    const location = matches[1]
    const stub     = matches[2];

    let [status, body] = this.getContent(location);
    return status === 200 ? body : blocks[stub];
  }

  getContent(location) {

    for (let key in this.options.locations) {
      if(location.match(key)) {
        const url = `${this.options.locations[key]}${location}`;
        const res = request("GET", url);
        return [res.statusCode, res.statusCode < 400 ? res.getBody("utf8") : ""];
      }
    }
    return [];
  }

}

module.exports = function (source) {
  const config = getLoaderConfig(this);
	const ssi = new SSI(config);

	this.cacheable && this.cacheable();

	return ssi.compile(source);
};
