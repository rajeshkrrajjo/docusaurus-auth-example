const docusaurusConfig = {
    root: 'website'
};

const siteConfig = require(process.cwd() + '/' + docusaurusConfig.root + '/siteConfig.js');

var config = {
    rootFolder: 'website/build/' + siteConfig.projectName,
    port: process.env.PORT,
    database: process.env.DATABASE,
    database_user: process.env.DATABASE_USER,
    database_pass: process.env.DATABASE_PASS
};

module.exports = config;