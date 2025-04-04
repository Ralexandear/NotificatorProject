import fs from 'fs';

const path = 'config.json'

const rawData = fs.readFileSync(path, 'utf8'); 
const config = JSON.parse(rawData);
    
const updateConfig = () => fs.writeFileSync(path, JSON.stringify(config, null, 2))

export class Configuration {
  static get tdjson_path() {
    return config.tdjson_path as string
  }

  static get delivery_time() {
    return config.delivery_time as number
  }

  static get admin_ids() {
    return config.admin_ids as number[]
  }

  static get target_group_id() {
    return config.target_group_id as number
  }

  static set target_group_id(id: number) {
    config.target_group_id = id
    updateConfig()
  }

  static get test_group_id() {
    return config.test_group_id as number
  }

  static set test_group_id(id: number) {
    config.test_group_id = id
    updateConfig()
  }

  static get use_test() {
    return config.use_test as boolean;
  }

  static set use_test(bool: boolean) {
    config.use_test = bool;
    updateConfig()
  }

  static set delivery_time(timeInMinutes: number) {
    config.delivery_time = timeInMinutes
    updateConfig()
  }
}

