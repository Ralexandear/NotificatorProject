import { MongoClient, ObjectId } from "mongodb";
import Logger from "../shared/utils/Logger";
import { FatalError } from "../shared/errors/FatalError";

// URL подключения
const url = "mongodb://localhost:27017";
// Имя базы данных
const dbName = "notificator";

const client = new MongoClient(url);

Logger.log("Connecting to MongoDB");

// Добавляем функцию ожидания подключения
const connectToMongo = async () => {
  while (true) {
    try {
      await client.connect();
      Logger.log("Connected to MongoDB");
      break;
    } catch (error) {
      Logger.warn("Waiting for MongoDB...");
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Ожидание 3 секунды
    }
  }
};

// Основной Promise подключения с встроенным механизмом ожидания
export const mongoConnectionPromise = connectToMongo().then(async () => {
  const db = client.db(dbName);
  const userbotCollection = db.collection("userbot_updates");
  const botCollection = db.collection('bot_updates')

  try {
    for (const collection of [userbotCollection, botCollection]) {
      await collection.createIndex(
        { timestamp: 1 },
        { expireAfterSeconds: 3 * 24 * 60 * 60 } // 3 дня
      );
    }
    Logger.info("TTL index created successfully");
  } catch (indexError) {
    Logger.error("Error creating TTL index:", indexError);
  }

  return { userbotCollection, botCollection };
}).catch((error) => {
  Logger.error("MONGO Error of connection:", error);
  throw new FatalError("MongoDB connection error");
});

// Функция сохранения данных в MongoDB
export async function saveUserbotUpdateToMongo(update: { [key: string]: any }) {
  try {
    const { userbotCollection: collection } = await mongoConnectionPromise;

    // Устанавливаем текущую временную метку, если не указана
    update.timestamp = update.timestamp || new Date();

    const result = await collection.insertOne(update);
    Logger.info("MONGO update saved successfully", result.insertedId);
    return result.insertedId
  } catch (error) {
    Logger.error("MONGO Error of saving data:", error);
  }
}

export async function savebotUpdateToMongo(update: { [key: string]: any }) {
  try {
    const { botCollection: collection } = await mongoConnectionPromise;

    // Устанавливаем текущую временную метку, если не указана
    update.timestamp = update.timestamp || new Date();

    const result = await collection.insertOne(update);
    Logger.info("MONGO update saved successfully", result.insertedId);

    return (result.insertedId as ObjectId)
  } catch (error) {
    Logger.error("MONGO Error of saving data:", error);
  }
}
