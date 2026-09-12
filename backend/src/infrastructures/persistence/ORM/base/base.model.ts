import {Model} from 'sequelize-typescript';

export abstract class BaseModel<T extends object, C extends object = T> extends Model<T, C> {}
