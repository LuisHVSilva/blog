import {DataTypes, type Sequelize} from 'sequelize';

export class Models {
    private readonly _sequelize: Sequelize;

    constructor(sequelize: Sequelize) {
        this._sequelize = sequelize;
    }

    registerEditorialModels() {
        const article = this._sequelize.define('EditorialArticle', {
            id: {type: DataTypes.UUID, primaryKey: true},
            sourceLocale: {type: DataTypes.STRING, field: 'source_locale'},
            authorId: {type: DataTypes.UUID, field: 'author_id'},
            difficulty: DataTypes.STRING,
            createdAt: {type: DataTypes.DATE, field: 'created_at'},
            archivedAt: {type: DataTypes.DATE, field: 'archived_at'}
        }, {tableName: 'articles', timestamps: false});

        const translation = this._sequelize.define('EditorialArticleTranslation', {
            id: {type: DataTypes.UUID, primaryKey: true},
            articleId: {type: DataTypes.UUID, field: 'article_id'},
            locale: DataTypes.STRING,
            slug: DataTypes.STRING,
            title: DataTypes.STRING,
            description: DataTypes.STRING,
            bodyMarkdown: {type: DataTypes.TEXT, field: 'body_markdown'},
            status: DataTypes.STRING,
            publishedAt: {type: DataTypes.DATE, field: 'published_at'},
            updatedAt: {type: DataTypes.DATE, field: 'updated_at'},
            readingMinutes: {type: DataTypes.INTEGER, field: 'reading_minutes'}
        }, {tableName: 'article_translations', timestamps: false});

        article.hasMany(translation, {foreignKey: 'articleId'});
        translation.belongsTo(article, {foreignKey: 'articleId'});

        return {article, translation};
    }
}