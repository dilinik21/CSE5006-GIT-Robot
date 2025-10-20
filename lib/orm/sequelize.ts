// lib/orm/sequelize.ts
import {
  Sequelize,
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize'
// 👇 explicitly import the native driver so bundler sees it
import sqlite3 from 'sqlite3'

function sqlitePathFromUrl(url: string | undefined) {
  if (!url) return './dev.db'
  return url.startsWith('file:') ? url.replace(/^file:/, '') : url
}

const storage = sqlitePathFromUrl(process.env.PRISMA_DB_URL)
let _sequelize: Sequelize | null = null

export function getSequelize() {
  if (_sequelize) return _sequelize
  _sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: false,
    // 👇 point Sequelize at the driver explicitly
    dialectModule: sqlite3
  })
  return _sequelize
}

export class GitCommandSequelize extends Model<
  InferAttributes<GitCommandSequelize>,
  InferCreationAttributes<GitCommandSequelize>
> {
  declare id: CreationOptional<number>
  declare username: string
  declare token: CreationOptional<string | null>
  declare owner: string
  declare repo: string
  declare command: string
  declare createdAt: CreationOptional<Date>
}

export async function initSequelizeModels() {
  const sequelize = getSequelize()

  GitCommandSequelize.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: DataTypes.TEXT, allowNull: false },
      token: { type: DataTypes.TEXT, allowNull: true },
      owner: { type: DataTypes.TEXT, allowNull: false },
      repo: { type: DataTypes.TEXT, allowNull: false },
      command: { type: DataTypes.TEXT, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      tableName: 'GitCommand',
      freezeTableName: true,
      timestamps: false,
    }
  )

  await GitCommandSequelize.sync({ alter: false })
  return { sequelize, GitCommandSequelize }
}
