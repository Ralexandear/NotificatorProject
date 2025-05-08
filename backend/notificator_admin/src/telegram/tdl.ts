import * as tdl from 'tdl';
import { API_HASH, API_ID } from '../constants';
import { Configuration } from '../Configuration';
import Logger from '../shared/utils/Logger';

tdl.configure({
  tdjson: Configuration.tdjson_path,
  // verbosityLevel: 1
})

const userBotConfig = {
  apiId: API_ID, 
  apiHash: API_HASH,
  useTestDc: false,
  skipOldUpdates: true,
  tdlibParameters: {
    use_message_database: false,
    system_language_code: 'en',
    application_version: '0.1',
    device_model: 'Notificator / admin',
    system_version: 'Ubuntu',
    database_directory: '_td_db',
    file_directory: '_td_files'
  },
}

const adminBotConfig = {
  apiId: API_ID, 
  apiHash: API_HASH,
  useTestDc: false,
  skipOldUpdates: true,
  tdlibParameters: {
    use_message_database: false,
    system_language_code: 'en',
    application_version: '0.1',
    device_model: 'Notificator / admin',
    system_version: 'Ubuntu',
    database_directory: '_bot_td_db',
    file_directory: '_bot_td_files'
  },
}


export const userBotClient = tdl.createClient(userBotConfig);
export const adminBotClient = tdl.createClient(adminBotConfig);

[userBotClient, adminBotClient].forEach(client => {
  client.on('error', (error) => {
    Logger.error(error)
  });
})

userBotClient.invoke({
  _: 'setLogStream',
  log_stream: {
      _: 'logStreamFile',
      path: 'bot_tdlib.log', // Replace with your desired log file path
      max_file_size: 52428800 // 50mb
  }
});

adminBotClient.invoke({
  _: 'setLogStream',
  log_stream: {
      _: 'logStreamFile',
      path: 'tdlib.log', // Replace with your desired log file path
      max_file_size: 52428800 // 50 mb
  }
});


// userBotClient.login().then(() => userBotClient.invoke({_: 'getMe'})).then(console.log)