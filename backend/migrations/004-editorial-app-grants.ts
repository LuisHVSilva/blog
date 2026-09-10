import type {Migration} from './runner';
export const migration: Migration = {version: '004-editorial-app-grants', checksum: '8e446904139a7a6c6e95026c6229520cf16e1cde886b3331a82091390f882425', async up(sequelize, transaction) {
    await sequelize.query('GRANT SELECT, INSERT, UPDATE, DELETE ON article_paths TO blog_app', {transaction});
}};
