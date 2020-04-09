import md5 from 'md5';
import * as _ from 'lodash';
import { Collection } from 'mongodb';

interface IMigration {
  version: string;
  name: string;
  run: (migration: IMigration) => void;
}

interface IOptions {
  log?: boolean;
  logger?: null | Function;
  logIfLatest?: boolean;
  stopIfOldVersionScriptAdded?: boolean;
  stopIfOldVersionScriptUpdated?: boolean;
}

interface IListCollection {
  version: string;
  name: string;
  run: string;
  atDate: Date;
}

interface IStatusCollection {
  _id: string;
  version: string;
  locked: boolean;
  updateAt: Date;
}

const defaultControl: IStatusCollection = {
  _id: 'control',
  version: '',
  locked: true,
  updateAt: new Date(),
}

class Migrations {
  static _list: IMigration[] = [];
  static _statusCollection: Collection<IStatusCollection> | null = null;
  static _listCollection: Collection<IListCollection> | null = null;
  static options: IOptions = {
    // false disables logging
    log: true,
    // null or a function
    logger: null,
    // enable/disable info log "already at latest."
    logIfLatest: true,
    // stop if old version script added
    stopIfOldVersionScriptAdded: true,
    // stop if old version script updated
    stopIfOldVersionScriptUpdated: true
  }

  static config(statusCollection: Collection<IStatusCollection>, listCollection: Collection<IListCollection>, options: IOptions = this.options) {
    if (!statusCollection || !listCollection) {
      throw new Error('Please provide status and list mongo colletions');
    }
    this._statusCollection = statusCollection;
    this._listCollection = listCollection;
    this.options = _.extend({}, this.options, options);
  }

  private static async _getControl(): Promise<IStatusCollection> {
    if (!this._statusCollection) {
      throw new Error('Status collection not defined.');
    }
    let control = await this._statusCollection.findOne({});
    return control || await this._setControl({ version: '', locked: false });
  }

  private static async _setControl(control: { version: string, locked: boolean }): Promise<IStatusCollection> {
    if (!this._statusCollection) {
      throw new Error('Status collection not defined.');
    }
    let data = {
      version: control.version,
      locked: control.locked,
      updateAt: new Date(),
    };

    await this._statusCollection.updateOne(
      {},
      { $set: data },
      { upsert: true },
    );

    return await this._statusCollection.findOne({}) || defaultControl;
  }

  static _findIndexByVersion(version: string) {
    if (version === '') {
      return -1;
    }
    for (let i = 0; i < this._list.length; i++) {
      if (this._list[i].version === version) return i;
    }

    throw new Error("Can't find migration version " + version);
  }

  static async _getExecutedVersions(): Promise<string[]> {
    if (!this._listCollection) {
      throw new Error('List collection not defined.');
    }
    const executedScripts: IListCollection[] = await this._listCollection.find({}).toArray();
    return executedScripts
      .map((item: IListCollection) => item.version)
      .map(a => a.replace(/\d+/g, n => (+Number.parseInt(n) + 100000).toString()))
      .sort()
      .map(a => a.replace(/\d+/g, n => (+Number.parseInt(n) - 100000).toString()));
  }

  static _getAddedAllVersions() {
    return this._list
      .map((item: IMigration) => item.version)
      .map(a => a.replace(/\d+/g, n => (+Number.parseInt(n) + 100000).toString()))
      .sort()
      .map(a => a.replace(/\d+/g, n => (+Number.parseInt(n) - 100000).toString()));
  }

  static async _findVersionsToExecute(): Promise<string[]> {
    if (!this._listCollection) {
      throw new Error('List collection not defined.');
    }
    const versions = this._list.map((item: IMigration) => item.version);
    const executedVersions = await this._getExecutedVersions();
    const versionsToExecute = versions.filter(item => executedVersions.indexOf(item) < 0);
    return versionsToExecute;
  }

  private static async _checkIfOldVersionScriptAdded(versions: string[]) {
    let check = false;
    const list: string[] = [];
    const executedVersions = await this._getExecutedVersions();
    const lastScriptIndex = this._findIndexByVersion(_.last(executedVersions) || '');
    versions.forEach((version) => {
      if (this._findIndexByVersion(version) < lastScriptIndex) {
        check = true;
        list.push(version);
      }
    });
    return { check, list };
  }

  private static async _checkIfOldVersionScriptUpdated() {
    if (!this._listCollection) {
      throw new Error('List collection not defined.');
    }
    let check = false;
    const list: string[] = []
    const oldMigrations = await this._listCollection.find({}).toArray();
    oldMigrations.forEach((migration: IListCollection) => {
      const { run, version } = migration;
      const matchingMigration: IMigration | undefined = this._list.find(item => item.version === version);
      if (!matchingMigration) {
        check = true;
        list.push(version);
      } else if (run !== md5(matchingMigration.run.toString())) {
        check = true;
        list.push(matchingMigration.version);
      }
    });
    return { check, list };
  }

  private static async _insertSuccessfullyRanMigration(migration: IMigration, rerun: boolean) {
    if (!this._listCollection) {
      throw new Error('List collection not defined.');
    }

    const data = {
      run: md5(migration.run.toString()),
      atDate: new Date(),
      name: migration.name,
      version: migration.version,
    };
    this._listCollection.updateOne({ version: data.version }, { $set: data }, { upsert: true });
  }

