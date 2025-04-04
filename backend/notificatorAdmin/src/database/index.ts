import 'dotenv/config'
import { DataTypes } from "sequelize";
import { PointSequelizeModel } from "./models/Point";
import postgres from "./postgres";
import sequelize from "sequelize";
import { IS_PRODUCTION } from '../constants';
import { LabomatixOrderSequelizeModel } from './models/LabomatixOrder';
import { mongoConnectionPromise } from './mongo';
import Logger from '../Logger';
import { ShopSequelizeModel } from './models/Shop';
import { LogisticSchemaSequelizeModel } from './models/LogisticSchema';

const id = {type: DataTypes.INTEGER, autoIncrement: true, unique: true, primaryKey: true}

PointSequelizeModel.init(
  {
    id,
    name: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      key: 'is_active',
    }

  }, {
    sequelize: postgres,
    tableName: 'points',
  }
);

LabomatixOrderSequelizeModel.init(
  {
    id,
    messageId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      key: 'message_id',
      unique: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    mongoUpdateId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      key: 'mongo_update_id'
    },
    packetNumber: {
      type: DataTypes.BIGINT,
      key: 'packet_number'
    },
    orderDateTime: {
      type: DataTypes.DATE,
    },
    shopId: {
      type: DataTypes.INTEGER,
    }
  }, {
    sequelize: postgres,
    tableName: 'labomatix_orders'
  }
)

ShopSequelizeModel.init(
  {
    id,
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    alterName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      key: 'alter_name'
    },
  }, {
    sequelize: postgres,
    tableName: 'shops'
  }
)

LogisticSchemaSequelizeModel.init(
  {
    id,
    day: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pointId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      key: 'point_id'
    },
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      key: 'shop_id'
    }
  }, {
    sequelize: postgres,
    tableName: 'logistic_schema'
  }
)


export const databaseInitializationPromise = (async () => {
  Logger.log('Waiting for mongo')
  await mongoConnectionPromise
  Logger.log('Waiting for postgres')
  await postgres.authenticate()
  await postgres.sync()

  const models = [PointSequelizeModel, LabomatixOrderSequelizeModel, ShopSequelizeModel, LogisticSchemaSequelizeModel] 

  for (const model of models) {
    await model.sync({alter: ! IS_PRODUCTION})
  }

  Logger.log('Database initialized')
})();