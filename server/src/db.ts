import { DB } from '../native';
import path = require("path");

const db = new DB(path.join(__dirname, '../db'));

export default db;