  static async reset() {
    this._list = [];
    if (!this._listCollection || !this._statusCollection) {
      throw new Error('List or Status collection not defined.');
    }
    await this._statusCollection.remove({});
    await this._listCollection.remove({});
  }

  static async lock() {
    if (!this._statusCollection) {
      throw new Error('Status collection not defined.');
    }
    return await this._statusCollection.updateOne({}, { $set: { locked: true } });
  }

  static async unlock() {
    if (!this._statusCollection) {
      throw new Error('Status collection not defined.');
    }
    await this._statusCollection.updateOne({}, { $set: { locked: false } });
  }

  static add(migration: IMigration) {
    const { version, run, name } = migration;
    if (typeof run !== 'function')
      throw new Error('Migration must supply an run function.');

    if (typeof name !== 'string')
      throw new Error('Migration must supply an name as string.');

    if (!isFormatedVersion(version))
      throw new Error('Supplied version: ' + version + '. Migration must supply a version number as string (eg. 0.0.0_0).');

    if (this._list.find((item: IMigration) => item.version === migration.version))
      throw new Error('Migrations error: Found two migrations with same version.');

    // Freeze the migration object to make it hereafter immutable
    Object.freeze(migration);

    this._list.push(migration);
  }

  static async migrateTo(command: string) {
    if ((await this._getControl()).locked) {
      console.info('Not migrating, control is locked.');
      return;
    }
    if (_.isUndefined(command) || command === '')
      throw new Error('Cannot migrate using invalid command: ' + command);

    if (this._list.length === 0) {
      console.info('Cannot migrate : No migration script found.');
      return;
    }

    this.lock();

    this._list = this._list
      .map(m => m.version)
      .map(a => a.replace(/\d+/g, n => (+Number.parseInt(n) + 100000).toString()))
      .sort()
      .map(a => a.replace(/\d+/g, n => (+Number.parseInt(n) - 100000).toString()))
      .map(version => {
        const migration = this._list.find(m => m.version === version);
        if (migration) {
          return migration;
        }
        throw new Error('Migration not found.');
      });

    let versionsToExecute = [];
    let rerun = false;

    if (command === 'latest') {
      versionsToExecute = await this._findVersionsToExecute();
      const oldVersionScripts = await this._checkIfOldVersionScriptAdded(versionsToExecute);
      if (oldVersionScripts.check && this.options.stopIfOldVersionScriptAdded) {
        console.info('Cannot migrate : Old version script found. Version: ' + oldVersionScripts.list.join(', '));
        return;
      }
      const oldVersionUpdated = await this._checkIfOldVersionScriptUpdated();
      if (oldVersionUpdated.check && this.options.stopIfOldVersionScriptUpdated) {
        console.info('Cannot migrate : Old version script updated. Version: ' + oldVersionUpdated.list.join(', '));
        return;
      }
    } else if (isFormatedVersion(command) && this._findIndexByVersion(command) > -1) {
      versionsToExecute = [command];
      rerun = true;
    } else {
      throw new Error('Cannot migrate using invalid command: ' + command);
    }

    await this._migrateTo(versionsToExecute, rerun);
    console.info('Finished migrating.');
    this.unlock();
  }

  private static async _migrateTo(versions: string[], rerun: boolean = false) {
    if (_.isEmpty(versions)) {
      console.info('Not migrating, no new script found.');
      this.unlock();
      return;
    }

    if (rerun) {
      await this.migrate(this._findIndexByVersion(versions[0]), rerun);
    } else {
      for (const version of versions) {
        await this.migrate(this._findIndexByVersion(version))
      }
      await this._setControl({ version: _.last(versions) || '', locked: false });
    }
  }

  static async migrate(index: number, rerun: boolean = false) {
    let migration = this._list[index];

    function scriptName() {
      return ' (' + migration.name + ')';
    }

    console.info(
      'Running version: ' +
      migration.version +
      scriptName(),
    );
    try {
      await migration.run(migration);
      await this._insertSuccessfullyRanMigration(migration, rerun);
    } catch (e) {
      throw new Error('Cannot migrate: Error while migrating script: ' + migration.version + '\nError Stack: ' + e);
    }
  }

  static async saveMigrationWithoutRunning(version: string) {
    await this.lock();
    if (!isFormatedVersion(version)) {
      throw new Error('Supplied version: ' + version + '. Parameter must supply a version number as string (eg. 0.0.0_0).');
    }
    if (this._findIndexByVersion(version) === -1) {
      throw new Error('Supplied version: ' + version + ' does not exist.');
    }
    const migration = this._list.find(migration => migration.version === version);
    if (migration) {
      await this._insertSuccessfullyRanMigration(migration, false);
      await this._setControl({ version, locked: false });
      console.log('Successfully saved Migration version: ' + version + ' to database.');
    } else {
      console.log('Migration version: ' + version + ' not found');
    }
    await this.unlock();
  }
}

function isFormatedVersion(version: string) { // expected format: 0.0.0_0
  const pattern = /^\d+[\.]\d+[\.]\d+[_]\d+$/;
  return pattern.test(version);
};

module.exports = Migrations;
