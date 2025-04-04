import { Model, ModelStatic } from "sequelize"; 
import Logger from "../../shared/utils/Logger";


export class BaseController<T extends Model> {
  protected model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  async findOrCreate(creationAttributes: Partial<T>) {
    Logger.info('FIND_OR_CREATE', this.model.name, creationAttributes)

    const [record] = await this.model.findOrCreate({
      where: creationAttributes as any, 
      defaults: creationAttributes as any,
    });

    if (! record) {
      Logger.warn('Record not found for', this.model.name, creationAttributes);
      return null;
    }

    return record;
  }

  async create(data: Partial<T>) {
    Logger.info('Creating new', this.model.name, data);
    const record = await this.model.create(data as any);
    Logger.info(this.model.name, 'created successfully', record);
    
    return record;
  }

  async update(whereAttributes: Record<string, any>, updateAttributes: Partial<T>) {
    Logger.info('Updatind', this.model.name,  'attributes', updateAttributes);
    
    const [isUpdated, records] = await this.model.update(updateAttributes as any, {
      where: whereAttributes,
      returning: true,
      limit: 1
    });

    if (!isUpdated) {
      Logger.warn(this.model.name, 'record not found', whereAttributes);
      return null;
    }
    Logger.info(this.model.name, 'updated', records);

    return records[0];
  }

  async getById(id: any) {
    Logger.info('Getting', this.model.name, 'with id:', id);
    const record = await this.model.findOne({ where: { id } });
    
    if (!record) {
      Logger.warn(this.model.name, 'with id', id, 'not found');
      return null;
    }
    Logger.info(this.model.name, 'found', record);

    return record
  }

  async delete(id: any) {
    Logger.info('Deleting', this.model.name, 'with id:', id);

    const record = await this.getById(id);
    if (! record) {
      Logger.warn(this.model.name, 'with id', id, 'not found');
      return null;
    }

    await this.model.destroy({ where: { id } });
    return record;
  }

  async find(attributes: Partial<T>) {
    Logger.info('Trying to find', this.model.name, 'with attributes:', attributes);

    const record = await this.model.findOne({ where: attributes as any });
    if (! record) {
      Logger.warn(this.model.name, 'not found with attributes', attributes);
      return null;
    }
    return record;
  }
}

export default BaseController
