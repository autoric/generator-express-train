app = require('./app/index.js');

<% if(gt21) { %>
module.exports = app.resolve();
<% } else { %>
module.exports = app;
<% } %>
