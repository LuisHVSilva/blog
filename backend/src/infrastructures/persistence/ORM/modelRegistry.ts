import 'reflect-metadata';
import type {ModelCtor} from 'sequelize-typescript';
import {AuthorProfileModel} from './models/authorProfile.model';
import {ArticleModel} from './models/article.model';
import {ArticleTranslationModel} from './models/articleTranslation.model';
import {TagModel} from './models/tag.model';
import {TagTranslationModel} from './models/tagTranslation.model';
import {ArticleTagModel} from './models/articleTag.model';
import {SeriesModel} from './models/series.model';
import {SeriesTranslationModel} from './models/seriesTranslation.model';
import {SeriesArticleModel} from './models/seriesArticle.model';
import {ArticlePathModel} from './models/articlePath.model';
import {PublicationEditionModel} from './models/publicationEdition.model';
import {PublicationCurrentRevisionModel} from './models/publicationCurrentRevision.model';

/** Single explicit registry, used with repositoryMode to isolate connections. */
export const editorialModels: ModelCtor[] = [AuthorProfileModel, ArticleModel, ArticleTranslationModel, TagModel, TagTranslationModel, ArticleTagModel, SeriesModel, SeriesTranslationModel, SeriesArticleModel, ArticlePathModel, PublicationEditionModel, PublicationCurrentRevisionModel];
