"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var md5_1 = __importDefault(require("md5"));
var _ = __importStar(require("lodash"));
var defaultControl = {
    _id: 'control',
    version: '',
    locked: true,
    updateAt: new Date(),
};
var Migrations = /** @class */ (function () {
    function Migrations() {
    }
    Migrations.config = function (statusCollection, listCollection, options) {
        if (options === void 0) { options = this.options; }
        if (!statusCollection || !listCollection) {
            throw new Error('Please provide status and list mongo colletions');
        }
        this._statusCollection = statusCollection;
        this._listCollection = listCollection;
        this.options = _.extend({}, this.options, options);
    };
    Migrations._getControl = function () {
        return __awaiter(this, void 0, void 0, function () {
            var control, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this._statusCollection) {
                            throw new Error('Status collection not defined.');
                        }
                        return [4 /*yield*/, this._statusCollection.findOne({})];
                    case 1:
                        control = _b.sent();
                        _a = control;
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._setControl({ version: '', locked: false })];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3: return [2 /*return*/, _a];
                }
            });
        });
    };
    Migrations._setControl = function (control) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._statusCollection) {
                            throw new Error('Status collection not defined.');
                        }
                        data = {
                            version: control.version,
                            locked: control.locked,
                            updateAt: new Date(),
                        };
                        return [4 /*yield*/, this._statusCollection.updateOne({}, { $set: data }, { upsert: true })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._statusCollection.findOne({})];
                    case 2: return [2 /*return*/, (_a.sent()) || defaultControl];
                }
            });
        });
    };
    Migrations._findIndexByVersion = function (version) {
        if (version === '') {
            return -1;
        }
        for (var i = 0; i < this._list.length; i++) {
            if (this._list[i].version === version)
                return i;
        }
        throw new Error("Can't find migration version " + version);
    };
    Migrations.getExecutedVersions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var executedScripts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._listCollection) {
                            throw new Error('List collection not defined.');
                        }
                        return [4 /*yield*/, this._listCollection.find({}).toArray()];
                    case 1:
                        executedScripts = _a.sent();
                        return [2 /*return*/, executedScripts
                                .map(function (item) { return item.version; })
                                .map(function (a) { return a.replace(/\d+/g, function (n) { return (+Number.parseInt(n) + 100000).toString(); }); })
                                .sort()
                                .map(function (a) { return a.replace(/\d+/g, function (n) { return (+Number.parseInt(n) - 100000).toString(); }); })];
                }
            });
        });
    };
    Migrations._getAddedAllVersions = function () {
        return this._list
            .map(function (item) { return item.version; })
            .map(function (a) { return a.replace(/\d+/g, function (n) { return (+Number.parseInt(n) + 100000).toString(); }); })
            .sort()
            .map(function (a) { return a.replace(/\d+/g, function (n) { return (+Number.parseInt(n) - 100000).toString(); }); });
    };
    Migrations.findVersionsToExecute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var versions, executedVersions, versionsToExecute;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._listCollection) {
                            throw new Error('List collection not defined.');
                        }
                        versions = this._list.map(function (item) { return item.version; });
                        return [4 /*yield*/, this.getExecutedVersions()];
                    case 1:
                        executedVersions = _a.sent();
                        versionsToExecute = versions.filter(function (item) { return executedVersions.indexOf(item) < 0; });
                        return [2 /*return*/, versionsToExecute];
                }
            });
        });
    };
    Migrations._checkIfOldVersionScriptAdded = function (versions) {
        return __awaiter(this, void 0, void 0, function () {
            var check, list, executedVersions, lastScriptIndex;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        check = false;
                        list = [];
                        return [4 /*yield*/, this.getExecutedVersions()];
                    case 1:
                        executedVersions = _a.sent();
                        lastScriptIndex = this._findIndexByVersion(_.last(executedVersions) || '');
                        versions.forEach(function (version) {
                            if (_this._findIndexByVersion(version) < lastScriptIndex) {
                                check = true;
                                list.push(version);
                            }
                        });
                        return [2 /*return*/, { check: check, list: list }];
                }
            });
        });
    };
    Migrations._checkIfOldVersionScriptUpdated = function () {
        return __awaiter(this, void 0, void 0, function () {
            var check, list, oldMigrations;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._listCollection) {
                            throw new Error('List collection not defined.');
                        }
                        check = false;
                        list = [];
                        return [4 /*yield*/, this._listCollection.find({}).toArray()];
                    case 1:
                        oldMigrations = _a.sent();
                        oldMigrations.forEach(function (migration) {
                            var run = migration.run, version = migration.version;
                            var matchingMigration = _this._list.find(function (item) { return item.version === version; });
                            if (!matchingMigration) {
                                check = true;
                                list.push(version);
                            }
                            else if (run !== md5_1.default(matchingMigration.run.toString())) {
                                check = true;
                                list.push(matchingMigration.version);
                            }
                        });
                        return [2 /*return*/, { check: check, list: list }];
                }
            });
        });
    };
    Migrations._insertSuccessfullyRanMigration = function (migration, rerun) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                if (!this._listCollection) {
                    throw new Error('List collection not defined.');
                }
                data = {
                    run: md5_1.default(migration.run.toString()),
                    atDate: new Date(),
                    name: migration.name,
                    version: migration.version,
                };
                this._listCollection.updateOne({ version: data.version }, { $set: data }, { upsert: true });
                return [2 /*return*/];
            });
        });
    };
    Migrations.reset = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._list = [];
                        if (!this._listCollection || !this._statusCollection) {
                            throw new Error('List or Status collection not defined.');
                        }
                        return [4 /*yield*/, this._statusCollection.remove({})];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._listCollection.remove({})];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Migrations.status = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getControl()];
                    case 1: return [2 /*return*/, (_a.sent()).locked];
                }
            });
        });
    };
    Migrations.lock = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._statusCollection) {
                            throw new Error('Status collection not defined.');
                        }
                        return [4 /*yield*/, this._statusCollection.updateOne({}, { $set: { locked: true } })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Migrations.unlock = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._statusCollection) {
                            throw new Error('Status collection not defined.');
                        }
                        return [4 /*yield*/, this._statusCollection.updateOne({}, { $set: { locked: false } })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Migrations.add = function (migration) {
        var version = migration.version, run = migration.run, name = migration.name;
        if (typeof run !== 'function')
            throw new Error('Migration must supply an run function.');
        if (typeof name !== 'string')
            throw new Error('Migration must supply an name as string.');
        if (!isFormatedVersion(version))
            throw new Error('Supplied version: ' + version + '. Migration must supply a version number as string (eg. 0.0.0_0).');
        if (this._list.find(function (item) { return item.version === migration.version; }))
            throw new Error('Migrations error: Found two migrations with same version.');
        // Freeze the migration object to make it hereafter immutable
        Object.freeze(migration);
        this._list.push(migration);
    };
    Migrations.migrateTo = function (command) {
        return __awaiter(this, void 0, void 0, function () {
            var versionsToExecute, rerun, oldVersionScripts, oldVersionUpdated;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getControl()];
                    case 1:
                        if ((_a.sent()).locked) {
                            console.info('Not migrating, control is locked.');
                            return [2 /*return*/];
                        }
                        if (_.isUndefined(command) || command === '')
                            throw new Error('Cannot migrate using invalid command: ' + command);
                        if (this._list.length === 0) {
                            console.info('Cannot migrate : No migration script found.');
                            return [2 /*return*/];
                        }
                        this.lock();
                        this._list = this._list
                            .map(function (m) { return m.version; })
                            .map(function (a) { return a.replace(/\d+/g, function (n) { return (+Number.parseInt(n) + 100000).toString(); }); })
                            .sort()
                            .map(function (a) { return a.replace(/\d+/g, function (n) { return (+Number.parseInt(n) - 100000).toString(); }); })
                            .map(function (version) {
                            var migration = _this._list.find(function (m) { return m.version === version; });
                            if (migration) {
                                return migration;
                            }
                            throw new Error('Migration not found.');
                        });
                        versionsToExecute = [];
                        rerun = false;
                        if (!(command === 'latest')) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.findVersionsToExecute()];
                    case 2:
                        versionsToExecute = _a.sent();
                        return [4 /*yield*/, this._checkIfOldVersionScriptAdded(versionsToExecute)];
                    case 3:
                        oldVersionScripts = _a.sent();
                        if (oldVersionScripts.check && this.options.stopIfOldVersionScriptAdded) {
                            console.info('Cannot migrate : Old version script found. Version: ' + oldVersionScripts.list.join(', '));
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this._checkIfOldVersionScriptUpdated()];
                    case 4:
                        oldVersionUpdated = _a.sent();
                        if (oldVersionUpdated.check && this.options.stopIfOldVersionScriptUpdated) {
                            console.info('Cannot migrate : Old version script updated. Version: ' + oldVersionUpdated.list.join(', '));
                            return [2 /*return*/];
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        if (isFormatedVersion(command) && this._findIndexByVersion(command) > -1) {
                            versionsToExecute = [command];
                            rerun = true;
                        }
                        else {
                            throw new Error('Cannot migrate using invalid command: ' + command);
                        }
                        _a.label = 6;
                    case 6: return [4 /*yield*/, this._migrateTo(versionsToExecute, rerun)];
                    case 7:
                        _a.sent();
                        console.info('Finished migrating.');
                        this.unlock();
                        return [2 /*return*/];
                }
            });
        });
    };
    Migrations._migrateTo = function (versions, rerun) {
        if (rerun === void 0) { rerun = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _i, versions_1, version;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (_.isEmpty(versions)) {
                            console.info('Not migrating, no new script found.');
                            this.unlock();
                            return [2 /*return*/];
                        }
                        if (!rerun) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._migrate(this._findIndexByVersion(versions[0]), rerun)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 2:
                        _i = 0, versions_1 = versions;
                        _a.label = 3;
                    case 3:
                        if (!(_i < versions_1.length)) return [3 /*break*/, 6];
                        version = versions_1[_i];
                        return [4 /*yield*/, this._migrate(this._findIndexByVersion(version))];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [4 /*yield*/, this._setControl({ version: _.last(versions) || '', locked: false })];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Migrations._migrate = function (index, rerun) {
        if (rerun === void 0) { rerun = false; }
        return __awaiter(this, void 0, void 0, function () {
            function scriptName() {
                return ' (' + migration.name + ')';
            }
            var migration, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        migration = this._list[index];
                        console.info('Running version: ' +
                            migration.version +
                            scriptName());
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, migration.run(migration)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._insertSuccessfullyRanMigration(migration, rerun)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        throw new Error('Cannot migrate: Error while migrating script: ' + migration.version + '\nError Stack: ' + e_1);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Migrations.saveMigrationWithoutRunning = function (version) {
        return __awaiter(this, void 0, void 0, function () {
            var migration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.lock()];
                    case 1:
                        _a.sent();
                        if (!isFormatedVersion(version)) {
                            throw new Error('Supplied version: ' + version + '. Parameter must supply a version number as string (eg. 0.0.0_0).');
                        }
                        if (this._findIndexByVersion(version) === -1) {
                            throw new Error('Supplied version: ' + version + ' does not exist.');
                        }
                        migration = this._list.find(function (migration) { return migration.version === version; });
                        if (!migration) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._insertSuccessfullyRanMigration(migration, false)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._setControl({ version: version, locked: false })];
                    case 3:
                        _a.sent();
                        console.log('Successfully saved Migration version: ' + version + ' to database.');
                        return [3 /*break*/, 5];
                    case 4:
                        console.log('Migration version: ' + version + ' not found');
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.unlock()];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Migrations._list = [];
    Migrations._statusCollection = null;
    Migrations._listCollection = null;
    Migrations.options = {
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
    };
    return Migrations;
}());
function isFormatedVersion(version) {
    var pattern = /^\d+[\.]\d+[\.]\d+[_]\d+$/;
    return pattern.test(version);
}
;
module.exports = Migrations;
//# sourceMappingURL=index.js.map