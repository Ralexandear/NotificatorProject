import 'dotenv/config'
import { DataTypes } from "sequelize";
import { Point } from "./models/Point";
import postgres from "./postgres";
import Logger from '../shared/utils/Logger';
import { LabomatixOrder } from './models/LabomatixOrder';
import { Shop } from './models/Shop';
import { LogisticSchema } from './models/LogisticSchema';


export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

Logger.log(IS_PRODUCTION ? 'Production mode' : 'Development mode');

const id = {type: DataTypes.INTEGER, autoIncrement: true, unique: true, primaryKey: true}

Point.init(
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

LabomatixOrder.init(
  {
    id,
    messageId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      key: 'message_id',
      unique: true,
      get() {
        const rawValue = this.getDataValue('messageId');
        return rawValue !== null ? Number(rawValue) : null;
      }
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
      key: 'packet_number',
      get() {
        const rawValue = this.getDataValue('packetNumber');
        return rawValue !== null ? Number(rawValue) : null;
      }
    },
    // orderDateTime: {
    //   type: DataTypes.DATE,
    // },
    shopId: {
      type: DataTypes.INTEGER,
    }
  }, {
    sequelize: postgres,
    tableName: 'labomatix_orders'
  }
)

Shop.init(
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

LogisticSchema.init(
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
  Logger.log('Waiting for postgres')
  await postgres.authenticate()
  await postgres.sync()

  const models = [Point, LabomatixOrder, Shop, LogisticSchema] 

  for (const model of models) {
    await model.sync({alter: ! IS_PRODUCTION})
  }

  Logger.log('Database initialized')
})()
.then(async () => {
  const points = await Point.findAll();
  if (points?.length) return
  
  Logger.warn("Points list is missing in database, building default list");
  
  const pointList = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29
  ]
  .map(point => ({name: 'К' + point}));
  
  await Point.bulkCreate(pointList)
})