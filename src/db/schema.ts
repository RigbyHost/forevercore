import { mysqlTable, varchar, int, text, timestamp, tinyint, bigint, mediumtext, longtext } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Users and Accounts
export const accounts = mysqlTable('accounts', {
  accountID: int('accountID').primaryKey().autoincrement(),
  userName: varchar('userName', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  registerDate: timestamp('registerDate').defaultNow(),
  isActive: tinyint('isActive').default(1),
  gjp2: varchar('gjp2', { length: 255 }),
  mS: tinyint('mS').default(0), // message settings
  frS: tinyint('frS').default(0), // friend request settings
});

export const users = mysqlTable('users', {
  userID: int('userID').primaryKey().autoincrement(),
  userName: varchar('userName', { length: 255 }).notNull(),
  isRegistered: tinyint('isRegistered').default(0),
  extID: int('extID'), // links to accounts.accountID
  gameVersion: int('gameVersion').default(22),
  coins: int('coins').default(0),
  secret: varchar('secret', { length: 255 }),
  stars: int('stars').default(0),
  demons: int('demons').default(0),
  icon: int('icon').default(1),
  color1: int('color1').default(0),
  color2: int('color2').default(3),
  color3: int('color3').default(0),
  iconType: int('iconType').default(0),
  userCoins: int('userCoins').default(0),
  special: int('special').default(0),
  accIcon: int('accIcon').default(1),
  accShip: int('accShip').default(1),
  accBall: int('accBall').default(1),
  accBird: int('accBird').default(1),
  accDart: int('accDart').default(1),
  accRobot: int('accRobot').default(1),
  accGlow: tinyint('accGlow').default(0),
  accSpider: int('accSpider').default(1),
  accExplosion: int('accExplosion').default(1),
  accSwing: int('accSwing').default(1),
  accJetpack: int('accJetpack').default(1),
  diamonds: int('diamonds').default(0),
  moons: int('moons').default(0),
  IP: varchar('IP', { length: 45 }),
  lastPlayed: timestamp('lastPlayed').defaultNow(),
  chest1time: bigint('chest1time', { mode: 'number' }).default(0),
  chest1count: int('chest1count').default(0),
  chest2time: bigint('chest2time', { mode: 'number' }).default(0),
  chest2count: int('chest2count').default(0),
  dinfo: varchar('dinfo', { length: 255 }).default(''),
  sinfo: varchar('sinfo', { length: 255 }).default(''),
  pinfo: varchar('pinfo', { length: 255 }).default(''),
});

// Levels
export const levels = mysqlTable('levels', {
  levelID: int('levelID').primaryKey().autoincrement(),
  levelName: varchar('levelName', { length: 255 }).notNull(),
  gameVersion: int('gameVersion').default(22),
  binaryVersion: int('binaryVersion').default(35),
  userName: varchar('userName', { length: 255 }).notNull(),
  levelDesc: text('levelDesc'),
  levelVersion: int('levelVersion').default(1),
  levelLength: int('levelLength').default(0),
  audioTrack: int('audioTrack').default(0),
  auto: tinyint('auto').default(0),
  password: varchar('password', { length: 10 }),
  original: int('original').default(0),
  twoPlayer: tinyint('twoPlayer').default(0),
  songID: int('songID').default(0),
  objects: int('objects').default(0),
  coins: int('coins').default(0),
  requestedStars: int('requestedStars').default(0),
  extraString: varchar('extraString', { length: 255 }),
  levelString: longtext('levelString'),
  levelInfo: varchar('levelInfo', { length: 255 }),
  secret: varchar('secret', { length: 255 }),
  uploadDate: timestamp('uploadDate').defaultNow(),
  updateDate: timestamp('updateDate').defaultNow(),
  userID: int('userID').notNull(),
  extID: int('extID'), // account ID
  unlisted: tinyint('unlisted').default(0),
  unlisted2: tinyint('unlisted2').default(0),
  hostname: varchar('hostname', { length: 255 }),
  isLDM: tinyint('isLDM').default(0),
  wt: int('wt').default(0),
  wt2: int('wt2').default(0),
  settingsString: varchar('settingsString', { length: 255 }),
  songIDs: varchar('songIDs', { length: 255 }),
  sfxIDs: varchar('sfxIDs', { length: 255 }),
  ts: bigint('ts', { mode: 'number' }).default(0),
  starDemon: tinyint('starDemon').default(0),
  starDemonDiff: int('starDemonDiff').default(0),
});

// Comments
export const comments = mysqlTable('comments', {
  commentID: int('commentID').primaryKey().autoincrement(),
  userName: varchar('userName', { length: 255 }).notNull(),
  comment: text('comment').notNull(),
  levelID: int('levelID').notNull(),
  userID: int('userID').notNull(),
  timeStamp: timestamp('timeStamp').defaultNow(),
  percent: int('percent').default(0),
  isSpam: tinyint('isSpam').default(0),
});

// Social features
export const friendships = mysqlTable('friendships', {
  ID: int('ID').primaryKey().autoincrement(),
  person1: int('person1').notNull(),
  person2: int('person2').notNull(),
  isNew1: tinyint('isNew1').default(0),
  isNew2: tinyint('isNew2').default(0),
});

export const friendreqs = mysqlTable('friendreqs', {
  ID: int('ID').primaryKey().autoincrement(),
  accountID: int('accountID').notNull(),
  toAccountID: int('toAccountID').notNull(),
  comment: varchar('comment', { length: 255 }),
  uploadDate: timestamp('uploadDate').defaultNow(),
});

export const blocks = mysqlTable('blocks', {
  ID: int('ID').primaryKey().autoincrement(),
  person1: int('person1').notNull(),
  person2: int('person2').notNull(),
});

export const messages = mysqlTable('messages', {
  messageID: int('messageID').primaryKey().autoincrement(),
  subject: varchar('subject', { length: 255 }).notNull(),
  body: mediumtext('body').notNull(),
  accID: int('accID').notNull(),
  userID: int('userID').notNull(),
  userName: varchar('userName', { length: 255 }).notNull(),
  toAccountID: int('toAccountID').notNull(),
  secret: varchar('secret', { length: 255 }),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Scores
export const levelscores = mysqlTable('levelscores', {
  ID: int('ID').primaryKey().autoincrement(),
  accountID: int('accountID').notNull(),
  levelID: int('levelID').notNull(),
  percent: int('percent').notNull(),
  uploadDate: timestamp('uploadDate').defaultNow(),
});

// Game content
export const songs = mysqlTable('songs', {
  songID: int('songID').primaryKey(),
  name: varchar('name', { length: 255 }),
  authorID: int('authorID'),
  authorName: varchar('authorName', { length: 255 }),
  size: varchar('size', { length: 20 }),
  isDisabled: tinyint('isDisabled').default(0),
  download: varchar('download', { length: 512 }),
  hash: varchar('hash', { length: 255 }),
  reuploadTime: timestamp('reuploadTime').defaultNow(),
  originalLink: varchar('originalLink', { length: 512 }),
});

export const sfx = mysqlTable('sfx', {
  sfxID: int('sfxID').primaryKey(),
  name: varchar('name', { length: 255 }),
  authorName: varchar('authorName', { length: 255 }),
  size: varchar('size', { length: 20 }),
  download: varchar('download', { length: 512 }),
  hash: varchar('hash', { length: 255 }),
  reuploadTime: timestamp('reuploadTime').defaultNow(),
});

export const mappacks = mysqlTable('mappacks', {
  ID: int('ID').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  levels: varchar('levels', { length: 255 }).notNull(),
  stars: int('stars').default(0),
  coins: int('coins').default(0),
  difficulty: int('difficulty').default(0),
  rgbcolors: varchar('rgbcolors', { length: 255 }),
  colors2: varchar('colors2', { length: 255 }),
});

export const gauntlets = mysqlTable('gauntlets', {
  ID: int('ID').primaryKey().autoincrement(),
  level1: int('level1').notNull(),
  level2: int('level2').notNull(),
  level3: int('level3').notNull(),
  level4: int('level4').notNull(),
  level5: int('level5').notNull(),
});

// System
export const actions = mysqlTable('actions', {
  ID: int('ID').primaryKey().autoincrement(),
  type: int('type').notNull(),
  value: varchar('value', { length: 255 }),
  timestamp: timestamp('timestamp').defaultNow(),
  account: int('account'),
  value2: varchar('value2', { length: 255 }),
  value3: varchar('value3', { length: 255 }),
  value4: varchar('value4', { length: 255 }),
  value5: varchar('value5', { length: 255 }),
  value6: varchar('value6', { length: 255 }),
});

export const roles = mysqlTable('roles', {
  ID: int('ID').primaryKey().autoincrement(),
  accountID: int('accountID').notNull(),
  roleID: int('roleID').notNull(),
});

// Daily/Weekly content
export const dailyfeatures = mysqlTable('dailyfeatures', {
  featureID: int('featureID').primaryKey().autoincrement(),
  levelID: int('levelID').notNull(),
  type: int('type').notNull(), // 0=daily, 1=weekly
  timestamp: timestamp('timestamp').defaultNow(),
  coins: int('coins').default(0),
  orbs: int('orbs').default(0),
  diamonds: int('diamonds').default(0),
});

// User level lists
export const lists = mysqlTable('lists', {
  listID: int('listID').primaryKey().autoincrement(),
  listName: varchar('listName', { length: 255 }).notNull(),
  listDesc: text('listDesc'),
  listVersion: int('listVersion').default(1),
  listLevels: text('listLevels').notNull(), // comma-separated level IDs
  userName: varchar('userName', { length: 255 }).notNull(),
  userID: int('userID').notNull(),
  accountID: int('accountID'),
  uploadDate: timestamp('uploadDate').defaultNow(),
  updateDate: timestamp('updateDate').defaultNow(),
  likes: int('likes').default(0),
  downloads: int('downloads').default(0),
  difficulty: int('difficulty').default(0),
  icon: int('icon').default(0),
  color1: int('color1').default(0),
  color2: int('color2').default(0),
  unlisted: tinyint('unlisted').default(0),
});

// Account saves/backup data
export const accountsaves = mysqlTable('accountsaves', {
  saveID: int('saveID').primaryKey().autoincrement(),
  accountID: int('accountID').notNull(),
  saveData: longtext('saveData'),
  CCGameManager: longtext('CCGameManager'),
  CCLocalLevels: longtext('CCLocalLevels'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Relations
export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.accountID],
    references: [users.extID],
  }),
  messages: many(messages),
  friendRequests: many(friendreqs),
  scores: many(levelscores),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  account: one(accounts, {
    fields: [users.extID],
    references: [accounts.accountID],
  }),
  levels: many(levels),
  comments: many(comments),
}));

export const levelsRelations = relations(levels, ({ one, many }) => ({
  author: one(users, {
    fields: [levels.userID],
    references: [users.userID],
  }),
  comments: many(comments),
  scores: many(levelscores),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  level: one(levels, {
    fields: [comments.levelID],
    references: [levels.levelID],
  }),
  author: one(users, {
    fields: [comments.userID],
    references: [users.userID],
  }),
}));