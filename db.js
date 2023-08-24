/**
 * Arquivo responsavel por inicializar o banco de dados
 */
const Sequelize = require('sequelize');
const config = require('./config');

// Pegar os dados para inicializar o servidor de banco de dados
const { database, user, password, host, port, dialect } = config.dbConfig;

// Criar uma instancia do Sequilize (é ORM - Mapeador objeto-relacional)
// Ele ajuda a manipulação do banco de dados
// Permitindo criar modelos (classes) que representam as tabelas do banco de dados
const sequelize = new Sequelize(database, user, password, {
  host,
  port,
  dialect,
});

// Inicializa o banco de dados de acordo com o models (que serão as tabelas)
sequelize
  .sync()
  //.sync({ force: true })
  .then(() => {
    console.log('Tabelas sincronizadas.');
  })
  .catch((err) => {
    console.error('Erro ao sincronizar:', err);
  });

// Exporta o sequelize que vai ser usado para manipular os dados
module.exports = sequelize;